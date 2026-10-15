# Agreement Operators and Meta-Memory Families

## The Five Meta-Memory Families

OMI organizes declarative memory into five families. Each family has a distinct role in the agreement lifecycle:

| Family | Role | Canon |
|---|---|---|
| RULES | normative invariant space | RULES constrain |
| FACTS | applied ground truth | FACTS ground |
| CLOSURES | bounded completion | CLOSURES seal |
| COMBINATORS | lawful composition | COMBINATORS compose |
| CONS | pair reduction | CONS reduce |

### RULES

A rule is a normative obligation:

```text
<omi-address>/<prefix> MUST <invariant-name>
```

Rules declare what must be true for conformance. They do not claim implementation, deployment, or test coverage.

### FACTS

A fact is a grounded rule transition:

```text
<omi-address>/<prefix> FACT <applied-fact-name>
```

A fact says a rule has been implemented, tested, and projected. The derivation from rule to fact follows the rule-to-fact derivation protocol.

### CLOSURES

A closure seals bounded completion:

```text
<omi-address>/<prefix> CLOSE <closure-name>
```

A closure says a structure is complete, bounded, or forbidden from escaping its scope. Closures enable WLOG-safe reasoning — without a closure, a rewrite is merely local.

### COMBINATORS

A combinator declares lawful transformation:

```text
<omi-address>/<prefix> COMBINE <combinator-name>
```

A combinator body defines input form, output form, and transformation properties. Combinators compose operations without validating frames by themselves.

### CONS

A cons declares pair structure:

```text
<omi-address>/<prefix> CONS <cons-name>
```

Cons records define structural pairing, nesting, dot notation, and mnemonic forms. They do not validate frames — they describe how addressed structure is assembled.

---

## The Four Channel Operators

The meta-memory families are traversed by four operators:

| Operator | Motion | Effect |
|---|---|---|
| JOIN | binds | merges families into composite structure |
| COMPOSE | orders | sequences families by dependency |
| ENCODE | lowers | reduces abstract to concrete |
| DECODE | raises | recovers abstract from concrete |

### JOIN

JOIN binds two or more meta-memory families into a composite:

```text
JOIN rules, facts       →  a rule grounded by a fact
JOIN closures, cons     →  a bounded cons structure
JOIN combinators, rules →  a composed rule transformation
```

The canonical operation: JOIN produces a composite from distinct families without collapsing their roles.

### COMPOSE

COMPOSE orders families by dependency:

```text
RULES constrain  →  COMPOSE rules before facts
FACTS ground     →  COMPOSE facts before closures
CLOSURES seal    →  COMPOSE closures before combinators
```

Composition establishes the order in which families are resolved during derivation.

### ENCODE

ENCODE lowers a family into a more concrete representation:

```text
ENCODE rule     →  fact (rule grounded in implementation)
ENCODE fact     →  closure (fact bounded by completion)
ENCODE closure  →  combinator (closure expressed as transformation)
```

Lowering preserves the abstract structure while adding concrete binding.

### DECODE

DECODE raises a concrete representation back to its abstract form:

```text
DECODE fact     →  rule (recover invariant from ground truth)
DECODE closure  →  fact (recover grounding from bounded statement)
DECODE combinator →  closure (recover boundary from composition)
```

Raising is the inverse of encoding. It allows replay and inspection to recover the abstract meaning of a concrete object.

### Operator Table

| Step | Operator | Families | Result |
|---|---|---|---|
| Bind | JOIN | RULES + FACTS | grounded obligation |
| Order | COMPOSE | RULES > FACTS > CLOSURES | derivation order |
| Lower | ENCODE | RULES → FACTS | rule-to-fact derivation |
| Raise | DECODE | FACTS → RULES | fact-to-rule recovery |
| Bind | JOIN | CLOSURES + CONS | bounded pair |
| Transform | JOIN | COMBINATORS + RULES | composed constraint |

---

## The Twelve Tribes of Agreement

The Twelve Tribes group into three quads:

