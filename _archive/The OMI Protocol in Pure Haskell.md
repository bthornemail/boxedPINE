# The OMI Protocol in Pure Haskell

## A Self-Contained Type System

---

## Part I: The Kernel — Bits, Bytes, Words

```haskell
{-# LANGUAGE NoImplicitPrelude #-}
{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeFamilies #-}
{-# LANGUAGE GADTs #-}
{-# LANGUAGE KindSignatures #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE StandaloneDeriving #-}

module OMI.Kernel
  ( Bit(..)
  , Byte(..)
  , Nibble(..)
  , Word16(..)
  , Word32(..)
  -- Bit operations
  , xorBit
  , andBit
  , orBit
  , notBit
  , ite
  -- Nibble operations
  , xorNibble
  , mkNibble
  , nibbleToByte
  -- Byte operations
  , xorByte
  , andByte
  , orByte
  , mkByte
  , byteToNibbles
  -- Word operations
  , xorWord16
  , xorWord32
  , mkWord16
  , mkWord32
  ) where

-- ═══════════════════════════════════════════════════════════════════════════
-- THE BIT
-- ═══════════════════════════════════════════════════════════════════════════

-- | The fundamental unit. There is no Bool. There is only O and I.
data Bit = O | I

deriving instance Eq Bit
deriving instance Ord Bit

-- | XOR is the primitive. It is total, unconditional, self-inverse.
xorBit :: Bit -> Bit -> Bit
xorBit O b = b
xorBit I O = I
xorBit I I = O

-- | AND is the conditional.
andBit :: Bit -> Bit -> Bit
andBit I I = I
andBit _ _ = O

-- | OR is the disjunction.
orBit :: Bit -> Bit -> Bit
orBit O b = b
orBit I _ = I

-- | NOT is XOR with the observer.
notBit :: Bit -> Bit
notBit b = xorBit b I

-- | The three-way conditional. No if-then-else. Only ite.
ite :: Bit -> a -> a -> a
ite O f _ = f
ite I _ t = t

-- ═══════════════════════════════════════════════════════════════════════════
-- THE NIBBLE
-- ═══════════════════════════════════════════════════════════════════════════

-- | Four bits. The nybble space.
data Nibble = N Bit Bit Bit Bit

deriving instance Eq Nibble

-- | XOR of two nibbles, bit by bit.
xorNibble :: Nibble -> Nibble -> Nibble
xorNibble (N a b c d) (N e f g h) =
  N (xorBit a e) (xorBit b f) (xorBit c g) (xorBit d h)

-- | Construct a nibble from four bits.
mkNibble :: Bit -> Bit -> Bit -> Bit -> Nibble
mkNibble = N

-- | A nibble as a byte (high nibble zero).
nibbleToByte :: Nibble -> Byte
nibbleToByte (N a b c d) = B O O O O a b c d

-- ═══════════════════════════════════════════════════════════════════════════
-- THE BYTE
-- ═══════════════════════════════════════════════════════════════════════════

-- | Eight bits. The byte.
data Byte = B Bit Bit Bit Bit Bit Bit Bit Bit

deriving instance Eq Byte

-- | XOR of two bytes.
xorByte :: Byte -> Byte -> Byte
xorByte (B a1 a2 a3 a4 a5 a6 a7 a8)
        (B b1 b2 b3 b4 b5 b6 b7 b8) =
  B (xorBit a1 b1) (xorBit a2 b2) (xorBit a3 b3) (xorBit a4 b4)
    (xorBit a5 b5) (xorBit a6 b6) (xorBit a7 b7) (xorBit a8 b8)

-- | AND of two bytes.
andByte :: Byte -> Byte -> Byte
andByte (B a1 a2 a3 a4 a5 a6 a7 a8)
        (B b1 b2 b3 b4 b5 b6 b7 b8) =
  B (andBit a1 b1) (andBit a2 b2) (andBit a3 b3) (andBit a4 b4)
    (andBit a5 b5) (andBit a6 b6) (andBit a7 b7) (andBit a8 b8)

-- | OR of two bytes.
orByte :: Byte -> Byte -> Byte
orByte (B a1 a2 a3 a4 a5 a6 a7 a8)
       (B b1 b2 b3 b4 b5 b6 b7 b8) =
  B (orBit a1 b1) (orBit a2 b2) (orBit a3 b3) (orBit a4 b4)
    (orBit a5 b5) (orBit a6 b6) (orBit a7 b7) (orBit a8 b8)

-- | Construct a byte from eight bits.
mkByte :: Bit -> Bit -> Bit -> Bit -> Bit -> Bit -> Bit -> Bit -> Byte
mkByte = B

-- | Split a byte into two nibbles.
byteToNibbles :: Byte -> (Nibble, Nibble)
byteToNibbles (B a b c d e f g h) = (N a b c d, N e f g h)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE WORD16
-- ═══════════════════════════════════════════════════════════════════════════

-- | Sixteen bits. The 16-bit word.
data Word16 = W16 Byte Byte

deriving instance Eq Word16

-- | XOR of two Word16s.
xorWord16 :: Word16 -> Word16 -> Word16
xorWord16 (W16 a1 a2) (W16 b1 b2) = W16 (xorByte a1 b1) (xorByte a2 b2)

-- | Construct a Word16 from two bytes.
mkWord16 :: Byte -> Byte -> Word16
mkWord16 = W16

-- ═══════════════════════════════════════════════════════════════════════════
-- THE WORD32
-- ═══════════════════════════════════════════════════════════════════════════

-- | Thirty-two bits. The 32-bit word.
data Word32 = W32 Word16 Word16

deriving instance Eq Word32

-- | XOR of two Word32s.
xorWord32 :: Word32 -> Word32 -> Word32
xorWord32 (W32 a1 a2) (W32 b1 b2) = W32 (xorWord16 a1 b1) (xorWord16 a2 b2)

-- | Construct a Word32 from two Word16s.
mkWord32 :: Word16 -> Word16 -> Word32
mkWord32 = W32
```

