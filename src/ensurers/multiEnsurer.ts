export {
  createMultiEnsurer,
  //@bundle-ignore-line //irrelevant if bunlded into a single file:
  setParse,
};


import {
  createDemander,
} from "../demander.ts";

import type {
  Token,
  Tokens,
  Result,
  Proclaimer,
  Results,
  Demander,
  MultiLocalUpdationData,
  Parse,
} from "../types.ts";

import {
  emptyArr,
  emptyObj,
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




function createMultiEnsurer<
  TokensType extends Tokens,
>(
  multiProclaimer: Proclaimer<
    Results<TokensType>
  >,
): MultiEnsurer<TokensType> {

  return {
    ensure,
    cleanup,

    _multiProclaimer: multiProclaimer,

    _collectors: emptyArr,
  };
};


function cleanup<
  TokensType extends Tokens,
>(
  this: MultiEnsurer<TokensType>,
) {

  for (
    const collector
    of
    this._collectors
  ) {

    collector.demander.cleanup();
  };
};

function ensure<
  TokensType extends Tokens,
>(
  this: MultiEnsurer<TokensType>,
  localUpdationData: (
    MultiLocalUpdationData<
      TokensType
    >
  ),
) {

  this._isSingle = false;
  this._isSomeChanged = false;

  for (
    const collector
    of
    this._collectors
  ) {

    collector.isRelevant = false;
  };

  const newCollectors = (
    localUpdationData.tokens.map(
      provideUpdatedCollector<
        TokensType
      >,
      this
    ) as Collectors<TokensType>
      //looks like it is impossible to do this w/o "as"
  );

  const isSomeChanged = (
    this._isSomeChanged
  );//need this? because now collector.ensurer.cleanup() is separated from .ensure() (thus should not affect this._isSomeChanged), so maybe not; but maybe should leave this just in case user will call setState() inside some effect's cleanup or something like that

  for (
    const collector
    of
    this._collectors
  ) {

    if (!collector.isRelevant) {
      collector.demander.cleanup();
    };
  };

  this._isSingle = true;

  this._collectors = newCollectors;

  if (isSomeChanged) {

    return proclaimMultiResults<
      TokensType
    >(
      newCollectors,
      this._multiProclaimer
    );
  };
};


function provideUpdatedCollector<
  TokensType extends Tokens,
>(
  this: MultiEnsurer<TokensType>,
  token: TokensType[number],
  idx: number,
) {

  const parsedData = parse({token});
    //todo: context
      //pass in this? this: {multiEnsurer, context}

  let collector = (
    parsedData.key === keyForUnkeyed
    ?
    getUnkeyedCollector(
      this._collectors,
      idx
    )
    :
    getKeyedCollector(
      this._collectors,
      parsedData.key
      //not keyForUnkeyed
      //not NaN (ensured in parse() function)
    )
  );

  if (collector) {

    collector.isRelevant = true;
  } else {

    collector = createCollector<
      TokensType
    >(
      this,
      parsedData.key
    );
  };

  collector.demander.demand(
    parsedData
  );

  return collector;
};


function getKeyedCollector<
  TokensType extends Tokens,
>(
  collectors: Collectors<TokensType>,
  key: unknown,
  //key must not be keyForUnkeyed
  //key must not be NaN
) {

  for (
    const collector of collectors
  ) {

    if (collector.key === key) {

      return collector;
    };
  };
};

function getUnkeyedCollector<
  TokensType extends Tokens,
>(
  collectors: Collectors<TokensType>,
  idx: number,
) {

  const collector = collectors[idx];

  if (
    collector
    &&
    (collector.key === keyForUnkeyed)
  ) {

    return collector;
  };
};


function proclaimMultiResults<
  TokensType extends Tokens,
>(
  collectors: Collectors<TokensType>,
  multiProclaimer: Proclaimer<
    Results<TokensType>
  >,
) {

  const results = collectors.map(
    getCollectorResult<
      TokensType[number]
    >
  );

  multiProclaimer.proclaim(
    results as Results<TokensType>
      //looks like it is impossible to do this w/o "as"
  );
};

function getCollectorResult<
  TokenType extends Token,
>(
  collector: Collector<TokenType>,
) {

  return (
    collector.singleProclaimer._result!
      //"!" because .ensurer.ensure() is already called (after creation) and .proclaimer.result is already set
  );
};


function createCollector<
  TokensType extends Tokens,
>(
  multiEnsurer: MultiEnsurer<
    TokensType
  >,
  key: unknown,
): Collector<TokensType[number]> {

  const singleProclaimer = (
    createSingleProclaimer<
      TokensType
    >(
      multiEnsurer
    )
  );

  const demander = (
    createDemander(
      singleProclaimer,
    )
  );

  return {
    demander,
    key,
    singleProclaimer: (
      singleProclaimer as unknown as (
        SingleProclaimer<
          Tokens
        >
      )//todo w/o "as"
    ),
  };
};


function createSingleProclaimer<
  TokensType extends Tokens,
>(
  multiEnsurer: MultiEnsurer<
    TokensType
  >,
): SingleProclaimer<
  TokensType
> {

  return {
    proclaim: proclaim<TokensType>,
    _multiEnsurer: (
      multiEnsurer
    ),
  };
};

function proclaim<
  TokensType extends Tokens,
>(
  this: SingleProclaimer<TokensType>,
  result: Result<TokensType[number]>,
) {

  this._result = result;

  const multiEnsurer = (
    this._multiEnsurer
  );

  if (multiEnsurer._isSingle) {

    proclaimMultiResults<
      TokensType
    >(
      multiEnsurer._collectors,
      multiEnsurer._multiProclaimer
    );
  } else {

    multiEnsurer._isSomeChanged = true;
  };
};




type Collector<
  TokenType extends Token,
> = {

  readonly demander: Demander<
    TokenType
  >,
  readonly key: unknown,

  isRelevant?: boolean,

  readonly singleProclaimer: (
    SingleProclaimer<
      Tokens//todo?: better typization?
    >
  ),
};

type Collectors<
  TokensType extends Tokens,
> = (
  {
    [
      Idx in keyof TokensType
    ]: Collector<TokensType[Idx]>
  }
  |
  readonly []
);


type SingleProclaimer<
  TokensType extends Tokens,
> = {

  readonly proclaim: (
    this: SingleProclaimer<TokensType>,
    result: Result<TokensType[number]>,
  ) => void,

  _result?: Result<TokensType[number]>,
  readonly _multiEnsurer: (
    MultiEnsurer<TokensType>
  ),
};



type MultiEnsurer<
  TokensType extends Tokens,
> = {

  readonly ensure: (
    this: MultiEnsurer<TokensType>,
    newData: MultiLocalUpdationData<
      TokensType
    >,
  ) => void,
  readonly cleanup: () => void,

  readonly _multiProclaimer: Proclaimer<
    Results<TokensType>
  >,

  _collectors: Collectors<TokensType>,
  _isSingle?: boolean,
  _isSomeChanged?: boolean,
};



const keyForUnkeyed = emptyObj;