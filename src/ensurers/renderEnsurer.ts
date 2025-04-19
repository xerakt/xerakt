export {
  createRenderEnsurer,

  type HooksObj,
  type UseProps,
  type Effect,
  type Cleanup,
  type ResultEffect,
  type ResultCleanup,
  type Compute,
  type PlugCallback,
  useObj as useBadPractice,
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

  //@bundle-ignore-line //irrelevant if bunlded into a single file:
  setParse,
};


import {
  createDemander,
} from "../demander.ts";

import type {
  Proclaimer,
  Render,
  Result,
  Token,
  InstanceOfRender,
  Demander,
  Parse,
  Props,
} from "../types.ts";

import {
  checkIsSame,
  checkIsSameItms,
  checkIsSameProps,
} from "../utils.ts";


//@bundle-ignore-start //if not bundled:
//for avoiding circular imports:
let parse: Parse;
function setParse(
  actualParse: Parse,
) {
  parse = actualParse;
};
//@bundle-ignore-end

//@bundle-uncomment //if bundled into one file, then circular imports are irrelelevant, so can import:
/*
import {
  parse,
} from "../parse.ts";
*/




function createRenderEnsurer<
  TokenType extends Token,
  PropsType extends Props,
>(
  proclaimer: Proclaimer<
    Result<TokenType>
  >,
  {
    createInstanceOfRender,
    render,
    callRender,
  }: {
    render: Render,
    createInstanceOfRender: (
      CreateInstanceOfRender
    ),
    callRender: CallRender<TokenType>,
  },
): RenderEnsurer<TokenType, PropsType> {

  const resultObjs: Array<
    ResultObj<
      any,
      any,
      any,
      Result<TokenType>
    >
  > = [];

  const wrappedProclaimer = (
    createWrappedProclaimer(
      proclaimer,
      resultObjs
    )
  );

  const ensurer: RenderEnsurer<
    TokenType,
    PropsType
  > = {
    ensure: init,
    cleanup,
    _render: render,
    _createInstanceOfRender: (
      createInstanceOfRender
    ),
    _callRender: callRender,
    _resultDemander: createDemander<
      TokenType
    >(
      wrappedProclaimer
    ),
    _proclaimer: wrappedProclaimer,
    _stateObjs: [],
    _propsSelectorObjs: [],
    _effectObjs: [],
    _props: {},
  };

  return ensurer;
};

function cleanup<
  TokenType extends Token,
  PropsType extends Props,
>(
  this: RenderEnsurer<
    TokenType,
    PropsType
  >,
) {

  for (
    const [
      objs,
      callCleanup,
    ]
    of
    [
      [
        this._proclaimer._resultObjs,
        callWithResult,
      ],
      [
        this._effectObjs,
        callWithoutResult,
      ],
    ] as const
  ) {

    for (
      const obj
      of
      objs
    ) {

      //@ts-ignore //This expression is not callable. //Each member of the union type '(<DepsType extends ReadonlyArray<unknown>, ReturnOfSelfType, ReturnOfOtherType, ResultType>(effectOrCleanup: ResultEffectOrCleanup<DepsType, ReturnOfSelfType, ReturnOfOtherType, ResultType>, deps: DepsType, returnOfOther: ReturnOfOtherType, result: ResultType) => ReturnOfSelfType) | (<DepsType extends ReadonlyArray<...' has signatures, but none of those signatures are compatible with each other.
      callCleanup(
        obj.cleanup,
        obj.deps,
        obj.returnOfEffect,
        this._proclaimer._result
      );
    };
  };

  this._resultDemander.cleanup();
};

function init<
  TokenType extends Token,
  PropsType extends Props,
>(
  this: RenderEnsurer<
    TokenType,
    PropsType
  >,
  //@ts-ignore //Type '{}' is not assignable to type 'PropsType'. //ignored because in this case is assignable because in tis case {} extends PropsType; haven't found proper way to typizate this
  newProps: PropsType = {},
  //todo: move to parse?
) {

  this.ensure = ensure;

  this._instanceOfRender = (
    this._createInstanceOfRender(
      this._render,
      newProps,
      hooksObj
    )
  );

  this.ensure(newProps);

  this._isAlreadyCalled = true;
};

function ensure<
  TokenType extends Token,
  PropsType extends Props,
>(
  this: RenderEnsurer<
    TokenType,
    PropsType
  >,
  //@ts-ignore //Type '{}' is not assignable to type 'PropsType'. //ignored because in this case is assignable because in this case {} extends PropsType; haven't found proper way to typizate this
  newProps: PropsType = {},
  //todo: move to parse?
) {

  if (
    checkIsNeedToRerender(
      this,
      newProps
    )
  ) {

    this._props = newProps;

    rerender(this);
  };
};


function rerender<
  TokenType extends Token,
  PropsType extends Props,
