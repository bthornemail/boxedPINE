module OMI.Handler
  ( Position(..)
  , Deviation(..)
  , bind
  , apply
  , eval
  , digest
  ) where

import OMI.Kernel
import OMI.Relation
import OMI.Delta

data Position
  = PPoint    Int
  | PIndex    Int
  | PNumber   Int
  | PExponent Int
  deriving (Eq, Show)

data Deviation = Deviation
  { devPosition   :: Position
  , devExpected   :: Int
  , devActual     :: Int
  , devDifference :: Int
  } deriving (Show)

-- | Bind: a Relation with the two positions in the first two slots.
bind :: Position -> Position -> Either Deviation Relation
bind p1 p2 = Right $ zeroRelation
  { relW16a = posToWord16 p1
  , relW16b = posToWord16 p2
  }

-- | Apply: a Relation with the positions in slots a and c, delta-advanced.
apply :: Position -> Position -> Either Deviation Relation
apply p1 p2 = Right $ advanceRelation $ zeroRelation
  { relW16a = posToWord16 p1
  , relW16c = posToWord16 p2
  }

-- | Eval: a Relation with the positions in slots b and d, twice delta-advanced.
eval :: Position -> Position -> Either Deviation Relation
eval p1 p2 = Right $ advanceRelation $ advanceRelation $ zeroRelation
  { relW16b = posToWord16 p1
  , relW16d = posToWord16 p2
  }

-- | Digest: the xor of bind and apply.
digest :: Position -> Position -> Either Deviation Relation
digest p1 p2 = case (bind p1 p2, apply p1 p2) of
  (Right r1, Right r2) -> Right $ relationXor r1 r2
  (Left d, _) -> Left d
  (_, Left d) -> Left d

posToWord16 :: Position -> Word16
posToWord16 (PPoint n)    = intToWord16 n
posToWord16 (PIndex n)    = intToWord16 n
posToWord16 (PNumber n)   = intToWord16 n
posToWord16 (PExponent n) = intToWord16 n
