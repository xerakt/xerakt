export {
  xerakt,
};


import type {
  Result,
  Token,
} from "./types.ts";

import {
  parse,
} from "./parse.ts";

import {
  createDemander,
} from "./demander.ts";

import {
  createResultProclaimer,
} from "./tools/resultProclaimer.ts";

import {
  createDocFragEnforcer,
} from "./tools/docFragEnforcer.ts";




/*
//usage:

document.getElementById("root").append(
  xerakt(token)
);
*/

function xerakt<
  TokenType extends Token
>(
  token: TokenType
) {

  const docFrag = (
    document["createDocumentFragment"]()
  );

  const parsedData = (
    parse({token})
  );

  const demander = (
    createDemander<TokenType>(
      createResultProclaimer<
        Result<TokenType>
      >(
        createDocFragEnforcer(
          docFrag
        )
      )
    )
  );

  demander.demand(parsedData);

  return docFrag;
};