>(
  ensurer: RenderEnsurer<
    TokenType,
    PropsType
  >,
) {

  if (
    currentEnsurer !== undefined
    //currentEnsurer === null should pass into this if-branch; null is set as currentEnsurer during reeffect
  ) {

    const errorSource = (
      currentEnsurer//not undefined
      ?
      "render"//not null and not undefined
      :
      "effect or resultEffect"//null; null is set as currentEnsurer during reeffect
    );

    throw new Error(
      `Error: rerender triggered from ${errorSource}; consider checking that setState(), replaceState(), alterState() or dispatch() are not called in ${errorSource}`
    );
  };

  stateObjIdx = 0;
  propsSelectObjIdx = 0;
  effectObjIdxs[0] = 0;
  effectObjIdxs[1] = 0;



  currentEnsurer = ensurer;

  const resultOfRender = (
    ensurer._callRender(
      ensurer._instanceOfRender!,
      ensurer._props,
      hooksObj
    )
  );

  currentEnsurer = undefined;



  const proclaimer = (
    ensurer._proclaimer
  );

  proclaimer._isNeedToReeffect = true;

  ensurer._resultDemander.demand(
    parse<TokenType>({
      token: resultOfRender
    })
  );

  if (
    proclaimer._isNeedToReeffect
  ) {

    const result = (
      proclaimer._result!
    );

    reeffect<
      typeof result,
      ResultEffectOrCleanup<
        any,
        any,
        any,
        any
      >
    >(
      proclaimer._resultObjs,
      callWithResult,
      result,
      result,
      false
    );
  };

  reeffect(
    ensurer._effectObjs,
    callWithoutResult,
    null,
    null,
    false
  );
};

function reeffect<
  ResultType,
  EffectOrCleanupType extends (
    EffectOrCleanup<
      any,
      any,
      any
    >
    |
    ResultEffectOrCleanup<
      any,
      any,
      any,
      ResultType
    >
  )
>(
  effectOrResultObjs: ReadonlyArray<
    {
      effect: EffectOrCleanupType,
      cleanup: EffectOrCleanupType,
      isNeedToReeffect: boolean,
      deps: ReadonlyArray<
        unknown
      >,
      nextDeps: ReadonlyArray<
        unknown
      >,
      nextCleanup: EffectOrCleanupType,
      returnOfEffect?: unknown,
    }
  >,
  callEffectOrCleanup: <
    DepsType extends ReadonlyArray<
      unknown
    >,
    ReturnOfSelfType,
    ReturnOfOtherType,
    ResultType,
  >(
    effectOrCleanup: (
      EffectOrCleanupType
    ),
    deps: DepsType,
    returnOfOther: ReturnOfOtherType,
    result: ResultType,
  ) => ReturnOfSelfType,
  result: ResultType,
  oldResult: ResultType,
  isForced: boolean,
) {


  currentEnsurer = null;//throws an error if rerendering; rerendering is prohibited durnig reeffect

  for (
    const effectObj
    of
    effectOrResultObjs
  ) {

    if (
      isForced
      ||
      effectObj.isNeedToReeffect
    ) {

      effectObj.isNeedToReeffect = (
        false
      );

      const returnOfCleanup = (
        callEffectOrCleanup(
          effectObj.cleanup,
          effectObj.deps,
          effectObj.returnOfEffect,
          oldResult
        )
      );//on the first run does nothing (because .cleanup is still callCleanup and .returnOfEffect is still undefined) and then is changed to .nextCleanup:

      effectObj.cleanup = (
        effectObj.nextCleanup
      );
      effectObj.deps = (
        effectObj.nextDeps
      );

      effectObj.returnOfEffect = (
        callEffectOrCleanup(
          effectObj.effect,
          effectObj.deps,
          returnOfCleanup,
          result
        )
      );
    };
  };

  currentEnsurer = undefined;//doesnt throw an error if rerendering; now reeffecting is done, so rerendering is no longer prohibited
};

function callWithResult<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfSelfType,
  ReturnOfOtherType,
  ResultType,
>(
  effectOrCleanup: (
    ResultEffectOrCleanup<
      DepsType,
      ReturnOfSelfType,
      ReturnOfOtherType,
      ResultType
    >
  ),
  deps: DepsType,
  returnOfOther: ReturnOfOtherType,
  result: ResultType,
) {

  return effectOrCleanup(
    result,
    deps,
    returnOfOther
  );
};

function callWithoutResult<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfSelfType,
  ReturnOfOtherType,
>(
  effectOrCleanup: (
    EffectOrCleanup<
      DepsType,
      ReturnOfSelfType,
      ReturnOfOtherType
    >
  ),
  deps: DepsType,
  returnOfOther: ReturnOfOtherType,
) {

  return effectOrCleanup(
    deps,
    returnOfOther
  );
};

type ResultEffectOrCleanup<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfSelfType,
  ReturnOfOtherType,
  ResultType,
> = (
  result: ResultType,
  deps: DepsType,
  returnOfOther: ReturnOfOtherType,
) => ReturnOfSelfType;

type EffectOrCleanup<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfSelfType,
  ReturnOfOtherType,
> = (
  deps: DepsType,
  returnOfOther: ReturnOfOtherType,
) => ReturnOfSelfType;


function checkIsNeedToRerender<
  TokenType extends Token,
  PropsType extends Props,
