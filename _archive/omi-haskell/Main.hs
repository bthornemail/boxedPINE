module Main where

import OMI.Kernel
import OMI.Relation
import OMI.Delta
import OMI.Handler
import OMI.Pipeline

main :: IO ()
main = do
  putStrLn "OMI Protocol"
  putStrLn "============"
  putStrLn ""

  -- Test the delta period
  putStrLn "Delta period test (delta^8 = identity):"
  mapM_ (\seed -> putStrLn $ "  seed " ++ show seed ++ ": " ++ show (deltaPeriodTest seed))
        [1, 2, 3, 5, 7, 11, 17, 60, 64, 124, 255, 256, 1000, 65535]
  putStrLn ""

  -- Test closure with non-zero input
  putStrLn "Closure test with non-zero input:"
  let cases =
        [ (PPoint 0, PNumber 0)
        , (PPoint 1, PNumber 1)
        , (PPoint 2, PNumber 3)
        , (PPoint 5, PNumber 7)
        , (PPoint 11, PNumber 13)
        , (PPoint 17, PNumber 19)
        , (PPoint 60, PNumber 64)
        ]
  mapM_ testCase cases
  putStrLn ""

  -- Test the four handler operations
  putStrLn "Handler operations:"
  let p1 = PPoint 3
      p2 = PNumber 5
  putStrLn $ "  bind(3p, 5n) closure = " ++ show (opClosure bind p1 p2)
  putStrLn $ "  apply(3p, 5n) closure = " ++ show (opClosure apply p1 p2)
  putStrLn $ "  eval(3p, 5n) closure = " ++ show (opClosure eval p1 p2)
  putStrLn $ "  digest(3p, 5n) closure = " ++ show (opClosure digest p1 p2)
  putStrLn ""

  -- Test BQF
  putStrLn "BQF:"
  putStrLn $ "  Q60(3, 3) = " ++ show (60*3*3 + 16*3*3 + 4*3*3)
  putStrLn $ "  Q16(3, 3) = " ++ show (16*3*3 + 16*3*3 + 4*3*3)
  putStrLn $ "  lift(3)   = " ++ show (44*3*3)
  putStrLn ""

testCase :: (Position, Position) -> IO ()
testCase (p1, p2) = do
  let att = resolveDeclaration p1 p2
  putStrLn $ "  resolve(" ++ show p1 ++ ", " ++ show p2 ++ "):"
          ++ " closure = " ++ show (attestClosure att)
          ++ ", residual = " ++ show (word16ToInt (attestResidual att))

opClosure :: (Position -> Position -> Either Deviation Relation) -> Position -> Position -> Bool
opClosure op p1 p2 = case op p1 p2 of
  Right r -> relationClosure r
  Left _  -> False
