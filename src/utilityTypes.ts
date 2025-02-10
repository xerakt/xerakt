export type {
  ChildOf,
  ParentOf,
  ParentWith,
  Flat,
  Flat1,
  NonFunctionProps,
  NonReadonlyProps,
  OnlyOneProp,
  Optional,
  CreateElem,
  ElemByTag,
  CharDataNameMap,
  CharDataCreatingMap,
};




type ChildOf<
  NodeType extends ParentNode,
> = NodeType["childNodes"][number];

type ParentOf<
  ChildType extends ChildNode
> = {
  childNodes: NodeListOf<
    ChildType
  >,
};

type ParentWith<
  ChildNodes extends ReadonlyArray<
    ChildNode
  >
> = {
  childNodes: {
    [
      IdxOrLength in (
        Extract<
          keyof ChildNodes,
          `${number}`
        >
        |
        "length"
      )
    ]: ChildNodes[IdxOrLength]
  },
};


//todo: fix; now it doesn't work properly
type Flat<
  Types extends ReadonlyArray<unknown>
> = (
  Types extends readonly [
    infer CurrentType,
    ...infer RestTypes
  ]
  ?
  [
    ...(
      CurrentType extends (
        //square brackets were here to avoid distributivity, so Results<> would look better, but for Classes it didn't work well
        ReadonlyArray<unknown>
      )
      ?
      Flat<CurrentType>
      :
      [CurrentType]
    ),
    ...Flat<RestTypes>
  ]
  :
  []
);

//todo: delete if is unused again
type Flat1<
  Types extends ReadonlyArray<unknown>
> = (
  Types extends readonly [
    infer CurrentType,
    ...infer RestTypes
  ]
  ?
  [
    ...(
      [CurrentType] extends [
        ReadonlyArray<unknown>
      ]
      ?
      CurrentType
      :
      [CurrentType]
    ),
    ...Flat<RestTypes>
  ]
  :
  []
);






type NonFunctionProps<
  ObjType extends {}
> = {
  [
    PropName in (
      keyof ObjType
    ) as (
      ObjType[
        PropName
      ] extends Function
      ?
      never
      :
      PropName
    )
  ]: ObjType[PropName]
};

type NonReadonlyProps<
  ObjType extends {}
> = {
  [
    PropName in (
      keyof ObjType
    ) as (
      IsEqual<
        {
          [
            PropNameType in PropName
          ]: ObjType[PropNameType]
        },
        {
          readonly [
            PropNameType in PropName
          ]: ObjType[PropNameType]
        }
      > extends true
      ?
      never
      :
      PropName
    )
  ]: ObjType[PropName]
};

// https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
type IsEqual<X, Y> = (
  (
    <T>() => T extends X ? 1 : 2
  ) extends (
    <T>() => T extends Y ? 1 : 2
  )
  ?
  true
  :
  false
);



type OnlyOneProp<
  PropNamesType extends (
    ReadonlyArray<
      string
      |
      number
    >
  ),
  PropValueType extends unknown
> = {
  [
    Idx in keyof PropNamesType
  ]: (
    {
      [
        PropName in Exclude<
          PropNamesType[number],
          PropNamesType[Idx]
        >
      ]?: never
    }
    &
    {
      [
        PropName in PropNamesType[Idx]
      ]: PropValueType
    }
  )
}[number];

type Optional<
  Type extends {}
> = {
  [
    PropName in keyof Type
  ]+?: Type[PropName]
};










//todo: move CreateElem, CharData___Map to separate compatibilityTypes.ts?



/*
because document.createElement in lib.dom.d.ts (using TypeScript 5.2.2) is declared with different <type parameters> in different overloads, this makes it impossible to be used in a normal way while inside another function (see usage in the comment below (after type declaration) for demonstration case, where original lib.dom.d.ts typization would not work)

so here is a more easy-to-use (but with same functionality) type for document.createElement:
*/

type CreateElem = <
  Tag extends string
>(
  tagName: Tag,
  options?: ElementCreationOptions,
) => ElemByTag<Tag>;

type ElemByTag<
  Tag extends string
> = (
  Tag extends keyof (
    HTMLElementFullTagNameMap
  )
  ?
  HTMLElementFullTagNameMap[Tag]
  :
  HTMLElement
);

type HTMLElementFullTagNameMap = (
  HTMLElementTagNameMap
  &
  HTMLElementDeprecatedTagNameMap
);

/*
//usage:

document.createElement as CreateElem

//e. g.:

const createElemAndLog = <
  Tag extends string
>(
  tag: Tag,
) => {
  console.log(
    `Created ${tag} elem`
  );
  return (
    document.createElement as CreateElem
  )<
    Tag
  >(
    tag
  );
};

//the type is HTMLDivElement:
const div = createElemAndLog(
  "div"
);

//HTMLFrameSetElement (deprecated):
const frameset = createElemAndLog(
  "frameset"
);

//HTMLElement (because of custom tag):
const myElem = createElemAndLog(
  "myelem"
);

//If you write createElemAndLog function without "as CreateElem" (so that document.createElement declaration from lib.dom.d.ts will be used), there will be error (hard or even impossible to get rid of), and if you remove the <Tag> type parameter on which that error is, there will be no error but all return values will be unspecified HTMLElement
*/










type CharDataNameMap = {
  [
    NodeName in (
      keyof CharDataDataMap
    )
  ]: CharDataDataMap[
    NodeName
  ][
    "type"
  ]
};

type CharDataCreatingMap = {
  [
    NodeName in (
      keyof CharDataDataMap
    )
  ]: Document[
    CharDataDataMap[
      NodeName
    ][
      "docPropCreateNode"
    ]
  ];
};


//todo?: replace with typeof someActualObject
//but where to put this object to avoid circular imports?
type CharDataDataMap = {
  "#cdata-section": {
    type: CDATASection,
    docPropCreateNode: (
      "createCDATASection"
    ),
    propAliases: [
      "#cdata-section",
      "cdataSection",
      "CdataSection",
      "cDATASection",
      "CDATASection",
    ],
  },
  "#comment": {
    type: Comment,
    docPropCreateNode: (
      "createComment"
    ),
    propAliases: [
      "#comment",
      "comment",
      "Comment",
    ],
  },
  "#text": {
    type: Text,
    docPropCreateNode: (
      "createTextNode"
    ),
    propAliases: [
      "#text",
      "text",
      "textNode",
      "Text",
      "TextNode",
    ],
  },
};