>(
  ensurer: RenderEnsurer<
    TokenType,
    PropsType
  >,
  newProps: PropsType,
) {

  if (
    !ensurer._isAlreadyCalled
  ) {

    return true;
  };

  if (
    ensurer._propsSelectorObjs.length
    ===
    0
  ) {

    return !checkIsSameProps(
      ensurer._props,
      newProps
    );
  };

  let isNeedToRerender;

  for (
    const selectorObj
    of
    ensurer._propsSelectorObjs
  ) {

    const newResult = (
      selectorObj.select
      ?
      selectorObj.select(
        newProps
      )
      :
      (
        newProps
      )[selectorObj.propName]
    );

    if (
      !checkIsSame(
        selectorObj.result,
        newResult
      )
    ) {

      selectorObj.result = newResult;
      isNeedToRerender = true;

      //not breaking the cycle, because other selectorObjs may need to ensure their result
    };
  };

  return isNeedToRerender;
};

function createWrappedProclaimer<
  ResultType,
>(
  outerProclaimer: Proclaimer<
    ResultType
  >,
  resultObjs: Array<
    ResultObj<
      any,
      any,
      any,
      ResultType
    >
  >,
): WrappedProclaimer<ResultType> {

  return {
    proclaim,
    _outerProclaimer: outerProclaimer,
    _resultObjs: resultObjs,
  };
};

function proclaim<
  ResultType,
>(
  this: WrappedProclaimer<ResultType>,
  result: ResultType,
) {

  const oldResult = this._result!;
  //not really "!", but if result is not set, then all cleanups (called inside reeffect()) are still default, so they can handle undefined, and no other function should consume the value of oldResult, so undefined is ok

  this._result = result;
  this._isNeedToReeffect = false;

  reeffect<
    typeof result,
    ResultEffectOrCleanup<
      any,
      any,
      any,
      any
    >
  >(
    this._resultObjs,
    callWithResult,
    result,
    oldResult,
    true
  );

  this._outerProclaimer.proclaim(
    result
  );
};

type WrappedProclaimer<
  ResultType,
> = {

  readonly proclaim: (
    result: ResultType,
  ) => void,

  readonly _outerProclaimer: Proclaimer<
    ResultType
  >,
  readonly _resultObjs: Array<
    ResultObj<
      any,
      any,
      any,
      ResultType
    >
  >,
  _result?: ResultType,
  _isNeedToReeffect?: boolean,
};






const hooksObj = {
  "useState": useState,
  "useReplaceableState": useReplaceableState,
  "useDerivableState": useDerivableState,
  "useStore": useStore,
  "useDeps": useDeps,
  "useCompute": useCompute,
  "usePlug": usePlug,
  "useProps": useProps,
  "useEffect": useEffect,
  "useResultEffect": useResultEffect,
};







function useObj() {

  assertCurrentEnsurer(
    //@bundle-ignore-line //it is passed as arg only for ts "asserts" statement to work; in js it will work well with currentEnsurer from scope, not from args
    currentEnsurer
  );

  if (
    currentEnsurer._isAlreadyCalled
  ) {

    const obj = (
      currentEnsurer._stateObjs[
        stateObjIdx++
      ]
    );

    assertHookObj(obj);

    return obj;

  } else {

    const obj = {};

    currentEnsurer._stateObjs[
      stateObjIdx++
    ] = obj;

    return obj;
  };
};




function useStore<
  StoreType,
  ActionType,
  InitialType,
>(
  derive: (
    (
      oldStore: StoreType,
      action: ActionType,
    ) => StoreType
  ),
  initialValue: InitialType,
  getInitialStore: (
    initialValue: InitialType,
  ) => StoreType,
): readonly [
  store: StoreType,
  dispatch: (
    ...actions: ReadonlyArray<
      ActionType
    >
  ) => void,
];

function useStore<
  StoreType,
  ActionType,
  InitialType,
>(
  derive: (
    (
      oldStore: StoreType,
      action: ActionType,
    ) => StoreType
  ),
  initialStore?: StoreType,
): readonly [
  store: StoreType,
  dispatch: (
    ...actions: ReadonlyArray<
      ActionType
    >
  ) => void,
];

function useStore<
  StoreType,
  ActionType,
  InitialType,
>(
  derive: DeriveStore<
    StoreType,
    ActionType
  >,
  initial?: InitialType,
  init?: (
    initial: InitialType,
  ) => StoreType,
): readonly [
  store: StoreType,
  dispatch: (
    ...actions: ReadonlyArray<
      ActionType
    >
  ) => void,
] {

  return _useState<
    StoreType,
    ReadonlyArray<ActionType>,
    null,
    ActionType,
    DeriveStore<StoreType, ActionType>,
    InitialType
  >(
    getNewStore,
    null,
    derive,
    initial,
    init
  );
};


function useState<
  StateType,
  InitialType,
>(
  initialValue: InitialType,
  getInitialState: (
    initialValue: InitialType,
  ) => StateType,
): readonly [
  state: StateType,
  setState: SetState<StateType>,
  replaceState: ReplaceState<StateType>,
];

function useState<
  StateType,
  InitialType,
>(
  initialState?: StateType,
): readonly [
  state: StateType,
  setState: SetState<StateType>,
  replaceState: ReplaceState<StateType>,
];

