module OMI.Relation
  ( Relation(..)
  , zeroRelation
  , relationXor
  , relationClosure
  , fromInts
  ) where

import OMI.Kernel

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
  } deriving (Eq, Show)

zeroRelation :: Relation
zeroRelation = Relation
  (intToWord16 0) (intToWord16 0) (intToWord16 0) (intToWord16 0)
  (intToWord16 0) (intToWord16 0) (intToWord16 0) (intToWord16 0)
  (W32 (intToWord16 0) (intToWord16 0))
  (W32 (intToWord16 0) (intToWord16 0))
  (W32 (intToWord16 0) (intToWord16 0))
  (W32 (intToWord16 0) (intToWord16 0))

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

relationClosure :: Relation -> Bool
relationClosure r = r == zeroRelation

-- | Build a Relation from four 16-bit values. The rest are zero.
fromInts :: Int -> Int -> Int -> Int -> Relation
fromInts a b c d = zeroRelation
  { relW16a = intToWord16 a
  , relW16b = intToWord16 b
  , relW16c = intToWord16 c
  , relW16d = intToWord16 d
  }
