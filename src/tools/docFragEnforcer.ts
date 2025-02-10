export {
  createDocFragEnforcer,
};


import {
  checkIsSameNonNanItms,
  emptyArr,
} from "../utils.ts";




function createDocFragEnforcer(
  docFrag: DocumentFragment,
): DocFragEnforcer {

  return {
    enforce: init,
    _docFrag: docFrag,
    _nodes: emptyArr
  };
};

function init(
  this: DocFragEnforcer,
  nodes: ReadonlyArray<Node>,
) {

  this.enforce = assertSameNodes;

  this._nodes = nodes;

  for (const node of nodes) {

    this._docFrag!["appendChild"](node);
    //"!" because the property is assigned at creation and still not deleted before the end of initialization;
  };

  delete this._docFrag;
};

function assertSameNodes(
  this: DocFragEnforcer,
  nodes: ReadonlyArray<Node>,
) {

  if (
    !checkIsSameNonNanItms(
      this._nodes,
      nodes
    )
  ) {

    throw new TypeError(
      "Illegal result: the argument passed to xerakt has rendered a result that corresponds to different DOM node(s) than its initial result; consider wrapping it as a child of some container with constant DOM node (e. g. instead of xerakt(app) use xerakt({tag: \"div\", child: app}))"
    );
  };
};


type DocFragEnforcer = {

  enforce: (
    this: DocFragEnforcer,
    nodes: ReadonlyArray<Node>,
  ) => void,

  _docFrag?: DocumentFragment,

  _nodes: ReadonlyArray<Node>,
};