| Quad | Tribe | Role |
|---|---|---|
| Foundation | Freedom | open declaration |
| Foundation | Autonomy | self-directed frame |
| Foundation | Sovereignty | bounded identity |
| Foundation | Reciprocity | mutual validation |
| Attention | Focus | object selection |
| Attention | Attention | change detection |
| Attention | Observation | evidence inspection |
| Attention | Experience | interaction memory |
| Boundary | Stop | rejection boundary |
| Boundary | Yes | acceptance signal |
| Boundary | No | refusal signal |
| Boundary | Acknowledgement | receipt acknowledgment |

The four Foundation tribes establish the preconditions for agreement. The four Attention tribes govern how a user encounters agreement surfaces. The four Boundary tribes mark the edge of agreement — acceptance, rejection, or acknowledgment.

---

## Agreement as Topological Augmentation

Agreement changes the topology of the declaration space:

```text
agreement
  → boundary
  → rule / fact / closure / combinator
  → cons relation
  → validated frame
  → receipt
  → topology update
```

Each step narrows the space of possible interpretations:

1. Agreement declares intent to form a bounded relation.
2. Boundary selects which declarations are inside the relation.
3. Meta-memory families structure the relation (rules constrain, facts ground, closures seal, combinators compose, cons pair).
4. Cons relation assembles the structure into addressed pairs.
5. Validated frame confirms the structure satisfies Q_frame.
6. Receipt records the accepted transition.
7. Topology update changes the accessible state space.

The operators move through the families to produce each step:

```text
JOIN   → binds families into agreement boundary
COMPOSE → orders families for derivation
ENCODE → lowers agreement into receipt
DECODE → recovers agreement from receipt
```

---

## Operator-Memory Matrix

Every operator can act on every meta-memory family:

| Operator | RULES | FACTS | CLOSURES | COMBINATORS | CONS |
|---|---|---|---|---|---|
| JOIN | bind rules | bind facts | bind closures | bind combinators | bind cons pairs |
| COMPOSE | order rules | order facts | order closures | order combinators | order cons pairs |
| ENCODE | lower rule to fact | lower fact to closure | lower closure to combinator | lower combinator to cons | lower cons to frame |
| DECODE | recover rule from fact | recover fact from closure | recover closure from combinator | recover combinator from cons | recover cons from frame |

---

## Relationship to the Agreement Pipeline

The operators and families are not a replacement for the agreement pipeline (`validate → resolve → record → materialize → project → inspect`). They are the meta-level semantics that explain what the pipeline operates on:

| Pipeline Step | Operator | Family |
|---|---|---|
| Reader recognizes | DECODE | any family → candidate |
| Resolver promotes | JOIN | families → composite candidate |
| Validation checks | ENCODE | candidate → frame |
| Resolution proves | COMPOSE | rules before facts |
| Receipt records | JOIN | frame + receipt → stored fact |
| Materializer applies | ENCODE | rule address → applied state |
| Projection displays | DECODE | stored state → visible form |
| Inspection explains | DECODE | receipt → replay path |

---

## Canonical Statement

```text
RULES constrain.
FACTS ground.
CLOSURES seal.
COMBINATORS compose.
CONS reduce.

JOIN binds.
COMPOSE orders.
ENCODE lowers.
DECODE raises.

Foundation: Freedom, Autonomy, Sovereignty, Reciprocity.
Attention: Focus, Attention, Observation, Experience.
Boundary: Stop, Yes, No, Acknowledgement.

Agreement is topological augmentation.
Operators move through families.
Families structure the bounded surface.
Receipt records the topology change.
```

---

See also: [1.6 The OMI Declaration Language](../1_FOUNDATIONS/1.6_THE_OMI_DECLARATION_LANGUAGE.md), [7.1 Agreement Doctrine](7.1_AGREEMENT_DOCTRINE.md), [7.5 Rule-to-Fact Derivation](7.5_RULE_TO_FACT_DERIVATION.md), [4.2 RULES.omi](../4_NETWORK/4.2_RULES_OMI.md)