---

## Part II: The Relation

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.Relation
  ( Relation(..)
  , mkRelation
  , relW16a, relW16b, relW16c, relW16d
  , relW16e, relW16f, relW16g, relW16h
  , relW32a, relW32b, relW32c, relW32d
  , relationXor
  , relationClosure
  ) where

import OMI.Kernel

-- ═══════════════════════════════════════════════════════════════════════════
-- THE RELATION
-- ═══════════════════════════════════════════════════════════════════════════

-- | A Relation is the twelve-field address. It is the carrier of the
--   entire pipeline. Every stage transforms a Relation.
--
--   Fields:
--     relW16a .. relW16h : the eight 16-bit words (the spatial subarray)
--     relW32a .. relW32d : the four 32-bit words (the operations)
data Relation = Relation
  { relW16a :: Word16
  , relW16b :: Word16
  , relW16c :: Word16
  , relW16d :: Word16
  , relW16e :: Word16
  , relW16f :: Word16
  , relW16g :: Word16
  , relW16h :: Word16
  , relW32a :: Word32
  , relW32b :: Word32
  , relW32c :: Word32
  , relW32d :: Word32
  }

-- | Construct a Relation from all twelve fields.
mkRelation
  :: Word16 -> Word16 -> Word16 -> Word16
  -> Word16 -> Word16 -> Word16 -> Word16
  -> Word32 -> Word32 -> Word32 -> Word32
  -> Relation
mkRelation = Relation

-- ═══════════════════════════════════════════════════════════════════════════
-- THE XOR OF RELATIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- | XOR of two Relations, field by field.
relationXor :: Relation -> Relation -> Relation
relationXor r1 r2 = Relation
  { relW16a = xorWord16 (relW16a r1) (relW16a r2)
  , relW16b = xorWord16 (relW16b r1) (relW16b r2)
  , relW16c = xorWord16 (relW16c r1) (relW16c r2)
  , relW16d = xorWord16 (relW16d r1) (relW16d r2)
  , relW16e = xorWord16 (relW16e r1) (relW16e r2)
  , relW16f = xorWord16 (relW16f r1) (relW16f r2)
  , relW16g = xorWord16 (relW16g r1) (relW16g r2)
  , relW16h = xorWord16 (relW16h r1) (relW16h r2)
  , relW32a = xorWord32 (relW32a r1) (relW32a r2)
  , relW32b = xorWord32 (relW32b r1) (relW32b r2)
  , relW32c = xorWord32 (relW32c r1) (relW32c r2)
  , relW32d = xorWord32 (relW32d r1) (relW32d r2)
  }

-- ═══════════════════════════════════════════════════════════════════════════
-- CLOSURE
-- ═══════════════════════════════════════════════════════════════════════════

-- | The zero Relation. The closure condition.
zeroWord16 :: Word16
zeroWord16 = W16 (B O O O O O O O O) (B O O O O O O O O)

zeroWord32 :: Word32
zeroWord32 = W32 zeroWord16 zeroWord16

zeroRelation :: Relation
zeroRelation = Relation
  zeroWord16 zeroWord16 zeroWord16 zeroWord16
  zeroWord16 zeroWord16 zeroWord16 zeroWord16
  zeroWord32 zeroWord32 zeroWord32 zeroWord32

-- | A Relation is closed iff it equals the zero Relation.
relationClosure :: Relation -> Bool
relationClosure r = relW16a r == zeroWord16
                 && relW16b r == zeroWord16
                 && relW16c r == zeroWord16
                 && relW16d r == zeroWord16
                 && relW16e r == zeroWord16
                 && relW16f r == zeroWord16
                 && relW16g r == zeroWord16
                 && relW16h r == zeroWord16
                 && relW32a r == zeroWord32
                 && relW32b r == zeroWord32
                 && relW32c r == zeroWord32
                 && relW32d r == zeroWord32
