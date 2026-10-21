// signal.ts — the pure core of WebRTC perfect negotiation.
//
// No RTCPeerConnection, no transport, no browser API: this is only the decision
// logic — given the current negotiation state and an incoming Signal, what should
// the peer DO. The browser glue (space/agent.html) executes the returned Action
// against a real RTCPeerConnection; MQTT carries the Signal messages between peers.
// Decoupled the way the rest is: the logic here can say no cold (src/testbed/
// signal.test.ts); the representation (RTCPeerConnection) and the carrier (MQTT)
// are wired separately and never confused with it.
//
// Perfect negotiation (the WebRTC standard pattern): both peers may offer at once
// (glare). One peer is "polite" and yields — rolls back and accepts the other's
// offer; the "impolite" peer ignores the colliding offer. Who is polite is decided
// from the two tags, so both sides agree without asking.

export type Description = { type: 'offer' | 'answer'; sdp: string };

export type Signal =
  | { kind: 'description'; from: string; description: Description }
  | { kind: 'candidate'; from: string; candidate: string };

export type NegState = {
  polite: boolean;                    // the polite peer yields on collision
  makingOffer: boolean;               // we are mid-offer (createOffer in flight)
  stable: boolean;                    // signalingState === 'stable'
  ignoring: boolean;                  // we chose to ignore the current offer (impolite collision)
};

export type Action =
  | { do: 'answer' }                  // setRemoteDescription(offer) then create+send an answer
  | { do: 'rollback-then-answer' }    // polite collision: rollback our offer, accept theirs, answer
  | { do: 'accept-answer' }           // setRemoteDescription(answer)
  | { do: 'ignore'; why: string }     // impolite collision: drop the incoming offer
  | { do: 'add-candidate'; candidate: string }
  | { do: 'drop-candidate'; why: string };

/** Who is polite, decided from the two tags so both peers agree without coordination.
 *  The tag that sorts first is polite (deterministic, symmetric: each computes the same). */
export function politeByTag(self: string, other: string): boolean {
  if (self === other) throw new RangeError('a peer cannot negotiate with itself');
  return self < other;
}

/** The decision for one incoming Signal. Pure: same state+signal → same result. */
export function onSignal(state: NegState, sig: Signal): { action: Action; state: NegState } {
  if (sig.kind === 'candidate') {
    // a candidate that arrives while we are ignoring the offer it belongs to is dropped
    return state.ignoring
      ? { action: { do: 'drop-candidate', why: 'ignoring the colliding offer' }, state }
      : { action: { do: 'add-candidate', candidate: sig.candidate }, state };
  }

  const d = sig.description;
  if (d.type === 'answer') {
    return { action: { do: 'accept-answer' }, state: { ...state, stable: true, makingOffer: false, ignoring: false } };
  }

  // an offer. collision (glare) when we are mid-offer or not stable.
  const collision = state.makingOffer || !state.stable;
  if (collision && !state.polite) {
    return { action: { do: 'ignore', why: 'impolite peer in a glare' }, state: { ...state, ignoring: true } };
  }
  if (collision && state.polite) {
    return { action: { do: 'rollback-then-answer' }, state: { ...state, makingOffer: false, stable: false, ignoring: false } };
  }
  return { action: { do: 'answer' }, state: { ...state, stable: false, ignoring: false } };
}
