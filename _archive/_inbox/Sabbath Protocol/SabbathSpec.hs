{-# LANGUAGE OverloadedStrings #-}

module Unit.SabbathSpec (spec) where

import Test.Hspec

import ULP.Core.Contract.Sabbath (validateSabbath)
import ULP.Core.Types
import qualified Data.ByteString.Char8 as BSC

spec :: Spec
spec = do
  describe "Sabbath contract" $ do
    it "rejects attestation during sabbath" $ do
      let ev = Event 1 2 "" Attestation "" "" (Hash BSC.empty) (Hash BSC.empty)
      validateSabbath Sabbath ev `shouldBe` Just (SabbathViolation 2)