function useState<
  StateType,
  InitialType,
>(
  initial?: InitialType,
  init?: (
    initialValue: InitialType,
  ) => StateType,
): readonly [
  state: StateType,
  setState: SetState<StateType>,
  replaceState: ReplaceState<StateType>,
] {

  return _useState(
    getSettedNewState,
    getReplacedNewState,
    null,
    initial,
    init
  );
};


function useReplaceableState<
  StateType,
  InitialType,
>(
  initialValue: InitialType,
  getInitialState: (
    initialValue: InitialType,
  ) => StateType,
): readonly [
  state: StateType,
  replaceState: ReplaceState<StateType>,
];

function useReplaceableState<
  StateType,
  InitialType,
>(
  initialState?: StateType,
): readonly [
  state: StateType,
  replaceState: ReplaceState<StateType>,
];

function useReplaceableState<
  StateType,
  InitialType,
>(
  initial?: InitialType,
  init?: (
    initialValue: InitialType,
  ) => StateType,
): readonly [
  state: StateType,
  replaceState: ReplaceState<StateType>,
] {

  return _useState(
    getReplacedNewState,
    null,
    null,
    initial,
    init
  );
};


function useDerivableState<
  StateType,
  InitialType,
>(
  initialValue: InitialType,
  getInitialState: (
    initialValue: InitialType,
  ) => StateType,
): readonly [
  state: StateType,
  alterState: AlterState<StateType>,
];

function useDerivableState<
  StateType,
  InitialType,
>(
  initialState?: StateType,
): readonly [
  state: StateType,
  alterState: AlterState<StateType>,
];

function useDerivableState<
  StateType,
  InitialType,
>(
  initial?: InitialType,
  init?: (
    initialValue: InitialType,
  ) => StateType,
): readonly [
  state: StateType,
  alterState: AlterState<StateType>,
] {

  return _useState(
    getDerivedNewState,
    null,
    null,
    initial,
    init
  );
};

function _useState<
  StateType,
  ArgsType extends (
    readonly [StateType]
    |
    readonly [DeriveState<StateType>]
    |
    readonly [
      NewStateOrDeriveState<
        StateType
      >
    ]
    |
    ReadonlyArray<ActionType>
  ),
  SecondGetNewStateType extends (
    (
      (
        [newState]: readonly [
          StateType
        ],
      ) => StateType
    )
    |
    null
  ),
  ActionType,
  DeriveStoreType extends (
    null
    |
    DeriveStore<
      StateType,
      ActionType
    >
  ),
  InitialType,
>(
  getNewState: (
    args: (
      ArgsType
    ),
    oldState: StateType,
    derive: DeriveStoreType,
  ) => StateType,
  secondGetNewState: (
    SecondGetNewStateType
  ),
  deriveStore: DeriveStoreType,
  initial?: InitialType,
  init?: (
    initial: InitialType,
  ) => StateType,
): (
  SecondGetNewStateType extends null
  ?
  (
    DeriveStoreType extends null
    ?
    readonly [
      state: StateType,
      changeState: (
        ...args: ArgsType
      ) => void,
    ]
    :
    readonly [
      store: StateType,
      dispatch: (
        ...actions: ArgsType
      ) => void,
    ]
  )
  :
  readonly [
    state: StateType,
    changeState: (
      ...args: ArgsType
    ) => void,
    secondChangeState: (
      newState: StateType,
    ) => void,
  ]
) {

  //@bundle-ignore-line //w/o ts will be redundant because useObj will do this assertion
  assertCurrentEnsurer(currentEnsurer);


  const obj: {
    state: StateType,
    changeState: (
      ...args: ArgsType
    ) => void,
    secondChangeState: (
      SecondGetNewStateType extends null
      ?
      undefined
      :
      (
        newState: StateType,
      ) => void
    ),
  } = useObj() as any;

  if (
    !currentEnsurer._isAlreadyCalled
  ) {

    obj.state = (
      init
      ?
      init(
        initial as InitialType
        //w/o "as" was an error:
        //Argument of type 'InitialType | undefined' is not assignable to parameter of type 'InitialType'. 'InitialType' could be instantiated with an arbitrary type which could be unrelated to 'InitialType | undefined'.
        //but there shouldn't be an error because if init is present as arg, then initial must also be present as arg, because it goes berore init, and you cannot skip optional arg if it is before another arg that is not skipped
      )
      :
      initial as StateType
      //w/o "as" was an error:
      //Type 'StateType | InitialType | undefined' is not assignable to type 'StateType'. 'StateType' could be instantiated with an arbitrary type which could be unrelated to 'StateType | InitialType | undefined'.
      //but if initialState === undefined, then undefined extends StateType, and if init is not present as arg, then InitType extends StateType
    );
    obj.changeState = createChangeState<
      StateType,
      ArgsType,
      ActionType,
      DeriveStoreType
    >(
      obj,
      currentEnsurer,
      getNewState,
      deriveStore
    );

    if (secondGetNewState) {

      //@ts-ignore //Type '(arg: StateType) => void' is not assignable to type 'SecondGetNewStateType extends null ? undefined : (newState: StateType) => void'. //should be assignable because in this execution branch SecondGetNewStateType !extends null
      obj.secondChangeState = (
        createChangeState(
          obj,
          currentEnsurer,
          secondGetNewState,
          null
        )
      );
    };
  };

  if (secondGetNewState) {

    //@ts-ignore //Type '[StateType, (arg: ArgType) => void, (newState: StateType) => void]' is not assignable to type 'SecondGetNewStateType extends null ? [state: StateType, changeState: (arg: ArgType) => void] : [state: StateType, changeState: (arg: ArgType) => void, secondChangeState: (newState: StateType) => void]'. //should be assignable because in this execution branch SecondGetNewStateType !extends null
    return [
      obj.state,
      obj.changeState,
      obj.secondChangeState!,
    ] as const;
  } else {

    //@ts-ignore //Type '[StateType, (arg: ArgType) => void]' is not assignable to type 'SecondGetNewStateType extends null ? [state: StateType, changeState: (arg: ArgType) => void] : [state: StateType, changeState: (arg: ArgType) => void, secondChangeState: (newState: StateType) => void]'. //should be assignable because in this execution branch SecondGetNewStateType extends null
    return [
      obj.state,
      obj.changeState,
    ] as const;
  };
};