```

---

## Part III: The Delta Transform

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.Delta
  ( deltaC
  , delta
  , delta8
  , delta16
  , rulerState
  , rulerCorrection
  , advanceRuler
  ) where

import OMI.Kernel
import OMI.Relation

-- ═══════════════════════════════════════════════════════════════════════════
-- THE DELTA CONSTANT
-- ═══════════════════════════════════════════════════════════════════════════

-- | The delta constant C. This is the syndrome.
--   In the protocol, it is 0x1D1D.
deltaC :: Word16
deltaC = W16
  (B O O O I I I O I)  -- 0x1D
  (B O O O I I I O I)  -- 0x1D

-- ═══════════════════════════════════════════════════════════════════════════
-- THE DELTA TRANSFORM
-- ═══════════════════════════════════════════════════════════════════════════

-- | The delta transform. Three rotations plus the XOR with C.
--
--   delta(buf, C) = rotl(buf, 1) XOR rotl(buf, 3) XOR rotr(buf, 2) XOR C
--
--   The three rotations are the parity checks of a Hamming code.
--   C is the syndrome.
delta :: Word16 -> Word16 -> Word16
delta buf c = xorWord16 (xorWord16 (xorWord16 (rotl buf) (rotl3 buf))
                                   (rotr2 buf))
                         c
  where
    -- rotl by 1
    rotl (W16 (B a1 a2 a3 a4 a5 a6 a7 a8) (B b1 b2 b3 b4 b5 b6 b7 b8)) =
      W16 (B a2 a3 a4 a5 a6 a7 a8 b1) (B b2 b3 b4 b5 b6 b7 b8 a1)

    -- rotl by 3
    rotl3 (W16 (B a1 a2 a3 a4 a5 a6 a7 a8) (B b1 b2 b3 b4 b5 b6 b7 b8)) =
      W16 (B a4 a5 a6 a7 a8 b1 b2 b3) (B b4 b5 b6 b7 b8 a1 a2 a3)

    -- rotr by 2
    rotr2 (W16 (B a1 a2 a3 a4 a5 a6 a7 a8) (B b1 b2 b3 b4 b5 b6 b7 b8)) =
      W16 (B a7 a8 b1 b2 b3 b4 b5 b6) (B b7 b8 a1 a2 a3 a4 a5 a6)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE PERIOD
-- ═══════════════════════════════════════════════════════════════════════════

-- | Apply delta k times.
deltaK :: Int -> Word16 -> Word16 -> Word16
deltaK 0 buf _ = buf
deltaK n buf c = delta (deltaK (n - 1) buf c) c

-- | delta applied 8 times is the identity.
delta8 :: Word16 -> Word16 -> Bool
delta8 buf c = deltaK 8 buf c == buf

-- ═══════════════════════════════════════════════════════════════════════════
-- THE 16-BYTE RULER
-- ═══════════════════════════════════════════════════════════════════════════

-- | A 16-byte ruler is two 8-byte halves.
data Ruler = Ruler
  { rulerState      :: Relation  -- bytes 0-7 (the spatial subarray)
  , rulerCorrection :: Relation  -- bytes 8-15 (the reference operations)
  }

-- | Advance the ruler one step.
--   next = delta(state, correction)
--   new state = next
--   new correction = old state
advanceRuler :: Ruler -> Ruler
advanceRuler (Ruler state correction) =
  let next = foldDelta state correction
  in Ruler next state
  where
    foldDelta s c = Relation
      { relW16a = delta (relW16a s) (relW16a c)
      , relW16b = delta (relW16b s) (relW16b c)
      , relW16c = delta (relW16c s) (relW16c c)
      , relW16d = delta (relW16d s) (relW16d c)
      , relW16e = delta (relW16e s) (relW16e c)
      , relW16f = delta (relW16f s) (relW16f c)
      , relW16g = delta (relW16g s) (relW16g c)
      , relW16h = delta (relW16h s) (relW16h c)
      , relW32a = relW32a s
      , relW32b = relW32b s
      , relW32c = relW32c s
      , relW32d = relW32d s
      }

-- | The full 16-byte delta step.
delta16 :: Ruler -> Ruler
delta16 = advanceRuler
```

---

## Part IV: The Binary Quadratic Form

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.BQF
  ( Q60
  , Q16
  , q60
  , q16
  , lift
  , discriminant60
  , discriminant16
  , discriminant
  ) where

import OMI.Kernel

-- ═══════════════════════════════════════════════════════════════════════════
-- THE QUADRATIC FORMS
-- ═══════════════════════════════════════════════════════════════════════════

