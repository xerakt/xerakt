export {
  createPrimitiveEnsurer,
};


import type {
  PrimitiveToken,
  PrimitiveResult,
  Proclaimer,
} from "../types.ts";

import {
  doNothing,
} from "../utils.ts";




/* for simple values such as strings, uncontrolled Node, false -
they don't have internal state (or we don't care about their internal state, as in case of uncontrolled Node),
they are considered same if they are equal (NaN is already handled before - numbers are converted to strings, so "NaN" === "NaN"),
they are considered different if they are not equal (so the case of {} !== {} will be handled in another function, not here),
new Node() !== new Node() (even if they have same props) - it's OK, because one may contain user selection while other may not, so they need to be considered not equal
*/




function createPrimitiveEnsurer<
  TokenType extends PrimitiveToken
>(
  proclaimer: {
    proclaim: (
      result: PrimitiveResult<
        TokenType
      >,
    ) => void,
  },
): PrimitiveEnsurer<TokenType> {

  return {
    ensure,
    cleanup: doNothing,
    _proclaimer: proclaimer,
  };
};

function ensure<
  TokenType extends PrimitiveToken
>(
  this: PrimitiveEnsurer<TokenType>,
  newValue: (
    PrimitiveResult<TokenType>
  ),
) {

  if (
    (//no NaN possible, so just compare:
      newValue
      !==
      this._currentValue
    )
  ) {

    this._currentValue = newValue;

    this._proclaimer.proclaim(
      newValue,
    );
  };
};



type PrimitiveEnsurer<
  TokenType extends PrimitiveToken
> = {

  //assigned once on creation:
  readonly ensure: (
    this: PrimitiveEnsurer<TokenType>,
    newData: PrimitiveResult<TokenType>,
  ) => void,
  readonly cleanup: () => void,
  readonly _proclaimer: Proclaimer<
    PrimitiveResult<TokenType>
  >,

  //can change on every updation:
  _currentValue?: PrimitiveResult<
    TokenType
  >,
};