function createChangeState<
  StateType,
  ArgsType extends (
    readonly [StateType]
    |
    readonly [DeriveState<StateType>]
    |
    readonly [
      NewStateOrDeriveState<
        StateType
      >
    ]
    |
    ReadonlyArray<ActionType>
  ),
  ActionType,
  DeriveStoreType extends (
    null
    |
    DeriveStore<
      StateType,
      ActionType
    >
  ),
>(
  obj: {
    state: StateType,
  },
  ensurer: NonNullable<CurrentEnsurer>,
  getNewState: (
    args: (
      ArgsType
    ),
    oldState: StateType,
    derive: DeriveStoreType,
  ) => StateType,
  deriveStore: DeriveStoreType,
) {

  return function(
    ...args: ArgsType
  ) {

    const newState = getNewState(
      args,
      obj.state,
      deriveStore
    );

    if (
      !checkIsSame(
        obj.state,
        newState
      )
    ) {

      obj.state = newState;
      rerender(ensurer);
    };
  };
};

function getSettedNewState<
  StateType,
>(
  [newStateOrDeriveState]: readonly [
    NewStateOrDeriveState<
      StateType
    >
  ],
  oldState: StateType,
) {

  return (
    (
      typeof newStateOrDeriveState
      ===
      "function"
    )
    ?
    getDerivedNewState(
      [
        newStateOrDeriveState as (
          DeriveState<StateType>
        )
      ],
      oldState
    )
    :
    getReplacedNewState<StateType>(
      [
        newStateOrDeriveState as (
          StateType
        )
      ]
    )
  );
};

function getReplacedNewState<
  StateType,
>(
  [newState]: readonly [StateType],
) {

  return newState;
};

function getDerivedNewState<
  StateType,
> (
  [deriveState]: readonly [
    DeriveState<StateType>
  ],
  oldState: StateType,
) {

  return deriveState(oldState);
};

function getNewStore<
  StoreType,
  ActionType,
>(
  actions: ReadonlyArray<ActionType>,
  oldStore: StoreType,
  deriveStore: DeriveStore<
    StoreType,
    ActionType
  >,
) {

  return actions.reduce(
    deriveStoreAndDeriveStore<
     StoreType,
     ActionType
    >,
    [oldStore, deriveStore] as const
  )[0];
};

//i. e. derive [store, deriveStore]
function deriveStoreAndDeriveStore<
  StoreType,
  ActionType,
>(
  [
    oldStore,
    deriveStore,
  ]: readonly [
    StoreType,
    DeriveStore<
      StoreType,
      ActionType
    >,
  ],
  action: ActionType,
) {

  return [
    deriveStore(
      oldStore,
      action
    ),
    deriveStore,
  ] as const;
};

type SetState<
  StateType,
> = (
  newStateOrDeriveState: (
    NewStateOrDeriveState<
      StateType
    >
  ),
) => void;

type ReplaceState<
  StateType,
> = (
  newState: StateType
) => void;

type AlterState<
  StateType,
> = (
  deriveState: DeriveState<StateType>,
) => void;


type DeriveState<
  StateType,
> = (
  previousState: StateType,
) => StateType;


type NewStateOrDeriveState<
  StateType,
> = (
  StateType extends AnyFunction
  ?
  never
  :
  (
    StateType
    |
    DeriveState<StateType>
  )
);

type DeriveStore<
  StoreType,
  ActionType,
> = (
  oldStore: StoreType,
  action: ActionType,
) => StoreType;







function useProps<
  PropsType extends Props,
  PropName extends keyof Props,
>(
  propName: PropName,
): PropsType[typeof propName];

function useProps<
  PropsType extends Props,
  ResultType,
>(
  select: SelectProps<
    PropsType,
    ResultType
  >,
): ResultType;

function useProps<
  PropsType extends Props,
>(): PropsType;

