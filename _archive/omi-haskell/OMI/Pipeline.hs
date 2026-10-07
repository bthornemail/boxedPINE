module OMI.Pipeline
  ( Attestation(..)
  , resolveDeclaration
  ) where

import OMI.Kernel
import OMI.Relation
import OMI.Delta
import OMI.Handler

data Attestation = Attestation
  { attestRelation :: Relation
  , attestResidual :: Word16
  , attestClosure  :: Bool
  } deriving (Show)

-- | The pipeline: bind the two positions, apply delta, test closure.
resolveDeclaration :: Position -> Position -> Attestation
resolveDeclaration p1 p2 =
  let
    -- Step 1: bind
    bound = case bind p1 p2 of
      Right r -> r
      Left _  -> zeroRelation

    -- Step 2: apply delta 8 times
    deltaAdvanced = deltaKRelation 8 bound

    -- Step 3: test closure
    residual = relW16a deltaAdvanced
    closed = relationClosure deltaAdvanced
  in
    Attestation
      { attestRelation = deltaAdvanced
      , attestResidual = residual
      , attestClosure  = closed
      }

-- | Apply delta 8 times to a Relation.
deltaKRelation :: Int -> Relation -> Relation
deltaKRelation 0 r = r
deltaKRelation n r = deltaKRelation (n - 1) (advanceRelation r)
