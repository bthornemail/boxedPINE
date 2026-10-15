(**
  The Null Ring closure invariant.

  Readable forms are not asserted to be textually identical. They are related
  by the same explicitly defined XOR closure result.
*)

From Coq Require Import NArith List Bool Lia.
Import ListNotations.

Open Scope N_scope.

Definition xor_reduce (xs : list N) : N :=
  fold_right N.lxor 0 xs.

Definition edge_witness (edge : N * N) : N :=
  N.lxor (fst edge) (snd edge).

Definition edge_witnesses (edges : list (N * N)) : list N :=
  map edge_witness edges.

Definition byte_ring_edges : list (N * N) :=
  [(0, 32); (32, 127); (127, 255); (255, 0)].

Definition byte_ring_witnesses : list N :=
  edge_witnesses byte_ring_edges.

Theorem xor_self_cancels :
  forall x, N.lxor x x = 0.
Proof. apply N.lxor_nilpotent. Qed.

Theorem byte_ring_witness_values :
  byte_ring_witnesses = [32; 95; 128; 255].
Proof. vm_compute; reflexivity. Qed.

Theorem byte_ring_closes_to_null :
  xor_reduce byte_ring_witnesses = 0.
Proof. vm_compute; reflexivity. Qed.

Lemma xor_reduce_app :
  forall xs ys,
    xor_reduce (xs ++ ys) = N.lxor (xor_reduce xs) (xor_reduce ys).
Proof.
  induction xs as [|x xs IH]; intro ys.
  - reflexivity.
  - simpl. rewrite IH. rewrite N.lxor_assoc. reflexivity.
Qed.

Theorem duplicated_boundary_closes :
  forall xs, xor_reduce (xs ++ xs) = 0.
Proof.
  intro xs.
  rewrite xor_reduce_app.
  apply N.lxor_nilpotent.
Qed.

Fixpoint adjacent_edges (start previous : N) (rest : list N)
  : list (N * N) :=
  match rest with
  | [] => [(previous, start)]
  | x :: xs => (previous, x) :: adjacent_edges start x xs
  end.

Definition closed_path_edges (vertices : list N) : list (N * N) :=
  match vertices with
  | [] => []
  | x :: xs => adjacent_edges x x xs
  end.

Lemma adjacent_edge_witnesses_telescope :
  forall start previous rest,
    xor_reduce (edge_witnesses (adjacent_edges start previous rest)) =
    N.lxor previous start.
Proof.
  intros start previous rest.
  revert previous.
  induction rest as [|x xs IH]; intro previous.
  - simpl. rewrite N.lxor_0_r. reflexivity.
  - simpl. rewrite IH.
    unfold edge_witness; simpl.
    rewrite N.lxor_assoc.
    rewrite <- (N.lxor_assoc x x start).
    rewrite N.lxor_nilpotent.
    rewrite N.lxor_0_l.
    reflexivity.
Qed.

Theorem every_closed_path_closes :
  forall vertices,
    xor_reduce (edge_witnesses (closed_path_edges vertices)) = 0.
Proof.
  intros [|start rest].
  - reflexivity.
  - unfold closed_path_edges.
    rewrite adjacent_edge_witnesses_telescope.
    apply N.lxor_nilpotent.
Qed.

Theorem concrete_closed_path_matches_byte_ring :
  closed_path_edges [0; 32; 127; 255] = byte_ring_edges.
Proof. reflexivity. Qed.

Theorem concrete_closed_path_closes :
  xor_reduce (edge_witnesses (closed_path_edges [0; 32; 127; 255])) = 0.
Proof. vm_compute; reflexivity. Qed.

Definition address256 (x : N) : Prop := x < N.pow 2 256.

Theorem address256_self_cancels :
  forall address,
    address256 address ->
    N.lxor address address = 0.
Proof.
  intros address _.
  apply N.lxor_nilpotent.
Qed.

Inductive NullPresentation : Type :=
| FoldedNull
| UnfoldedByteRing
| FullNotationNull.

Definition null_closure_value (presentation : NullPresentation) : N :=
  match presentation with
  | FoldedNull => N.lxor 0 0
  | UnfoldedByteRing => xor_reduce byte_ring_witnesses
  | FullNotationNull => N.lxor (N.pow 2 255) (N.pow 2 255)
  end.

Theorem all_null_presentations_share_closure :
  forall presentation, null_closure_value presentation = 0.
Proof. destruct presentation; vm_compute; reflexivity. Qed.

Theorem folded_unfolded_full_closure_equivalent :
  null_closure_value FoldedNull =
  null_closure_value UnfoldedByteRing /\
  null_closure_value UnfoldedByteRing =
  null_closure_value FullNotationNull.
Proof. vm_compute; split; reflexivity. Qed.
