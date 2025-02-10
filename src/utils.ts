export {
  doNothing,
  emptyArr,
  emptyObj,
  checkIsSameProps,
  checkIsSameItms,
  checkIsSameNonNanItms,
  checkIsDiffItmsAtSomeIdx0,
  checkIsSame,
  checkIsStrictlyEqual,
  flat,
  kebabFromCamel,
};


import type {
  Props,
} from "./types.ts";

import type {
  Flat,
} from "./utilityTypes.ts";




function doNothing(
  ...args: unknown[]
): void;
function doNothing() {};

const emptyArr = [] as const;
const emptyObj = {} as const;



//assuming all props are enumerable
function checkIsSameProps(
  obj0: Props,
  obj1: Props,
) {

  const propNames0 = Object.keys(obj0);

  if (
    propNames0.length
    !==
    Object.keys(obj1).length
  ) {

    return false;
  };

  for (
    const propName0 of propNames0
  ) {

    if (
      !(
        propName0 in obj1
        &&
        checkIsSame(
          obj0[propName0],
          obj1[propName0]
        )
      )
    ) {

      return false;
    };
  };

  return true;
};

function checkIsSameNonNanItms(
  itms0: ReadonlyArray<unknown>,
  itms1: ReadonlyArray<unknown>,
) {

  return _checkIsSameItms(
    itms0,
    itms1,
    checkIsStrictlyEqual
  );
};

function checkIsSameItms(
  itms0: ReadonlyArray<unknown>,
  itms1: ReadonlyArray<unknown>,
) {

  return _checkIsSameItms(
    itms0,
    itms1,
    checkIsSame
  );
};

function _checkIsSameItms(
  itms0: ReadonlyArray<unknown>,
  itms1: ReadonlyArray<unknown>,
  checkIsSame: (
    itm0: unknown,
    itm1: unknown,
  ) => boolean,
) {

  return (
    itms0.length === itms1.length
    &&
    !checkIsDiffItmsAtSomeIdx0(
      itms0,
      itms1,
      checkIsSame
    )
  );
};

function checkIsDiffItmsAtSomeIdx0(
  itms0: ReadonlyArray<unknown>,
  itms1: ReadonlyArray<unknown>,
  checkIsSame: (
    itm0: unknown,
    itm1: unknown,
  ) => boolean,
) {

  for (
    let idx0 = 0;
    idx0 < itms0.length;
    idx0++
  ) {

    if (
      !checkIsSame(
        itms0[idx0],
        itms1[idx0]
      )
    ) {

      return true;
    };
  };
};

//same value zero:
function checkIsSame(
  itm0: unknown,
  itm1: unknown,
) {

  return (
    itm0 === itm1
    ||
    (//if both NaN, return true:
      itm0 !== itm0
      &&
      itm1 !== itm1
    )
  );
};

function checkIsStrictlyEqual(
  itm0: unknown,
  itm1: unknown,
) {

  return itm0 === itm1;
};






//todo?: dynamic import only if [].flat() is not supported; if supported, then dynamic import of flat(itms) {return itms.flat(infinity)}
function flat<
  ItmsType extends ReadonlyArray<
    unknown
  >
>(
  itms: ItmsType
): Flat<ItmsType> {

  const newItms: Array<
    unknown
  > = [];

  for (
    const itm of itms
  ) {

    if (itm instanceof Array) {

      const flattened = flat(itm);

      for (
        const itm of flattened
      ) {
        newItms.push(itm);
      };
    } else {
      newItms.push(itm);
    };
  };

  return newItms as Flat<ItmsType>;
};



function kebabFromCamel(
  camelCaseText: string
) {

  const kebabCaseText = (
    camelCaseText.replace(
      capitalsRgx,
      kebabizeLetter
    )
  );

  return kebabCaseText;
};

const capitalsRgx = /[A-Z]/g;

function kebabizeLetter(
  letter: string,
) {

  return "-" + letter.toLowerCase();
};