// Compile-time checks of rosetta/src/tag-type.ts: tsc fails if any line is wrong.
import type { ToTag, IsTag, Deprecate } from '../../rosetta/src/tag-type.ts';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
export type Checks = [
  Expect<Equal<ToTag<'metatron'>, 'METATRON'>>,
  Expect<Equal<ToTag<'catch'>, 'CATCH'>>,
  Expect<Equal<ToTag<'intj'>, 'INTJ'>>,
  Expect<Equal<ToTag<'e8'>, 'E8'>>,
  Expect<Equal<ToTag<'procedural'>, never>>, // ten letters: not a tag
  Expect<Equal<ToTag<'catch 22'>, never>>, // the space: two tags, not one
  Expect<Equal<ToTag<'hello, world'>, never>>,
  Expect<Equal<ToTag<''>, never>>,
  Expect<Equal<IsTag<'ASABIYAH'>, true>>,
  Expect<Equal<IsTag<'ASABIYYAH'>, false>>,
  Expect<Equal<Deprecate<'METATRON'>, 'metatron'>>, // upper to lower: deprecated
  Expect<Equal<Deprecate<'22'>, '22'>>, // digits have no case: still a tag
  Expect<Equal<Deprecate<'metatron'>, never>>, // already lowered: not a tag to deprecate
  Expect<Equal<ToTag<Deprecate<'CATCH'>>, 'CATCH'>>, // generated again
];