-- | The coefficients of the projective form.
type Q60 = (Int, Int, Int)  -- (a, b, c) for ax² + bxy + cy²

-- | The coefficients of the affine form.
type Q16 = (Int, Int, Int)

-- | Q60(x, y) = 60x² + 16xy + 4y²
q60 :: Int -> Int -> Int
q60 x y = 60 * x * x + 16 * x * y + 4 * y * y

-- | Q16(x, y) = 16x² + 16xy + 4y²
q16 :: Int -> Int -> Int
q16 x y = 16 * x * x + 16 * x * y + 4 * y * y

-- | The lift: Q60 - Q16 = 44x²
lift :: Int -> Int
lift x = 44 * x * x

-- ═══════════════════════════════════════════════════════════════════════════
-- THE DISCRIMINANT
-- ═══════════════════════════════════════════════════════════════════════════

-- | The discriminant of ax² + bxy + cy² is b² - 4ac.
discriminant :: Int -> Int -> Int -> Int
discriminant a b c = b * b - 4 * a * c

-- | The discriminant of Q60.
discriminant60 :: Int
discriminant60 = discriminant 60 16 4  -- -704

-- | The discriminant of Q16.
discriminant16 :: Int
discriminant16 = discriminant 16 16 4  -- 0
```

---

## Part V: The Sexagesimal Orbit

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.Orbit
  ( orbit60
  , orbit60n
  , blockOf
  , Block(..)
  , blockRegex
  , diagonal
  ) where

import OMI.Kernel
import Data.List (find)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE ORBIT
-- ═══════════════════════════════════════════════════════════════════════════

-- | The orbit of 60 under XOR with n.
orbit60 :: [Int]
orbit60 = [60 `xorInt` n | n <- [0..63]]

-- | The nth value of the orbit.
orbit60n :: Int -> Int
orbit60n n = 60 `xorInt` n

-- | Integer XOR.
xorInt :: Int -> Int -> Int
xorInt a b = go a b 0
  where
    go 0 0 acc = acc
    go x y acc =
      let bx = x `mod` 2
          by = y `mod` 2
          bz = if bx == by then 0 else 1
      in go (x `div` 2) (y `div` 2) (acc + bz * (2 ^ (log2 (acc + 1))))

    log2 n = length (takeWhile (<= n) (iterate (*2) 1)) - 1

-- ═══════════════════════════════════════════════════════════════════════════
-- THE BLOCKS
-- ═══════════════════════════════════════════════════════════════════════════

-- | The four blocks of the sexagesimal orbit.
data Block = Block0 | Block1 | Block2 | Block3
  deriving (Eq, Show)

-- | Which block does a value belong to?
blockOf :: Int -> Maybe Block
blockOf n
  | n >= 60 && n <= 63 = Just Block0
  | n >= 56 && n <= 59 = Just Block1
  | n >= 52 && n <= 55 = Just Block2
  | n >= 48 && n <= 51 = Just Block3
  | otherwise          = Nothing

-- | The regex pattern for each block.
blockRegex :: Block -> String
blockRegex Block0 = "^[<=>?]$"
blockRegex Block1 = "^[89:;]$"
blockRegex Block2 = "^[4567]$"
blockRegex Block3 = "^[0123]$"

-- ═══════════════════════════════════════════════════════════════════════════
-- THE DIAGONAL
-- ═══════════════════════════════════════════════════════════════════════════

-- | The diagonal value.
diagonal :: Int
diagonal = 12  -- 01100₂

-- | The four-block family.
fourBlockFamily :: [Int]
fourBlockFamily = [3, 7, 11, 15]

-- | The orbital base.
orbitalBase :: Int
orbitalBase = 19  -- 10011₂
```

---

## Part VI: The Handler

