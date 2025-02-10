export {
  createDemander,
};


import type {
  Ensurer,
  Distinctors,
  ParsedData,
  CreationData,
  CreateEnsurer,
  Token,
  Proclaimer,
  Result,
} from "./types.ts";

import {
  checkIsSameNonNanItms,
  doNothing,
  emptyArr,
} from "./utils.ts";




function createDemander<
  TokenType extends Token,
>(
  proclaimer: Proclaimer<
    Result<TokenType>
  >,
): Demander<TokenType> {

  return {
    demand: demand<TokenType>,
    cleanup,

    _proclaimer: proclaimer,

    _distinctors: emptyArr,
    _ensurer: emptyEnsurer,
  };
};

function cleanup<
  TokenType extends Token,
>(
  this: Demander<TokenType>,
) {

  this._ensurer!.cleanup();
    //"!" because can be called only after .ensure(), thus _ensurer is already set
};

function demand<
  TokenType extends Token,
>(
  this: Demander<TokenType>,
  {
    distinctors,
    createEnsurer,
    creationData,
    localUpdationData,
    key,
  }: ParsedData<TokenType>,
) {

  guaranteeRelevantEnsurer<
    TokenType
  >(
    this,
    distinctors,
    key,
    createEnsurer,
    creationData,
  );

  this._ensurer!.ensure(
    localUpdationData
  );
    //"!" because _ensurer is already set in guaranteeRelevantEnsurer()
};

function guaranteeRelevantEnsurer<
  TokenType extends Token,
>(
  demander: Demander<TokenType>,
  distinctors: Distinctors,
  key: unknown,
  createEnsurer: (
    CreateEnsurer<
      TokenType
    >
  ),
  creationData: CreationData<TokenType>,
) {

  const oldDistinctors = (
    demander._distinctors
  );
  const newDistinctors = ([
    createEnsurer,
    key,
    ...distinctors,
  ]);

  const isOldEnsurerRelevant = (
    checkIsSameNonNanItms(
      oldDistinctors,
      newDistinctors,
    )
  );

  if (!isOldEnsurerRelevant) {

    const oldEnsurer = (
      demander._ensurer
    );

    //cleanup old effects:
    oldEnsurer.cleanup();

    demander._ensurer = (
      createEnsurer(
        demander._proclaimer,
        creationData,
      )
    );

    demander._distinctors = (
      newDistinctors
    );
  };
};




type Demander<
  TokenType extends Token,
> = {

  readonly demand: (
    this: Demander<TokenType>,
    parsedData: ParsedData<TokenType>,
  ) => void,

  readonly cleanup: () => void,

  readonly _proclaimer: Proclaimer<
    Result<TokenType>
  >,

  _ensurer: Ensurer<TokenType>,
  _distinctors: Distinctors,
};



const emptyEnsurer = {
  ensure: doNothing,
  cleanup: doNothing,
};