export {
  createElemEnsurer,
};


import type {
  CreateElem,
  ElemByTag,
} from "../utilityTypes.ts";

import type {
  Proclaimer,
  ParsedData,
  Result,
  Token,
} from "../types.ts";

import {
  checkIsSame,
  emptyObj,
} from "../utils.ts";

import {
  createChildNodesEnforcer,
} from "../tools/childNodesEnforcer.ts";

import {
  mutaters,
} from "../tools/elemMutaters.ts";

import {
  createDemander,
} from "../demander.ts";

import {
  createResultProclaimer,
} from "../tools/resultProclaimer.ts";




//todo: make more generic (to use for different Node types that dont need children, attributes etc.)
function createElemEnsurer<
  TagType extends string,
  OwnDataType extends ElemOwnData,
  ChildTokenType extends Token,
>(
  proclaimer: Proclaimer<
    ElemByTag<TagType>
  >,
  {
    tag,
  }: {
    tag: TagType,//creationData,
  },
): ElemEnsurer<
  TagType,
  OwnDataType,
  ChildTokenType
> {

  const elem = createElem(
    tag
  );

  const childProclaimer: Proclaimer<
    Result<ChildTokenType>
  > = (
    createResultProclaimer(
      createChildNodesEnforcer(
        elem
      )
    )
  );

  return {
    ensure: init<
      TagType,
      OwnDataType,
      ChildTokenType
    >,
    cleanup,
    _proclaimer: proclaimer,
    _elem: elem,
    _ownData: emptyObj,
    _childDemander: createDemander(
      childProclaimer
    ),
  };
};

function cleanup<
  TagType extends string,
  OwnDataType extends ElemOwnData,
  ChildTokenType extends Token,
>(
  this: ElemEnsurer<
    TagType,
    OwnDataType,
    ChildTokenType
  >,
) {

  this._childDemander.cleanup();
};

function init<
  TagType extends string,
  OwnDataType extends ElemOwnData,
  ChildTokenType extends Token,
>(
  this: ElemEnsurer<
    TagType,
    OwnDataType,
    ChildTokenType
  >,
  updationData: {
    readonly ownUpdationData: (
      OwnDataType
    ),
    readonly childParsedData: (
      ParsedData<
        ChildTokenType
      >
    ),
  },
) {

  this.ensure = ensure;

  this.ensure(updationData);

  this._proclaimer.proclaim(
    this._elem
  );
};

function ensure<
  TagType extends string,
  OwnDataType extends ElemOwnData,
  ChildTokenType extends Token,
>(
  this: ElemEnsurer<
    TagType,
    OwnDataType,
    ChildTokenType
  >,
  {
    ownUpdationData,
    childParsedData,
  }: {
    readonly ownUpdationData: (
      OwnDataType
    ),
    readonly childParsedData: (
      ParsedData<
        ChildTokenType
      >
    ),
  },
) {

  mutateElemOwnState<
    TagType,
    OwnDataType
  >(
    this._elem,
    this._ownData,
    ownUpdationData
  );

  this._ownData = ownUpdationData;

  this._childDemander.demand(
    childParsedData
  );
};

function mutateElemOwnState<
  TagType extends string,
  OwnDataType extends ElemOwnData,
>(
  elem: ElemByTag<TagType>,
  oldElemStateData: ElemOwnData,
  newElemStateData: OwnDataType,
) {

  for (
    //todo: extract similar logic with "on" prop, "style" prop, "props" prop and "attrs" prop
    const propName
    in
    oldElemStateData
  ) {

    if (//if old prop is being removed
      !(
        propName
        in
        newElemStateData
      )
    ) {

      //handling it in case it is a special prop:
      applyMutaters(
        elem,
        propName,
        true,
        oldElemStateData[
          propName
        ],
        false,
      );

      //if is not a special prop: do nothing:
      //if old === {customProp: 1, title: "Some title"} and new === {} - do nothing, because different props can require different null-values for resetting to default. It is user responsibility to provide such values in newElemStateData
    };
  };

  for (
    const propName
    in
    newElemStateData
  ) {

    const newValue = newElemStateData[
      propName
    ];
    const isOldValue = (
      propName in oldElemStateData
    );

    //handling it in case it is a special prop:
    const isDone = applyMutaters(
      elem,
      propName,
      isOldValue,
      oldElemStateData[
        propName
      ],
      true,
      newValue
    );

    if (
      !isDone //not done
      && //and
      !(//not (persistent and unchanged)
        isOldValue
        &&
        checkIsSame(
          oldElemStateData[
            propName
          ],
          newValue
        )
      )
    ) {
      elem[
        propName as keyof typeof elem
      ] = newValue as any;//todo
    };
  };
};


type ElemOwnData = {
  [propName: string]: unknown,
};



function applyMutaters(
  elem: HTMLElement,
  propName: string,
  isOldValue: boolean,
  oldValue: unknown,
  isNewValue: boolean,
  newValue?: unknown,
) {

  for (const mutater of mutaters) {

    //if is a special prop:
    if (
      mutater.checkProp
      ?
      //if passed checking as a special prop:
      mutater.checkProp(propName)
      :
      //or if found in the list of special props:
      ~mutater.propNames.indexOf(
        propName
      )//todo?: dynamic propNames for optimization
    ) {
      //applying changes:
      mutater.mutate(
        elem,
        (
          isNewValue
          ?
          newValue
          :
          mutater.emptyValue
        ),
        (
          isOldValue
          ?
          oldValue
          :
          mutater.emptyValue
        ),
        propName
      );

      //returning true if is done:
      return true;
    };
  };
};



function createElem<
  TagType extends string,
>(
  tag: TagType,
) {
  return (
    document["createElement"] as (
      CreateElem
    )
  )(
    tag
  );
};


type ElemEnsurer<
  TagType extends string,
  OwnDataType extends {},
  ChildTokenType extends Token,
> = {

  //assigned on creation and changed on initializaton:
  ensure: (
    this: ElemEnsurer<
      TagType,
      OwnDataType,
      ChildTokenType
    >,
    newData: {
      readonly ownUpdationData: (
        OwnDataType
      ),
      readonly childParsedData: (
        ParsedData<
          ChildTokenType
        >
      ),
    },
  ) => void,

  //assigned once on creation:
  readonly cleanup: () => void,
  readonly _proclaimer: Proclaimer<
    ElemByTag<TagType>
  >,
  readonly _elem: ElemByTag<TagType>,
  readonly _childDemander: {
    demand: (
      newChildData: ParsedData<
        ChildTokenType
      >
    ) => void,
    cleanup: () => void,
  },

  //can change on every updation:
  _ownData: ElemOwnData,
};