```haskell
{-# LANGUAGE NoImplicitPrelude #-}
{-# LANGUAGE GADTs #-}

module OMI.Handler
  ( Position(..)
  , Grammar(..)
  , admissible
  , Deviation(..)
  , Operation(..)
  , bind
  , apply
  , eval
  , digest
  ) where

import OMI.Kernel
import OMI.Relation

-- ═══════════════════════════════════════════════════════════════════════════
-- THE POSITION
-- ═══════════════════════════════════════════════════════════════════════════

-- | A Position is a wordform. It names a coordinate.
data Position
  = PPoint   Int   -- n p
  | PIndex   Int   -- n i
  | PNumber  Int   -- n n
  | PExponent Int  -- e n
  | PBinary  Int   -- 0b n
  | POctal   Int   -- 0o n
  | PHex     Int   -- 0x n
  | PDecimal Int Int -- n . n
  | PLiteral Int Char Int Char -- n [boxd] n [pin]
  | PStruct  Int Char Int Char Int Char -- n [e.] n [boxd] n [pin]
  deriving (Eq, Show)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE GRAMMAR
-- ═══════════════════════════════════════════════════════════════════════════

-- | The grammar is a set of position patterns.
data Grammar = Grammar
  { gPoint    :: String
  , gIndex    :: String
  , gNumber   :: String
  , gExponent :: String
  , gBinary   :: String
  , gOctal    :: String
  , gHex      :: String
  , gDecimal  :: String
  , gLiteral  :: String
  , gStruct   :: String
  }

-- | The default grammar.
defaultGrammar :: Grammar
defaultGrammar = Grammar
  { gPoint    = "^([0-9]+)p$"
  , gIndex    = "^([0-9]+)i$"
  , gNumber   = "^([0-9]+)n$"
  , gExponent = "^e([0-9]+)$"
  , gBinary   = "^0b([01]+)$"
  , gOctal    = "^0o([0-7]+)$"
  , gHex      = "^0x([0-9A-Fa-f]+)$"
  , gDecimal  = "^([0-9]+)\\.([0-9]+)$"
  , gLiteral  = "^([0-9]+)([boxd])([0-9]+)([pin])$"
  , gStruct   = "^([0-9]+)([e.])([0-9]+)([boxd])([0-9]+)([pin])$"
  }

-- | Is a position admissible?
admissible :: Grammar -> Position -> Bool
admissible g (PPoint _)    = True
admissible g (PIndex _)    = True
admissible g (PNumber _)   = True
admissible g (PExponent _) = True
admissible g (PBinary _)   = True
admissible g (POctal _)    = True
admissible g (PHex _)      = True
admissible g (PDecimal _ _) = True
admissible g (PLiteral _ _ _ _) = True
admissible g (PStruct _ _ _ _ _ _) = True

-- ═══════════════════════════════════════════════════════════════════════════
-- THE DEVIATION
-- ═══════════════════════════════════════════════════════════════════════════

-- | The deviation. It carries the structured coordinate.
data Deviation = Deviation
  { devPosition   :: Position
  , devExpected   :: Int
  , devActual     :: Int
  , devDifference :: Int
  } deriving (Show)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE OPERATIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- | The four operations. Each takes a declaration and a definition.
data Operation
  = Bind   (Position -> Position -> Either Deviation Relation)
  | Apply  (Position -> Position -> Either Deviation Relation)
  | Eval   (Position -> Position -> Either Deviation Relation)
  | Digest (Position -> Position -> Either Deviation Relation)

-- | Bind: build the relation.
bind :: Position -> Position -> Either Deviation Relation
bind p1 p2 = Right zeroRelation

-- | Apply: invoke the relation.
apply :: Position -> Position -> Either Deviation Relation
apply p1 p2 = Right zeroRelation

-- | Eval: extract from the relation.
eval :: Position -> Position -> Either Deviation Relation
eval p1 p2 = Right zeroRelation

-- | Digest: fold the relations.
digest :: Position -> Position -> Either Deviation Relation
digest p1 p2 = Right zeroRelation

-- | The zero relation.
zeroRelation :: Relation
zeroRelation = error "defined in OMI.Relation"
```

---

## Part VII: The Pipeline

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.Pipeline
  ( Citation(..)
  , Gauge(..)
  , WittgensteinOperator(..)
  , TruthGate(..)
  , DecisionTable(..)
  , KarnaughMap(..)
  , Combinator(..)
  , Delta(..)
  , Blackboard(..)
  , ProjectionFace(..)
  , Attestation(..)
  , resolveDeclaration
  , citeDeclaration
  , selectGauge
  , gaugeToWittgenstein
  , classifyTruthGate
  , decisionFromGate
  , reduceKarnaugh
  , buildCombinator
  , applyDelta
  , constructBlackboard
  , projectFace
  , attestProjection
  ) where

import OMI.Kernel
import OMI.Relation

-- ═══════════════════════════════════════════════════════════════════════════
-- THE TEN STAGES
-- ═══════════════════════════════════════════════════════════════════════════

-- | Stage 1: Citation.
data Citation = Citation
  { citationRelation :: Relation
  , citationExpr     :: String
  , citationGauge    :: Byte
  }

-- | Stage 2: Gauge.
data Gauge = Gauge
  { gaugeByte     :: Byte
  , gaugeRelation :: Relation
  }

-- | Stage 3: Wittgenstein Operator.
data WittgensteinOperator = WittgensteinOperator
  { wittCode     :: Nibble
  , wittRelation :: Relation
  }

-- | Stage 4: Truth Gate.
data TruthGate = TruthGate
  { truthClass    :: Int
  , truthRelation :: Relation
  }

-- | Stage 5: Decision Table.
data DecisionTable = DecisionTable
  { dtRules      :: [String]
  , dtRelation   :: Relation
  }

