export {
  xerakt,
  xerakt as default,
} from "./xerakt.ts";

export {
  type UseProps,//generic type of generic function, so can't assign to the function useProps
  type Effect,
  type Cleanup,
  type ResultEffect,
  type ResultCleanup,
  type Compute,
  type PlugCallback,
  useBadPractice,
  useState,
  useReplaceableState,
  useDerivableState,
  useStore,
  useDeps,
  useCompute,
  usePlug,
  useProps,
  useEffect,
  useResultEffect,
} from "./ensurers/renderEnsurer.ts";

export type {
  Render,
  HooksObj,
  Token,
};


import type {
  HooksObj,
} from "./ensurers/renderEnsurer.ts";

import type {
  Token,
} from "./types.ts";




//todo: typization from the side of Token: should enforce that token.props must be assignable to the first arg of token.tag (if token.tag is a function);
type Render<
  PropsType extends {},
> = (
  props: PropsType,
  hooks: HooksObj<PropsType>,
) => Token;