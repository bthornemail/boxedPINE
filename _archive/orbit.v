(* Orbit table properties for XOR on 4 bits.  NOT machine-checked in the
   authoring environment (no Coq installed) -- run: coqc orbit.v *)
Require Import NArith List Bool.
Import ListNotations.
Open Scope N_scope.

(* ---- General laws (all N, no bound) ---- *)
Lemma xor_involutive : forall c n, N.lxor c (N.lxor c n) = n.
Proof. intros. rewrite <- N.lxor_assoc, N.lxor_nilpotent, N.lxor_0_l. reflexivity. Qed.

Lemma xor_comm : forall a b, N.lxor a b = N.lxor b a.
Proof. exact N.lxor_comm. Qed.

(* Order of a multiset of XOR terms is irrelevant (the "conservation" claim). *)
Lemma xor_swap3 : forall a b c, N.lxor a (N.lxor b c) = N.lxor b (N.lxor a c).
Proof. intros. rewrite N.lxor_assoc, (N.lxor_comm a b), <- N.lxor_assoc. reflexivity. Qed.

(* ---- 4-bit facts by exhaustive computation ---- *)
Definition rng : list N := map N.of_nat (seq 0 16).

(* n -> c^n is a bijection on 0..15: image is 0..15 *)
Definition closed_ok : bool :=
  forallb (fun c => forallb (fun n => N.ltb (N.lxor c n) 16) rng) rng.
Lemma closed : closed_ok = true. Proof. vm_compute. reflexivity. Qed.

Definition injective_ok : bool :=
  forallb (fun c => forallb (fun n => forallb (fun m =>
    implb (N.eqb (N.lxor c n) (N.lxor c m)) (N.eqb n m)) rng) rng) rng.
Lemma injective : injective_ok = true. Proof. vm_compute. reflexivity. Qed.

(* THE structural result: block index = hi(c)^hi(n), within-block = lo(c)^lo(n) *)
Definition decomp_ok : bool :=
  forallb (fun c => forallb (fun n =>
    N.eqb (N.lxor c n)
          (4 * N.lxor (c / 4) (n / 4) + N.lxor (c mod 4) (n mod 4))) rng) rng.
Lemma decomposition : decomp_ok = true. Proof. vm_compute. reflexivity. Qed.

(* Table row examples from the Orbit Table *)
Example row5 : map (N.lxor 5) rng = [5;4;7;6;1;0;3;2;13;12;15;14;9;8;11;10].
Proof. vm_compute. reflexivity. Qed.
Example row7_is_descending_halves :
  map (N.lxor 7) rng = [7;6;5;4;3;2;1;0;15;14;13;12;11;10;9;8].
Proof. vm_compute. reflexivity. Qed.
Example row15_is_full_reverse : map (N.lxor 15) rng = rev rng.
Proof. vm_compute. reflexivity. Qed.