function useProps<
  PropsType extends Props,
  ResultType extends unknown,
  SelectorType extends (
    string
    |
    SelectProps<
      PropsType,
      ResultType
    >
    |
    undefined
  ),
>(
  selector?: SelectorType,
) {

  assertCurrentEnsurer(
    //@bundle-ignore-line //it is passed as arg only for ts "asserts" statement to work; in js it will work well with currentEnsurer from scope, not from args
    currentEnsurer
  );

  if (!selector) {

    return currentEnsurer._props;
  };

  if (
    currentEnsurer._isAlreadyCalled
  ) {

    const obj = (
      currentEnsurer._propsSelectorObjs[
        propsSelectObjIdx++
      ]
    );

    assertHookObj(obj);

    //todo?: reassign selector? then need to unify the selector prop and make a different prop for discriminated union

    return obj.result as ResultType;

  } else {

    const obj = (
      typeof selector === "string"
      ?
      {
        propName: selector,
        result: currentEnsurer._props[
          selector
        ] as ResultType,
      }
      :
      {
        select: selector as (
          SelectProps<
            PropsType,
            ResultType
          >
        ),
        result: selector(
          currentEnsurer._props
        ),
      }
    );

    currentEnsurer._propsSelectorObjs[
      propsSelectObjIdx++
    ] = obj;

    return obj.result;
  };
};





function useEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType extends Cleanup<
    DepsType,
    undefined,
    ReturnOfCleanupType
  >,
  ReturnOfCleanupType,
>(
  effect: Effect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  deps?: DepsType,
  cleanup?: undefined
): void;

function useEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType extends unknown,
  ReturnOfCleanupType,
>(
  effect: Effect<
    DepsType,
    (
      ReturnOfEffectType extends (
        Function
      )
      ?
      never
      :
      ReturnOfEffectType
    ),
    ReturnOfCleanupType
  >,
  deps?: DepsType,
  cleanup?: undefined
): void;

function useEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
>(
  effect: Effect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  deps: DepsType | undefined | null,
  cleanup: Cleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
): void;

function useEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
>(
  effect: Effect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  cleanup: Cleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  deps?: DepsType,
): void;

function useEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
>(
  effect: Effect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  depsOrCleanup0: (
    DepsType | undefined | null
    |
    Cleanup<
      DepsType,
      ReturnOfEffectType,
      ReturnOfCleanupType
    >
  ),
  depsOrCleanup1: (
    DepsType | undefined
    |
    Cleanup<
      DepsType,
      ReturnOfEffectType,
      ReturnOfCleanupType
    >
  ),
) {

  assertCurrentEnsurer(
    //@bundle-ignore-line //it is passed as arg only for ts "asserts" statement to work; in js it will work well with currentEnsurer from scope, not from args
    currentEnsurer
  );

  return _useEffect(
    effect,
    depsOrCleanup0,
    depsOrCleanup1,
    currentEnsurer._isAlreadyCalled,
    currentEnsurer._effectObjs,
    callCleanup,
    0
  );
};





function useResultEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType extends (
    ResultCleanup<
      DepsType,
      undefined,
      ReturnOfCleanupType,
      ResultType
    >
  ),
  ReturnOfCleanupType,
  ResultType,
>(
  effect: ResultEffect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  deps?: DepsType,
  cleanup?: undefined
): void;

function useResultEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType extends unknown,
  ReturnOfCleanupType,
  ResultType,
>(
  effect: ResultEffect<
    DepsType,
    (
      ReturnOfEffectType extends (
        Function
      )
      ?
      never
      :
      ReturnOfEffectType
    ),
    ReturnOfCleanupType,
    ResultType
  >,
  deps?: DepsType,
  cleanup?: undefined
): void;

function useResultEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
  ResultType,
>(
  effect: ResultEffect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  deps: DepsType | undefined | null,
  cleanup: ResultCleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
): void;

function useResultEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
  ResultType,
>(
  effect: ResultEffect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  cleanup: ResultCleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  deps?: DepsType,
): void;

function useResultEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
  ResultType,
>(
  effect: ResultEffect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  depsOrCleanup0: (
    DepsType | undefined | null
    |
    ResultCleanup<
      DepsType,
      ReturnOfEffectType,
      ReturnOfCleanupType,
      ResultType
    >
  ),
  depsOrCleanup1: (
    DepsType | undefined
    |
    ResultCleanup<
      DepsType,
      ReturnOfEffectType,
      ReturnOfCleanupType,
      ResultType
    >
  ),
) {

  assertCurrentEnsurer(
    //@bundle-ignore-line //it is passed as arg only for ts "asserts" statement to work; in js it will work well with currentEnsurer from scope, not from args
    currentEnsurer
  );

  return _useEffect(
    effect,
    depsOrCleanup0,
    depsOrCleanup1,
    currentEnsurer._isAlreadyCalled,
    currentEnsurer._proclaimer._resultObjs,
    callResultCleanup,
    1
  );
};


function _useEffect<
  ObjType extends (
    EffectObj<
      any,
      any,
      any
    >
    |
    ResultObj<
      any,
      any,
      any,
      any
    >
  ),
