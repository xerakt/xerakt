export {
  createCharDataEnsurer,
};


import type {
  CharDataTag,
  Proclaimer,
} from "../types.ts";

import type {
  CharDataNameMap,
} from "../utilityTypes.ts";

import {
  doNothing,
} from "../utils.ts";




//todo: should extract common logic of this and buildPrimitiveUpdating (and maybe other functions), but, probably, typing will be difficult

function createCharDataEnsurer<
  TagType extends (
    CharDataTag
  ),
  DataType extends string,
>(
  proclaimer: Proclaimer<
    CharDataNameMap[TagType]
  >,
  create: (
    data: DataType,
  ) => CharDataNameMap[TagType],
): CharDataEnsurer<
  TagType,
  DataType
> {

  return {
    ensure: init<TagType, DataType>,
    cleanup: doNothing,
    _create: create,
    _proclaimer: proclaimer,
  };
};


function init<
  TagType extends CharDataTag,
  DataType extends string,
>(
  this: CharDataEnsurer<
    TagType,
    DataType
  >,
  newData: DataType,
) {

  this.ensure = ensure<
    TagType,
    DataType
  >;

  this._data = newData;
  const node = this._create(
    newData
  );
  this._node = node;

  this._proclaimer.proclaim(
    node
  );
};


function ensure<
  TagType extends CharDataTag,
  DataType extends string,
>(
  this: CharDataEnsurer<
    TagType,
    DataType
  >,
  newData: DataType,
) {

  if (
    newData
    !==
    this._data!
  ) {
    this._data = newData;
    mutateCharData(
      this._node!,//this is always the second call, the first was init(), where ._node was set, so it can't be undefined, hence "!"
      newData
    );
  };
};



function mutateCharData(
  node: CharacterData,
  newData: string,
) {
  node["data"] = newData;
};



type CharDataEnsurer<
  TagType extends CharDataTag,
  DataType extends string,
> = {

  //assigned on creation and changed on initializaton:
  ensure: (
    this: CharDataEnsurer<
      TagType,
      DataType
    >,
    newData: DataType,
  ) => void,

  //assigned once on creation:
  readonly cleanup: () => void,
  readonly _proclaimer: Proclaimer<
    CharDataNameMap[TagType]
  >,
  readonly _create: (
    data: DataType,
  ) => CharDataNameMap[TagType],

  //assigned once on intitalization:
  _node?: CharDataNameMap[
    TagType
  ],

  //can change on every updation:
  _data?: DataType,
};