module OMI.Delta
  ( delta
  , deltaK
  , deltaPeriodTest
  , advanceRelation
  ) where

import OMI.Kernel
import OMI.Relation

-- | The delta constant.
deltaC :: Word16
deltaC = intToWord16 0x1D1D

-- | The delta transform.
delta :: Word16 -> Word16 -> Word16
delta buf c = xorWord16 (xorWord16 (xorWord16 (rotl buf) (rotl3 buf)) (rotr2 buf)) c
  where
    rotl (W16 (B a1 a2 a3 a4 a5 a6 a7 a8) (B b1 b2 b3 b4 b5 b6 b7 b8)) =
      W16 (B a2 a3 a4 a5 a6 a7 a8 b1) (B b2 b3 b4 b5 b6 b7 b8 a1)

    rotl3 (W16 (B a1 a2 a3 a4 a5 a6 a7 a8) (B b1 b2 b3 b4 b5 b6 b7 b8)) =
      W16 (B a4 a5 a6 a7 a8 b1 b2 b3) (B b4 b5 b6 b7 b8 a1 a2 a3)

    rotr2 (W16 (B a1 a2 a3 a4 a5 a6 a7 a8) (B b1 b2 b3 b4 b5 b6 b7 b8)) =
      W16 (B b7 b8 a1 a2 a3 a4 a5 a6) (B a7 a8 b1 b2 b3 b4 b5 b6)

deltaK :: Int -> Word16 -> Word16 -> Word16
deltaK 0 buf _ = buf
deltaK n buf c = delta (deltaK (n - 1) buf c) c

-- | Test the period of the delta transform on 16-bit words.
--   Returns True iff delta^8 is the identity for the given seed.
deltaPeriodTest :: Int -> Bool
deltaPeriodTest seed = deltaK 8 (intToWord16 seed) deltaC == intToWord16 seed

-- | Advance a Relation one delta step.
advanceRelation :: Relation -> Relation
advanceRelation r = Relation
  { relW16a = delta (relW16a r) deltaC
  , relW16b = delta (relW16b r) deltaC
  , relW16c = delta (relW16c r) deltaC
  , relW16d = delta (relW16d r) deltaC
  , relW16e = delta (relW16e r) deltaC
  , relW16f = delta (relW16f r) deltaC
  , relW16g = delta (relW16g r) deltaC
  , relW16h = delta (relW16h r) deltaC
  , relW32a = relW32a r
  , relW32b = relW32b r
  , relW32c = relW32c r
  , relW32d = relW32d r
  }
