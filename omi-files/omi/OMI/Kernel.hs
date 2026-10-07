module OMI.Kernel
  ( Bit(..)
  , Byte(..)
  , Nibble(..)
  , Word16(..)
  , Word32(..)
  , xorBit, andBit, orBit, notBit, ite
  , xorByte, andByte, orByte
  , xorWord16, xorWord32
  , intToWord16, word16ToInt
  , intToByte, byteToInt
  ) where

-- ═══════════════════════════════════════════════════════════════════════════
-- THE BIT
-- ═══════════════════════════════════════════════════════════════════════════

data Bit = O | I
  deriving (Eq, Ord, Show)

xorBit :: Bit -> Bit -> Bit
xorBit O b = b
xorBit I O = I
xorBit I I = O

andBit :: Bit -> Bit -> Bit
andBit I I = I
andBit _ _ = O

orBit :: Bit -> Bit -> Bit
orBit O b = b
orBit I _ = I

notBit :: Bit -> Bit
notBit b = xorBit b I

ite :: Bit -> a -> a -> a
ite O f _ = f
ite I _ t = t

-- ═══════════════════════════════════════════════════════════════════════════
-- THE BYTE
-- ═══════════════════════════════════════════════════════════════════════════

data Byte = B Bit Bit Bit Bit Bit Bit Bit Bit
  deriving (Eq, Show)

xorByte :: Byte -> Byte -> Byte
xorByte (B a1 a2 a3 a4 a5 a6 a7 a8)
        (B b1 b2 b3 b4 b5 b6 b7 b8) =
  B (xorBit a1 b1) (xorBit a2 b2) (xorBit a3 b3) (xorBit a4 b4)
    (xorBit a5 b5) (xorBit a6 b6) (xorBit a7 b7) (xorBit a8 b8)

andByte :: Byte -> Byte -> Byte
andByte (B a1 a2 a3 a4 a5 a6 a7 a8)
        (B b1 b2 b3 b4 b5 b6 b7 b8) =
  B (andBit a1 b1) (andBit a2 b2) (andBit a3 b3) (andBit a4 b4)
    (andBit a5 b5) (andBit a6 b6) (andBit a7 b7) (andBit a8 b8)

orByte :: Byte -> Byte -> Byte
orByte (B a1 a2 a3 a4 a5 a6 a7 a8)
       (B b1 b2 b3 b4 b5 b6 b7 b8) =
  B (orBit a1 b1) (orBit a2 b2) (orBit a3 b3) (orBit a4 b4)
    (orBit a5 b5) (orBit a6 b6) (orBit a7 b7) (orBit a8 b8)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE NIBBLE
-- ═══════════════════════════════════════════════════════════════════════════

data Nibble = N Bit Bit Bit Bit
  deriving (Eq, Show)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE WORD16
-- ═══════════════════════════════════════════════════════════════════════════

data Word16 = W16 Byte Byte
  deriving (Eq, Show)

xorWord16 :: Word16 -> Word16 -> Word16
xorWord16 (W16 a1 a2) (W16 b1 b2) = W16 (xorByte a1 b1) (xorByte a2 b2)

-- ═══════════════════════════════════════════════════════════════════════════
-- THE WORD32
-- ═══════════════════════════════════════════════════════════════════════════

data Word32 = W32 Word16 Word16
  deriving (Eq, Show)

xorWord32 :: Word32 -> Word32 -> Word32
xorWord32 (W32 a1 a2) (W32 b1 b2) = W32 (xorWord16 a1 b1) (xorWord16 a2 b2)

-- ═══════════════════════════════════════════════════════════════════════════
-- INT <-> BYTE <-> WORD16
-- ═══════════════════════════════════════════════════════════════════════════

intToByte :: Int -> Byte
intToByte n = B
  (if n `mod` 256 >= 128 then I else O)
  (if (n `mod` 128) >= 64 then I else O)
  (if (n `mod` 64) >= 32 then I else O)
  (if (n `mod` 32) >= 16 then I else O)
  (if (n `mod` 16) >= 8 then I else O)
  (if (n `mod` 8) >= 4 then I else O)
  (if (n `mod` 4) >= 2 then I else O)
  (if n `mod` 2 == 1 then I else O)

byteToInt :: Byte -> Int
byteToInt (B b7 b6 b5 b4 b3 b2 b1 b0) =
     bitToInt b7 * 128
   + bitToInt b6 * 64
   + bitToInt b5 * 32
   + bitToInt b4 * 16
   + bitToInt b3 * 8
   + bitToInt b2 * 4
   + bitToInt b1 * 2
   + bitToInt b0 * 1

bitToInt :: Bit -> Int
bitToInt O = 0
bitToInt I = 1

intToWord16 :: Int -> Word16
intToWord16 n = W16 (intToByte (n `div` 256)) (intToByte (n `mod` 256))

word16ToInt :: Word16 -> Int
word16ToInt (W16 hi lo) = byteToInt hi * 256 + byteToInt lo
