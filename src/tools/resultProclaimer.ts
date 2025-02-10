export {
  createResultProclaimer,
};


import type {
  Result,
  Token,
} from "../types.ts";

import {
  emptyArr,
  flat,
} from "../utils.ts";




function createResultProclaimer<
  TokenType extends Token,
>(
  nodesEnforcer: NodesEnforcer,
): ResultProclaimer<TokenType> {

  return {
    proclaim,
    _textObjs: emptyArr,
    _nodesEnforcer: nodesEnforcer,
  };
};


//makes Nodes from results: falses are skipped, adjacent strings are joined and assigned as .data to Text nodes; Text nodes are cached after every call for using them in the next call; if there is not enough cached Text nodes from the previous call, they are created (and then also cached for the next call); if there was too many in the cache, the redundant ones are not cached for the next call;
function proclaim<
  TokenType extends Token,
>(
  this: ResultProclaimer<TokenType>,
  result: Result<TokenType>,
) {

  const results = flat(
    [result]
  ) as ReadonlyArray<//todo
    Node
    |
    string
    |
    false
  >;

  const nodes: Array<
    Node
  > = [];
  const newTextObjs: Array<
    TextObj
  > = [];

  for (
    let resultIdx = 0,
    textObjIdx = 0;
    (
      resultIdx
      <
      results.length
    );
    resultIdx++
  ) {

    const result = results[
      resultIdx
    ];

    if (
      typeof result
      ===
      "string"
    ) {

      const textResults = [
        result,
      ];

      while (true) {

        const nextItm = (
          results[++resultIdx]
        );

        if (
          typeof nextItm
          ===
          "string"
        ) {

          textResults.push(
            nextItm
          );

        } else {

          resultIdx--;

          break;
        };
      };

      const newText = (
        textResults.join("")
      );

      const textObj = (
        provideUpdatedTextObj(
          this._textObjs[
            textObjIdx++
          ],
          newText
        )
      );

      newTextObjs.push(textObj);
      nodes.push(textObj.node);

    } else {

      if (result) {

        nodes.push(
          result
        );
      };
    };
  };

  this._textObjs = newTextObjs;

  this._nodesEnforcer.enforce(nodes);
};

function provideUpdatedTextObj(
  textObj: TextObj | undefined,
  newText: string,
): TextObj {

  if (textObj) {

    if (
      newText !== textObj.text
    ) {

      //todo: extract similar logic with charDataUpdater

      textObj.node["data"] = newText;
      textObj.text = newText;
    };

    return textObj;

  } else {

    return {
      node: document["createTextNode"](
        newText
      ),
      text: newText,
    };
  };
};


type ResultProclaimer<
  TokenType extends Token,
> = {

  readonly proclaim: (
    this: ResultProclaimer<TokenType>,
    result: Result<TokenType>,
  ) => void,

  readonly _nodesEnforcer: (
    NodesEnforcer
  ),

  _textObjs: ReadonlyArray<TextObj>,
};

type TextObj = {
  text: string,
  node: Text,
};


type NodesEnforcer = {

  readonly enforce: (
    this: NodesEnforcer,
    nodes: ReadonlyArray<Node>,
  ) => void,
};