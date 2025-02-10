export {
  createChildNodesEnforcer,
};


import {
  emptyArr,
} from "../utils.ts";

import {
  getLcsData,
} from "./lcs.ts";




function createChildNodesEnforcer(
  parentNode: ParentNode,
): ChildNodesEnforcer {

  return {
    enforce,
    _parentNode: parentNode,
    _nodes: emptyArr,
  };
};


function enforce(
  this: ChildNodesEnforcer,
  newChildNodes: ReadonlyArray<Node>,
) {

  //done before mutateChildren:
  const oldChildNodes = this._nodes;
  this._nodes = newChildNodes;
  //because otherwise was causing silent errors;

  mutateChildren(
    this._parentNode,
    oldChildNodes,
    newChildNodes
  );
};




function mutateChildren(
  parentNode: ParentNode,
  oldChildNodes: ReadonlyArray<Node>,
  newChildNodes: ReadonlyArray<Node>,
) {

  const matches = getLcsData(
    oldChildNodes,
    newChildNodes
  );

  for (
    let i = matches.length - 2,
    afterUnmatchingOldIdx = (
      matches[
        matches.length - 1
      ][0]
    );
    i >= 0;
    i--
  ) {

    const beforeUnmatchingOldIdx = (
      matches[i][0]
    );

    for (
      let j = (
        afterUnmatchingOldIdx
        -
        1
      );
      j > beforeUnmatchingOldIdx;
      j--
    ) {

      parentNode["removeChild"](
        oldChildNodes[j]
      );
    };

    afterUnmatchingOldIdx = (
      beforeUnmatchingOldIdx
    );
  };


  for (
    let i = 1,
    beforeUnmatchingNewIdx = (
      matches[0][1]
    );
    i < matches.length;
    i++
  ) {

    const afterUnmatchingNewIdx = (
      matches[i][1]
    );

    const nodeAfter = (
      newChildNodes[
        afterUnmatchingNewIdx
      ]
      ||
      null
    );

    for (
      let j = (
        beforeUnmatchingNewIdx
        +
        1
      );
      j < afterUnmatchingNewIdx;
      j++
    ) {

      parentNode["insertBefore"](
        newChildNodes[j],
        nodeAfter
      );
    };

    beforeUnmatchingNewIdx = (
      afterUnmatchingNewIdx
    );
  };
};




type ChildNodesEnforcer = {

  readonly enforce: (
    this: ChildNodesEnforcer,
    nodes: ReadonlyArray<Node>,
  ) => void,

  readonly _parentNode: ParentNode,

  _nodes: ReadonlyArray<Node>,
};