import { create } from "zustand";
import type { GateSlug } from "./gates";

export type ProtocolId = "handshake" | "half-adder" | "parity" | "invert";

const KEY = "xor-bench-progress";

interface Snapshot {
  checkedSteps: Record<string, number[]>;
  completedGates: GateSlug[];
  completedProtocols: ProtocolId[];
}

interface ProgressState extends Snapshot {
  toggleStep: (slug: string, index: number) => void;
  completeGate: (slug: GateSlug) => void;
  completeProtocol: (id: ProtocolId) => void;
  reset: () => void;
}

const empty: Snapshot = {
  checkedSteps: {},
  completedGates: [],
  completedProtocols: [],
};

function write(s: Snapshot) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        checkedSteps: s.checkedSteps,
        completedGates: s.completedGates,
        completedProtocols: s.completedProtocols,
      }),
    );
  } catch {
    /* private mode */
  }
}

export const useProgress = create<ProgressState>((set, get) => ({
  ...empty,
  toggleStep: (slug, index) => {
    const current = get().checkedSteps[slug] ?? [];
    const next = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index].sort((a, b) => a - b);
    const checkedSteps = { ...get().checkedSteps, [slug]: next };
    set({ checkedSteps });
    write({ ...get(), checkedSteps });
  },
  completeGate: (slug) => {
    const gates = get().completedGates;
    if (gates.includes(slug)) return;
    const completedGates = [...gates, slug];
    set({ completedGates });
    write({ ...get(), completedGates });
  },
  completeProtocol: (id) => {
    const done = get().completedProtocols;
    if (done.includes(id)) return;
    const completedProtocols = [...done, id];
    set({ completedProtocols });
    write({ ...get(), completedProtocols });
  },
  reset: () => {
    set(empty);
    write(empty);
  },
}));

export function hydrateProgress() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Partial<Snapshot>;
    useProgress.setState({
      checkedSteps: data.checkedSteps ?? {},
      completedGates: data.completedGates ?? [],
      completedProtocols: data.completedProtocols ?? [],
    });
  } catch {
    /* ignore */
  }
}