>(
  effect: ObjType["effect"],
  depsOrCleanup0: (
    ObjType["deps"] | undefined | null
    |
    ObjType["cleanup"]
  ),
  depsOrCleanup1: (
    ObjType["deps"] | undefined
    |
    ObjType["cleanup"]
  ),
  isAlreadyCalled: boolean | undefined,
  effectOrResultObjs: Array<
    ObjType
  >,
  defaultCleanup: ObjType["cleanup"],
  effectObjIdxIdx: 0 | 1,
) {

  let _deps: ObjType["deps"] | [];
  let _cleanup: (
    ObjType["cleanup"]
  );

  if (
    typeof depsOrCleanup0
    ===
    "function"
  ) {

    _cleanup = depsOrCleanup0;
    _deps = (
      depsOrCleanup1 as (
        ObjType["deps"] | undefined
      )
      ||
      []
    );
  } else {

    _deps = (
      depsOrCleanup0
      ||
      []
    );
    _cleanup = (
      depsOrCleanup1 as (
        ObjType["cleanup"]
        |
        undefined
      )
      ||
      defaultCleanup
    );
  };

  if (
    isAlreadyCalled
  ) {

    const obj = (
      effectOrResultObjs[
        effectObjIdxs[
          effectObjIdxIdx
        ]++
      ]
    );

    assertHookObj(obj);

    if (
      !checkIsSameItms(
        _deps,
        obj.nextDeps
      )
    ) {

      obj.isNeedToReeffect = true;
      obj.nextDeps = _deps;

      obj.nextCleanup = _cleanup;
      obj.effect = effect;
    };

  } else {

    const obj = {
      effect,
      cleanup: defaultCleanup,//on the first run does nothing (because obj.returnOfEffect is still undefined) and then is changed to obj.nextCleanup
      nextCleanup: _cleanup,
      nextDeps: _deps,
      isNeedToReeffect: true,
    } as ObjType;

    effectOrResultObjs[
      effectObjIdxs[
        effectObjIdxIdx
      ]++
    ] = obj;
  };
};


function callCleanup<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
>(
  deps: DepsType,
  cleanup: Cleanup<
    DepsType,
    undefined,
    ReturnOfCleanupType
  > | void,
) {

  if (typeof cleanup === "function") {

    return cleanup(
      deps,
      undefined
    );
  };
};


function callResultCleanup<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
  ResultType,
>(
  result: ResultType,
  deps: DepsType,
  cleanup: ResultCleanup<
    DepsType,
    undefined,
    ReturnOfCleanupType,
    ResultType
  > | void,
) {

  if (typeof cleanup === "function") {

    return cleanup(
      result,
      deps,
      undefined
    );
  };
};










function useDeps<
  ValueType,
>(
  value: ValueType,
  deps: ReadonlyArray<
    unknown
  >,
) {

  return _useDeps(
    getValue,
    value,
    deps
  );
};

function useCompute<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfComputeType,
>(
  compute: Compute<
    DepsType,
    ReturnOfComputeType
  >,
  deps: DepsType,
) {

  return _useDeps(
    getComputedValue,
    compute,
    deps
  );
};

function _useDeps<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ArgType,
  ValueType,
>(
  getValue: (
    arg: ArgType,
    deps: DepsType,
  ) => ValueType,
  arg: ArgType,
  deps: DepsType,
) {

  const obj: {
    deps: DepsType,
    value: ValueType,
  } = useObj() as any;

  if (
    !(
      obj.deps
      &&
      checkIsSameItms(
        deps,
        obj.deps
      )
    )
  ) {

    obj.deps = deps;
    obj.value = getValue(
      arg,
      deps,
    );
  };

  return obj.value;
};

function getValue<
  ValueType,
>(
  value: ValueType,
) {

  return value;
};

function getComputedValue<
  ValueType,
  DepsType extends ReadonlyArray<
    unknown
  >,
>(
  compute: Compute<
    DepsType,
    ValueType
  >,
  deps: DepsType,
) {

  return compute(deps);
};

type Compute<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfComputeType,
> = (
  deps: DepsType
) => ReturnOfComputeType;






function usePlug<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ArgsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfCallbackType,
>(
  callback: PlugCallback<
    DepsType,
    ArgsType,
    ReturnOfCallbackType
  >,
  deps: DepsType,
) {

  const obj: {
    deps: DepsType,
    callback: PlugCallback<
      DepsType,
      ArgsType,
      ReturnOfCallbackType
    >,
    plug: (
      ...args: ArgsType
    ) => ReturnOfCallbackType,
  } = useObj() as any;

  if (
    !obj.deps
  ) {

    obj.plug = function(
      ...args: ArgsType
    ) {

      return obj.callback.call(
        this,
        deps,
        args
      );
    };
  };

  if (
    !obj.deps
    ||
    !checkIsSameItms(
      deps,
      obj.deps
    )
  ) {

    obj.deps = deps;
    obj.callback = callback;
  };

  return obj.plug;
};

type PlugCallback<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ArgsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfCallbackType,
> = (
  deps: DepsType,
  args: ArgsType
) => ReturnOfCallbackType;