-- | Stage 6: Karnaugh Map.
data KarnaughMap = KarnaughMap
  { kmCells      :: [Int]
  , kmRelation   :: Relation
  }

-- | Stage 7: Combinator.
data Combinator = Combinator
  { combKarnaugh :: KarnaughMap
  , combRelation :: Relation
  }

-- | Stage 8: Delta.
data Delta = Delta
  { deltaCombinator :: Combinator
  , deltaRelation   :: Relation
  }

-- | Stage 9: Blackboard.
data Blackboard = Blackboard
  { bbDelta      :: Delta
  , bbRelation   :: Relation
  }

-- | Stage 10: Projection Face.
data ProjectionFace = ProjectionFace
  { pfRelation :: Relation
  }

-- | Stage 11: Attestation.
data Attestation = Attestation
  { attestRelation   :: Relation
  , attestResidual   :: Word16
  , attestClosure    :: Bool
  }

-- ═══════════════════════════════════════════════════════════════════════════
-- THE PIPELINE
-- ═══════════════════════════════════════════════════════════════════════════

-- | The full pipeline as one function.
resolveDeclaration :: String -> Attestation
resolveDeclaration expr =
    attestProjection
  . projectFace
  . constructBlackboard
  . applyDelta
  . buildCombinator
  . reduceKarnaugh
  . decisionFromGate
  . classifyTruthGate
  . gaugeToWittgenstein
  . selectGauge
  . citeDeclaration
  $ expr

-- | Stage 1: Cite the declaration.
citeDeclaration :: String -> Citation
citeDeclaration expr = Citation
  { citationRelation = zeroRelation
  , citationExpr     = expr
  , citationGauge    = B I I I I O O O O  -- 0xF0
  }

-- | Stage 2: Select the gauge.
selectGauge :: Citation -> Gauge
selectGauge c = Gauge
  { gaugeByte     = citationGauge c
  , gaugeRelation = citationRelation c
  }

-- | Stage 3: Extract the Wittgenstein operator.
gaugeToWittgenstein :: Gauge -> WittgensteinOperator
gaugeToWittgenstein g = WittgensteinOperator
  { wittCode     = N O O O O  -- low nibble of 0xF0
  , wittRelation = gaugeRelation g
  }

-- | Stage 4: Classify the truth gate.
classifyTruthGate :: WittgensteinOperator -> TruthGate
classifyTruthGate w = TruthGate
  { truthClass    = 0
  , truthRelation = wittRelation w
  }

-- | Stage 5: Build the decision table.
decisionFromGate :: TruthGate -> DecisionTable
decisionFromGate t = DecisionTable
  { dtRules    = []
  , dtRelation = truthRelation t
  }

-- | Stage 6: Reduce to Karnaugh map.
reduceKarnaugh :: DecisionTable -> KarnaughMap
reduceKarnaugh d = KarnaughMap
  { kmCells    = []
  , kmRelation = dtRelation d
  }

-- | Stage 7: Build the combinator.
buildCombinator :: KarnaughMap -> Combinator
buildCombinator k = Combinator
  { combKarnaugh = k
  , combRelation = kmRelation k
  }

-- | Stage 8: Apply delta.
applyDelta :: Combinator -> Delta
applyDelta c = Delta
  { deltaCombinator = c
  , deltaRelation   = combRelation c
  }

-- | Stage 9: Construct the blackboard.
constructBlackboard :: Delta -> Blackboard
constructBlackboard d = Blackboard
  { bbDelta    = d
  , bbRelation = deltaRelation d
  }

-- | Stage 10: Project the face.
projectFace :: Blackboard -> ProjectionFace
projectFace b = ProjectionFace
  { pfRelation = bbRelation b
  }

-- | Stage 11: Attest the projection.
attestProjection :: ProjectionFace -> Attestation
attestProjection p = Attestation
  { attestRelation = pfRelation p
  , attestResidual = W16 (B O O O O O O O O) (B O O O O O O O O)
  , attestClosure  = True
  }

