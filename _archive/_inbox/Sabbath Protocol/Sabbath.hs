{-# LANGUAGE NamedFieldPuns #-}

module ULP.Core.Contract.Sabbath
  ( nextMode
  , validateSabbath
  ) where

import ULP.Core.Types (Event(..), EventType(..), Mode(..), ValidationError(..))

-- | Determine next mode based on event type.
nextMode :: Mode -> EventType -> Mode
nextMode mode evType = case evType of
  AttestationSuspended -> Sabbath
  AttestationResumed -> Normal
  _ -> mode

-- | Validate Sabbath rules for a given event in current mode.
validateSabbath :: Mode -> Event -> Maybe ValidationError
validateSabbath mode Event{evType, evSeq} =
  case (mode, evType) of
    (Sabbath, Attestation) -> Just (SabbathViolation evSeq)
    (Normal, AttestationResumed) -> Just (InvalidModeTransition evSeq)
    (Sabbath, AttestationSuspended) -> Just (InvalidModeTransition evSeq)
    _ -> Nothing