function assertHookObj(
  obj: {} | undefined,
): asserts obj is {} {

  if (!obj) {

    throw new Error(
      "Error: during this rerender hooks are used more times than during the initial render; consider checking that any hook is not used conditionnaly or in a cycle"
    );
  };
};


function assertCurrentEnsurer(
  //@bundle-ignore-line //it is passed as arg only for ts "asserts" statement to work; in js it will work well with currentEnsurer from scope, not from args
  currentEnsurer: CurrentEnsurer,
): asserts currentEnsurer is (
  NonNullable<CurrentEnsurer>
) {

  if (!currentEnsurer) {

    throw new Error(
      "Error: hook used outside of a render; consider checking that any hook is not used in effect, in resultEffect or in event hanlder"
    );
  };
};



let currentEnsurer: CurrentEnsurer;
let stateObjIdx: number;
let propsSelectObjIdx: number;
const effectObjIdxs = [0, 0];

type CurrentEnsurer = (
  RenderEnsurer<any, any>
  |
  null
  |
  undefined
);









type RenderEnsurer<
  TokenType extends Token,
  PropsType extends Props,
> = {

  ensure: (
    this: RenderEnsurer<
      TokenType,
      PropsType
    >,
    updationData: PropsType | undefined,
  ) => void,
  readonly cleanup: () => void,

  _instanceOfRender?: (
    InstanceOfRender
  ),

  readonly _render: Render,
  readonly _createInstanceOfRender: (
    CreateInstanceOfRender
  ),
  readonly _callRender: CallRender<
    TokenType
  >,
  readonly _resultDemander: Demander<
    TokenType
  >,
  readonly _proclaimer: (
    WrappedProclaimer<
      Result<TokenType>
    >
  ),

  readonly _stateObjs: Array<Props>,
  readonly _propsSelectorObjs: Array<
    PropsSelectorObj<
      PropsType,
      unknown
    >
  >,
  readonly _effectObjs: Array<
    EffectObj<
      any,
      any,
      any
    >
  >,
  _props: PropsType | {},
  _isAlreadyCalled?: true,
};



type PropsSelectorObj<
  PropsType extends Props,
  ResultType extends unknown,
> = (
  {
    result: ResultType,
  }
  &
  (
    {
      select: SelectProps<
        PropsType,
        ResultType
      >,
    }
    |
    {
      propName: string,
      select?: never,
    }
  )
);

type SelectProps<
  PropsType extends Props,
  ResultType
> = (
  props: PropsType,
) => ResultType;



type EffectObj<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
> = {
  effect: Effect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  cleanup: Cleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  nextCleanup: Cleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType
  >,
  deps: DepsType,
  nextDeps: DepsType,
  returnOfEffect?: ReturnOfEffectType,
  isNeedToReeffect: boolean;
};

type Effect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
> = (
  deps: DepsType,
  returnOfCleanup: (
    ReturnOfCleanupType
    |
    undefined
  ),
) => ReturnOfEffectType;

type Cleanup<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
> = (
  deps: DepsType,
  returnOfEffect: ReturnOfEffectType,
) => ReturnOfCleanupType;


type ResultObj<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
  ResultType,
> = {
  effect: ResultEffect<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  cleanup: ResultCleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  nextCleanup: ResultCleanup<
    DepsType,
    ReturnOfEffectType,
    ReturnOfCleanupType,
    ResultType
  >,
  deps: DepsType,
  nextDeps: DepsType,
  returnOfEffect?: ReturnOfEffectType,
  isNeedToReeffect: boolean;
};

type ResultEffect<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
  ResultType,
> = (
  result: ResultType,
  deps: DepsType,
  returnOfCleanup: (
    ReturnOfCleanupType
    |
    undefined
  ),
) => ReturnOfEffectType;

type ResultCleanup<
  DepsType extends ReadonlyArray<
    unknown
  >,
  ReturnOfEffectType,
  ReturnOfCleanupType,
  ResultType,
> = (
  result: ResultType,
  deps: DepsType,
  returnOfEffect: ReturnOfEffectType,
) => ReturnOfCleanupType;






type CallRender<
  TokenType extends Token,
> = (
  instanceOfRender: (
    InstanceOfRender
  ),
  props: Props,
  hooksObj: HooksObj<Props>,
) => TokenType;

type CreateInstanceOfRender = (
  render: Render,
  props: Props,
  hooksObj: HooksObj<Props>,
) => InstanceOfRender


type HooksObj<
  PropsType extends {},
> = {
  [
    HookName in keyof typeof hooksObj
  ]: (
    HookName extends "useProps"
    ?
    UseProps<PropsType>
    :
    typeof hooksObj[HookName]
  )
};


type UseProps<
  PropsType extends {},
> = <
  SelectorType extends (
    keyof PropsType
    |
    (
      (
        props: PropsType
      ) => unknown
    )
    |
    undefined
  ),
>(
  selector?: SelectorType,
) => (
  SelectorType extends undefined
  ?
  PropsType
  :
  SelectorType extends (
    keyof PropsType
  )
  ?
  PropsType[SelectorType]
  :
  SelectorType extends AnyFunction
  ?
  ReturnType<SelectorType>
  :
  never
);


type AnyFunction = (
  (...args: any) => any
);