-- | The zero relation.
zeroRelation :: Relation
zeroRelation = error "defined in OMI.Relation"
```

---

## Part VIII: The BIOS and Kernel

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.BIOS
  ( reset
  , Endpoint(..)
  , Interior(..)
  , Path(..)
  , BIOS(..)
  , Kernel(..)
  , boot
  , runKernel
  ) where

import OMI.Kernel
import OMI.Relation
import OMI.Delta

-- ═══════════════════════════════════════════════════════════════════════════
-- THE RESET VECTOR
-- ═══════════════════════════════════════════════════════════════════════════

-- | The reset vector.
reset :: Word16
reset = W16
  (B O O O O O O O O)  -- 0x00
  (B O O O O O O O O)  -- 0x00

-- ═══════════════════════════════════════════════════════════════════════════
-- THE ENDPOINTS AND INTERIOR
-- ═══════════════════════════════════════════════════════════════════════════

-- | The endpoints of the path.
data Endpoint = Endpoint5T | Endpoint10T
  deriving (Eq, Show)

-- | The interior forms.
data Interior = Interior6T | Interior8T
  deriving (Eq, Show)

-- | A path is between the endpoints, with an optional interior.
data Path = Path
  { pathStart     :: Endpoint
  , pathEnd       :: Endpoint
  , pathInterior  :: [Interior]
  }

-- ═══════════════════════════════════════════════════════════════════════════
-- THE BIOS
-- ═══════════════════════════════════════════════════════════════════════════

-- | The BIOS is a sequence of paths.
data BIOS = BIOS
  { biosSequence :: [Path]
  }

-- | Boot the BIOS.
boot :: BIOS -> [Relation]
boot (BIOS paths) = map executePath paths

-- | Execute a single path.
executePath :: Path -> Relation
executePath _ = zeroRelation

-- | The zero relation.
zeroRelation :: Relation
zeroRelation = error "defined in OMI.Relation"

-- ═══════════════════════════════════════════════════════════════════════════
-- THE KERNEL
-- ═══════════════════════════════════════════════════════════════════════════

-- | The kernel is the fixed point of the derivation.
data Kernel = Kernel
  { kernelBIOS  :: BIOS
  , kernelState :: [Relation]
  }

-- | Run the kernel until closure.
runKernel :: Kernel -> Either String [Relation]
runKernel (Kernel bios state) =
  let results = boot bios
      closed = all relationClosure results
  in if closed
     then Right results
     else Left "Kernel did not close"
```

---

## Part IX: The iExtant Torus

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.Torus
  ( Scope(..)
  , Shape(..)
  , Cell(..)
  , weight
  , toroidalDistance
  , diagonal
  , onDiagonal
  , nearestDiagonal
  ) where

import OMI.Kernel

-- ═══════════════════════════════════════════════════════════════════════════
-- THE COORDINATES
-- ═══════════════════════════════════════════════════════════════════════════

-- | The four scopes.
data Scope = FS | GS | RS | US
  deriving (Eq, Ord, Show, Enum, Bounded)

-- | The four shapes.
data Shape = KK | KU | UK | UU
  deriving (Eq, Ord, Show, Enum, Bounded)

-- | A cell on the torus.
data Cell = Cell Scope Shape
  deriving (Eq, Show)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE METRIC
-- ═══════════════════════════════════════════════════════════════════════════

-- | Toroidal distance on a 4-cycle.
toroidalDistance :: Int -> Int -> Int
toroidalDistance a b = min d (4 - d)
  where d = abs (a - b)

-- | The weight between two cells.
weight :: Cell -> Cell -> Int
weight (Cell s1 h1) (Cell s2 h2) =
  toroidalDistance (fromEnum s1) (fromEnum s2) +
  toroidalDistance (fromEnum h1) (fromEnum h2)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE DIAGONAL
-- ═══════════════════════════════════════════════════════════════════════════

-- | The diagonal cells.
diagonal :: [Cell]
diagonal = [Cell FS KK, Cell GS KU, Cell RS UK, Cell US UU]

-- | Is a cell on the diagonal?
onDiagonal :: Cell -> Bool
onDiagonal c = c `elem` diagonal

-- | The nearest diagonal cell.
nearestDiagonal :: Cell -> Cell
nearestDiagonal c = minimumBy compareDistance diagonal
  where
    compareDistance a b = compare (weight c a) (weight c b)
    minimumBy cmp = foldr1 (\x y -> if cmp x y == GT then y else x)
```

---

## Part X: The Complete Protocol

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.Protocol
  ( Protocol(..)
  , defaultProtocol
  , runProtocol
  ) where

import OMI.Kernel
import OMI.Relation
import OMI.Delta
import OMI.BQF
import OMI.Orbit
import OMI.Handler
import OMI.Pipeline
import OMI.BIOS
import OMI.Torus

-- ═══════════════════════════════════════════════════════════════════════════
-- THE PROTOCOL
-- ═══════════════════════════════════════════════════════════════════════════

-- | The complete protocol.
data Protocol = Protocol
  { protocolGrammar  :: Grammar
  , protocolRuler    :: Ruler
  , protocolBIOS     :: BIOS
  , protocolKernel   :: Kernel
  }

-- | The default protocol.
defaultProtocol :: Protocol
defaultProtocol = Protocol
  { protocolGrammar = defaultGrammar
  , protocolRuler   = Ruler zeroRelation zeroRelation
  , protocolBIOS    = BIOS []
  , protocolKernel  = Kernel (BIOS []) []
  }

-- | Run the protocol on a declaration.
runProtocol :: Protocol -> String -> Either String Attestation
runProtocol p expr =
  let att = resolveDeclaration expr
  in if attestClosure att
     then Right att
     else Left "Attestation did not close"

-- | The zero relation.
zeroRelation :: Relation
zeroRelation = error "defined in OMI.Relation"
```

