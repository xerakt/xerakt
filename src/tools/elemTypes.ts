export type {
  EmptyValue,
  Style,
  StyleData,
  StyleDescriptor,
  StyleDescriptorPropValue,
  StylePropValue,
  Class_s,
  Handler_sByEventType,
  HandlerWithEventType_s,
  HandlersWithEventType_s,
  Handler_sWithEventType_s,
  HandlerOrListener,
  HandlersOrListeners,
  Handler_sOrListener_s,
  HandlerDistinctor,
  Listener,
  Listeners,
  ListenerOptionsValue,
  ListenerOptionsValues,
  ObjWithListenerOptionsValue_s,
  IsCapture,
  EventType,
  EventTypes,
  EventType_s,
  AttrValuesByName,
  AttrValue,
  TextableAttrValue,
};


import type {
  OnlyOneProp,
  Optional,
} from "../utilityTypes.ts";

import {
  listener_sPropNames,
  eventType_sPropNames,
} from "./elemPropNames.ts";




type Style = (
  string
  |
  EmptyValue
  |
  StyleDescriptor
);

type StyleData = [
  stylePropValueTxt: string,
  importanceTxt: ImportanceTxt,
];

type StyleDescriptor = (
  CamelCaseStyleDescriptor
  &
  KebabCaseStyleDescriptor
  &
  {
    [
      customPropName: string
    ]: StyleDescriptorPropValue
  }
);
//todo?: prohibit same prop to appear twice - as camelCased and as kebab-cased


type KebabCaseStyleDescriptor = (
  KebabCaseKeys<
    CamelCaseStyleDescriptor
  >
);

//excluding non-string (e. g. methods, .length) properties from CSSStyleDeclaration:
type CamelCaseStyleDescriptor = {
  [
    PropName in (
      keyof CSSStyleDeclaration
    ) as (
      CSSStyleDeclaration[
        PropName
      ] extends string
      ?
      PropName
      :
      never
    )
  ]?: (
    CSSStyleDeclaration[
      PropName
    ]
    |
    {//todo: StyleDescriptorPropValueObj, but there are type issues
      value?: (
        CSSStyleDeclaration[
          PropName
        ]
        |
        StyleDescriptorPropValue
      ),
      important?: boolean,
    }
    |
    StyleDescriptorPropValue
  )
};
//todo: exclude .cssText? or leave to the user an option to shoot in the own foot?



//https://stackoverflow.com/a/66140779
type KebabCaseKeys<
  ObjType
> = {
  [
    PropName in keyof ObjType as (
      PropName extends string
      ?
      KebabCase<PropName>
      :
      PropName
    )
  ]: ObjType[PropName]
};

//https://stackoverflow.com/a/66140779
type KebabCase<
  StringType extends string,
  AccumType extends string = "",
> = (
  StringType extends `${
    infer First
  }${
    infer Rest
  }`
  ?
  KebabCase<
    Rest,
    `${
      AccumType
    }${
      First extends Lowercase<First>
      ?
      ""
      :
      "-"
    }${
      Lowercase<First>
    }`
  >
  :
  AccumType
);





type StyleDescriptorPropValue = (
  StylePropValue
  |
  StyleDescriptorPropValueObj
);

type StyleDescriptorPropValueObj = {
  value?: StylePropValue,
  important?: boolean | ImportanceTxt,
};

type StylePropValue = (
  string
  |
  number //converted to string
  |
  bigint //converted to string
  |
  EmptyValue //replaced with ""
);


//todo: extract to utilityTypes.ts and use it for EmptyToken
type EmptyValue = (

  //all are replaced with "":

  null
  |
  undefined
  |
  false

  //no true value:
  //{prop: bool && str}//OK, the type is (false | string) - prop will be eiter string or will not exist at all
  //{prop: bool} //not OK, the type is boolean, you probably forgot to write "&& something" - because, if prop exists, it needs to have some meaningful value, not just "true"
);

type ImportanceTxt = (
  ""
  |
  "important"
);




type Class_s = (
  string
  |
  EmptyValue
  |
  ReadonlyArray<Class_s>
);










type HandlerDistinctor = readonly [
  listener: Listener,
  isCapture: IsCapture,
  eventType: EventType,
];




type Handler_sWithEventType_s = (
  HandlerWithEventType_s
  |
  HandlersWithEventType_s
);

type HandlersWithEventType_s = (
  ReadonlyArray<
    HandlerWithEventType_s
  >
);

type HandlerWithEventType_s = (
  Handler
  &
  OnlyOneProp<
    typeof eventType_sPropNames,
    EventType_s
  >
);

type EventType_s = (
  EventType
  |
  EventTypes
);

type EventTypes = ReadonlyArray<
  EventType
>;

type NewType = string;

type EventType = NewType;

type Handler_sByEventType = {
  [
    EventType: EventType
  ]: Handler_sOrListener_s,
};

type Handler_sOrListener_s = (
  HandlerOrListener
  |
  HandlersOrListeners
);

type HandlersOrListeners = (
  ReadonlyArray<
    HandlerOrListener
  >
);

type HandlerOrListener = (
  Handler
  |
  Listener
);

type Handler = (
  (
    ObjWithListener_s
    |
    EventListenerObject
  )
  &
  Optional<
    ObjWithListenerOptionsValue_s
  >
);





type ObjWithListener_s = OnlyOneProp<
  typeof listener_sPropNames,
  Listener_s
>;

type Listener_s = (
  Listener
  |
  Listeners
);

type Listeners = ReadonlyArray<
  Listener
>;

type Listener = (
  EventListenerOrEventListenerObject
);

type ObjWithListenerOptionsValue_s = {
  options: ListenerOptionsValue_s,
};

type ListenerOptionsValue_s = (
  ListenerOptionsValue
  |
  ListenerOptionsValues
);

type ListenerOptionsValues = (
  ReadonlyArray<
    ListenerOptionsValue
  >
);

type ListenerOptionsValue = (
  IsCapture
  |
  undefined
  |
  AddEventListenerOptions
);

type IsCapture = (
  boolean
);






type AttrValuesByName = {
  [attrName: string]: AttrValue
};

type AttrValue = (
  TextableAttrValue
  |
  TogglableAttrValue
);

//todo?: rename to TextabeValue?
type TextableAttrValue = (
  string
  |
  number
  |
  bigint
);

type TogglableAttrValue = (
  boolean
  |
  undefined
  |
  null
);