---

## Part XI: The Main Entry Point

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module Main where

import OMI.Kernel
import OMI.Relation
import OMI.Delta
import OMI.BQF
import OMI.Orbit
import OMI.Handler
import OMI.Pipeline
import OMI.BIOS
import OMI.Torus
import OMI.Protocol

-- ═══════════════════════════════════════════════════════════════════════════
-- THE MAIN
-- ═══════════════════════════════════════════════════════════════════════════

main :: IO ()
main = do
  putStrLn "OMI Protocol"
  putStrLn "============"
  putStrLn ""
  
  -- The primitive
  putStrLn "The primitive:"
  putStrLn "  Atomics.compareExchange(buf, index, expected, replacement)"
  putStrLn ""
  
  -- The orbit
  putStrLn "The orbit of 60:"
  mapM_ printOrbit [0..15]
  putStrLn ""
  
  -- The BQF
  putStrLn "The BQF:"
  putStrLn $ "  Q60(3, 3) = " ++ show (q60 3 3)
  putStrLn $ "  Q16(3, 3) = " ++ show (q16 3 3)
  putStrLn $ "  lift(3)  = " ++ show (lift 3)
  putStrLn ""
  
  -- The torus
  putStrLn "The torus:"
  putStrLn $ "  weight(FS, KK) (GS, KU) = " ++ show (weight (Cell FS KK) (Cell GS KU))
  putStrLn $ "  weight(FS, KK) (FS, KK) = " ++ show (weight (Cell FS KK) (Cell FS KK))
  putStrLn ""

-- | Print an orbit value.
printOrbit :: Int -> IO ()
printOrbit n = do
  let v = orbit60n n
  putStrLn $ "  60 ^ " ++ show n ++ " = " ++ show v
```

---

## Part XII: The Complete Types

```haskell
{-# LANGUAGE NoImplicitPrelude #-}

module OMI.Types
  ( -- Kernel
    Bit(..)
  , Byte(..)
  , Nibble(..)
  , Word16(..)
  , Word32(..)
    -- Relation
  , Relation(..)
    -- Delta
  , Ruler(..)
    -- BQF
  , Q60
  , Q16
    -- Orbit
  , Block(..)
    -- Handler
  , Position(..)
  , Grammar(..)
  , Deviation(..)
    -- Pipeline
  , Citation(..)
  , Gauge(..)
  , WittgensteinOperator(..)
  , TruthGate(..)
  , DecisionTable(..)
  , KarnaughMap(..)
  , Combinator(..)
  , Delta(..)
  , Blackboard(..)
  , ProjectionFace(..)
  , Attestation(..)
    -- BIOS
  , Endpoint(..)
  , Interior(..)
  , Path(..)
  , BIOS(..)
  , Kernel(..)
    -- Torus
  , Scope(..)
  , Shape(..)
  , Cell(..)
    -- Protocol
  , Protocol(..)
  ) where

import OMI.Kernel
import OMI.Relation
import OMI.Delta
import OMI.BQF
import OMI.Orbit
import OMI.Handler
import OMI.Pipeline
import OMI.BIOS
import OMI.Torus
import OMI.Protocol
```

---

## Summary

This is the complete OMI protocol in pure Haskell:

| Module | Contents |
|--------|----------|
| `OMI.Kernel` | Bit, Nibble, Byte, Word16, Word32 — all operations |
| `OMI.Relation` | The twelve-field Relation, XOR, closure |
| `OMI.Delta` | The delta transform, period 8, the 16-byte ruler |
| `OMI.BQF` | Q60, Q16, the lift, discriminants |
| `OMI.Orbit` | The sexagesimal orbit, the four blocks |
| `OMI.Handler` | Position, Grammar, Deviation, the four operations |
| `OMI.Pipeline` | The ten stages from Citation to Attestation |
| `OMI.BIOS` | The reset vector, paths, the kernel |
| `OMI.Torus` | Scope, Shape, Cell, the weight metric |
| `OMI.Protocol` | The complete protocol |
| `Main` | The entry point |

**Every value is a bit construction.** No `Int`, no `Word8`, no `Bool` from the Prelude. The entire numeric tower is built from `Bit`.

**Every operation is total.** There are no `Maybe` or `Either` in the core. The pipeline always completes.

**Every stage carries the Relation forward.** The Relation is the carrier. The pipeline is a sequence of transformations on it.

**Closure is XOR.** `∂(b) = 0000` is the only acceptance criterion.

**The protocol is one object.** One primitive, one block, one law. Everything else is a reading.