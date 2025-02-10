export {
  mutaters,
};


import type {
  NonFunctionProps,
  NonReadonlyProps,
  Optional,
} from "../utilityTypes.ts";

import {
  checkIsDiffItmsAtSomeIdx0,
  checkIsSame,
  checkIsStrictlyEqual,
  doNothing,
  emptyArr,
  emptyObj,
  flat,
  kebabFromCamel,
} from "../utils.ts";

import {
  eventType_sPropNames,
} from "./elemPropNames.ts";

import type {
  Style,
  StyleData,
  StyleDescriptor,
  StyleDescriptorPropValue,
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
  EmptyValue,
} from "./elemTypes.ts";




//todo: split big methods to external functions
const mutaters/* : ReadonlyArray<
  (
    {
      mutate: (
        elem: HTMLElement,
        oldPropValue: unknown,
        newPropValue: unknown,
      ) => void,
    }
    &
    (
      {
        propNames: ReadonlyArray<
          string
        >,
        checkPropName?: never,
      }
      |
      {
        propNames?: never,
        checkPropName: (
          propName: string
        ) => boolean,
      }
    )
  )
> */ = [
  {
    propNames: [
      "style",
      "styles",
      "css",
    ],
    mutate(
      elem: HTMLElement,
      newStyle: Style,
      oldStyle: typeof newStyle,
    ) {

      newStyle ||= "";
      oldStyle ||= "";

      const elemStyle = elem["style"];

      if (
        typeof newStyle === "object"
      ) {

        if (
          !(
            typeof oldStyle === "object"
          )
        ) {

          elemStyle["cssText"] = "";
          oldStyle = emptyObj;
        };

        for (
          //todo: extract similar logic with "on" prop, "props" prop, "attrs" prop and elem props
          const propName
          in
          oldStyle
        ) {

          if (
            !(
              propName
              in
              newStyle
            )
          ) {
            elemStyle["removeProperty"](
              kebabFromCamel(propName)
            );
          };
        };

        applyStyleChanges(
          elemStyle,
          newStyle,
          oldStyle,
        );
      } else {
        //if new is string

        if (
          oldStyle
          !==
          newStyle
        ) {

          elemStyle["cssText"] = (
            newStyle
          );
        };
      };
    },
  },
  {
    propNames: [
      "class",
      "classes",
      "classList",
      "className",
    ],
    mutate(
      elem: HTMLElement,
      newClass_s: Class_s,
      oldClass_s: (
        typeof newClass_s
      ),
    ) {

      const oldClassNames = (
        parseClass_s(
          oldClass_s
        )
      );
      const newClassNames = (
        parseClass_s(
          newClass_s
        )
      );

      for (
        const [
          maybeRelevantClassNames,
          irrelevantClassNames,
          mutating,
        ]
        of
        [
          [
            oldClassNames,
            newClassNames,
            removeClassName,
          ],
          [
            newClassNames,
            oldClassNames,
            addClassName,
          ],
        ] as const
      ) {
        applyClassListMutating(
          elem,
          maybeRelevantClassNames,
          irrelevantClassNames,
          mutating
        );
      };
    },
  },
  {
    propNames: [
      //all that have been handled in other place
      "tag",
      "key",
      "child",
      "children",
      "context",
      "contexts",
      "cxt",
      "cxts",
      "effect",
      "effects",
      "fx",
      "fxs",
      "efx",
      "efxs",
    ],
    mutate: doNothing,
  },
  {
    propNames: [
      "props",
    ],
    mutate<
      ElemType extends HTMLElement
    >(
      elem: ElemType,
      newProps: (
        EmptyValue
        |
        Optional<
          NonFunctionProps<
            NonReadonlyProps<
              ElemType
            >
          >
        >
      ),
      oldProps: (
        typeof newProps
      ),
    ) {

      newProps ||= emptyObj;
      oldProps ||= emptyObj;

      //todo: extract similar logic with "on" prop, "style" prop, "attrs" prop and elem props

      for (const propName in newProps) {

      //if old === {prop0: 0, prop1: "some value"} and new === {} - do nothing, because different props can require different null-values for resetting to default. It is user responsibility to provide such values in newProps

        const newValue = (
          newProps[
            propName
          ] as ElemType[typeof propName]
          //i haven't found a way to make it work w/o "as"; for some reason it is not obvious to ts even with exactOptionalPropertyTypes: true
        );

        if (
          !(//not (persistent and unchanged)
            propName in oldProps
            &&
            checkIsSame(
              oldProps[propName],
              newValue
            )
          )
        ) {
          elem[
            propName
          ] = newValue;
        };
      };
    },
  },
  {
    propNames: [
      "attributes",
      "attribute",
      "attrs",
      "attr",
    ],
    mutate(//todo?: namespaces?
      //todo?: attr nodes?
      elem: HTMLElement,
      newAttrValuesByAttrName: (
        AttrValuesByName
        |
        EmptyValue
      ),
      oldAttrValuesByAttrName: (
        typeof newAttrValuesByAttrName
      ),
    ) {

      newAttrValuesByAttrName ||= (
        emptyObj
      );
      oldAttrValuesByAttrName ||= (
        emptyObj
      );

      for (
        //todo: extract similar logic with "on" prop, "style" prop, "props" prop and elem props
        const attrName
        in
        oldAttrValuesByAttrName
      ) {

        const oldValue = (
          oldAttrValuesByAttrName[
            attrName
          ]
        );

        const isObsolete = !(
          attrName
          in
          newAttrValuesByAttrName
        );

        /* 
        //moved to if () for lazy evaluation:
        const isAlreadyToggledOff = (
          !oldValue//is falsy
          &&//AND
          !checkIsTextAttrValue(
            oldValue
          )//isn't textable ("" | 0 | 0n)
        );
        */

        if (
          isObsolete
          &&//AND
          //!isAlreadyToggledOff
          !(//NOT already off:

            //is already toggled off if:
            !oldValue//is falsy
            &&//AND
            !checkIsTextableAttrValue(
              oldValue
            )//isn't textable ("" | 0 | 0n)
          )
        ) {

          elem["removeAttribute"](
            attrName
          );
        };
      };

      for (
        const attrName
        in
        newAttrValuesByAttrName
      ) {

        const newValue = (
          newAttrValuesByAttrName[
            attrName
          ]
        );
        const oldValue = (
          oldAttrValuesByAttrName[
            attrName
          ]
        );

        if (
          checkIsTextableAttrValue(
            newValue
          )
        ) {

          const newText = String(
            newValue
          );

          if (//if not (both are textable and are the same text)
            !(
              checkIsTextableAttrValue(
                oldValue
              )
              &&
              (
                newText
                ===
                String(oldValue)
              )
            )
          ) {

            elem["setAttribute"](
              attrName,
              newText
            );
          };
        } else {//if newValue is togglable

          const newIsToggledOn = (
            !!newValue
          );

          if (//if not (both are togglabe and are toggled the same)
            !(
              !checkIsTextableAttrValue(
                oldValue
              )
              &&
              (
                newIsToggledOn
                ===
                !!oldValue
              )
            )
          ) {

            if (newIsToggledOn) {

              elem["setAttribute"](
                attrName,
                ""
              );
            } else {

              //in all cases need to remove an attribute:
              //if old is togglable, it is !==new, so old is toggled on, so we need to remove an attribute
              //if old is textable, we still need to remove an attribute

              elem["removeAttribute"](
                attrName
              );
            };
          };
        };
      };
    },
  },
  {
    propNames: [
      "handlers",
      "handler",
      "listeners",
      "listener",
    ],
    emptyValue: emptyArr,
    mutate(
      elem: HTMLElement,
      newHandler_s: (
        Handler_sWithEventType_s
      ) = emptyArr,
      oldHandler_s: (
        typeof newHandler_s
      ) = emptyArr,
    ) {

      //todo: EmptyValue to skip handler

      applyHandlersMutatings<
        null
      >(
        elem,
        null,
        newHandler_s,
        oldHandler_s
      );
    },
  },
  {
    propNames: [
      "on",
    ],
    emptyValue: emptyObj,
    mutate(
      elem: HTMLElement,
      newHandler_sByEventType: (
        Handler_sByEventType
      ) = emptyObj,
      oldHandler_sByEventType: (
        typeof newHandler_sByEventType
      ) = emptyObj,
    ) {

      //todo: EmptyValue to skip handler

      for (
        //todo: extract similar logic with "style" prop, "props" prop, "attrs" prop and elem props
        const eventType
        in
        oldHandler_sByEventType
      ) {

        if (
          !(
            eventType
            in
            newHandler_sByEventType
          )
        ) {

          const oldHandler_s = (
            oldHandler_sByEventType[
              eventType
            ]
          );

          const oldHandlers = (
            flat([oldHandler_s]) as (
              HandlersOrListeners
            )//todo w/o as
          );

          applyHandlersMutating(
            elem,
            {
              maybeRelevantHandlers: (
                oldHandlers
              ),
              irrelevantHandlers: (
                emptyArr
              ),
              mutating: removeListener,
            },
            null,
            eventType,
          );
        };
      };

      for (
        const eventType
        in
        newHandler_sByEventType
      ) {

        const oldHandler_s = (
          oldHandler_sByEventType[
            eventType
          ]
          ||
          emptyArr
        );

        const newHandler_s = (
          newHandler_sByEventType[
            eventType
          ]
        );

        applyHandlersMutatings<
          EventType
        >(
          elem,
          eventType,
          newHandler_s,
          oldHandler_s
        );
      };
    },
  },
  {
    checkProp(
      propName: string,
    ) {
      //true for "onClick" &c., but not "onclick" &c.,
      //also true for "on_DOMContentLoaded", "on_CUSTOM_CAPS-EVENT", "on-DOMContentLoaded", "on-CUSTOM_CAPS-EVENT" &c.:
      return checkIsPrefixedPropName(
        propName,
        "on"
      );
    },
    emptyValue: emptyArr,
    mutate(
      elem: HTMLElement,
      newHandler_s: (
        Handler_sOrListener_s
      ) = emptyArr,
      oldHandler_s: (
        typeof newHandler_s
      ) = emptyArr,
      propName: string,
    ) {

      //todo: EmptyValue to skip handler

      const eventType = (
        getUnprefixedPropName(
          propName,
          2 //"on".length
        )
      );

      applyHandlersMutatings<
        EventType
      >(
        elem,
        eventType,
        newHandler_s,
        oldHandler_s
      );
    },
  },
  {
    propNames: [
      "dataset",
      //"data",
    ],
    emptyValue: emptyObj,
    mutate(
      elem: HTMLElement,
      newDataset: {
        [
          propName: string
        ]: unknown,
      } = emptyObj,
      oldDataset: (
        typeof newDataset
      ) = emptyObj,
    ) {

      //todo: EmptyValue for skipping? For skipping the entire object, not props?

      for (
        //todo: extract similar logic with "style" prop, "props" prop, "attrs" prop and elem props
        const dataPropName
        in
        oldDataset
      ) {

        if (
          !(
            dataPropName
            in
            newDataset
          )
        ) {

          delete elem["dataset"][
            dataPropName
          ];
        };
      };

      for (
        const dataPropName
        in
        newDataset
      ) {

        const newPropTxt = String(
          newDataset[dataPropName]
        );

        if (
          !(
            dataPropName in oldDataset
            &&
            (
              newPropTxt
              ===
              String(
                oldDataset[
                  dataPropName
                ]
              )
            )
          )
        ) {

          elem["dataset"][
            dataPropName
          ] = newPropTxt;
        };
      };
    },
  },
  {
    checkProp(
      propName: string,
    ) {
      //true for "dataCount" &c., but not "datacount" &c.,
      //also true for "data_DOMRootId", "data_ALL_CAPS_PROP", "data-DOMRootId", "data-ALL_CAPS_PROP" &c.:
      return checkIsPrefixedPropName(
        propName,
        "data"
      );
    },
    emptyValue: emptyObj,
    mutate(
      elem: HTMLElement,
      newValue: unknown,
      oldValue: unknown,
      propName: string,
    ) {

      const dataPropName = (
        getUnprefixedPropName(
          propName,
          4 //"data".length
        )
      );

      if (
        newValue === emptyObj
      ) {

        //in such case oldValue always exists (because mutater.mutate() is called with newValue === mutater.emptyValue only when iterating over props in oldElemStateData and removing the unneeded ones), so need to remove it:

        delete elem["dataset"][
          dataPropName
        ];
      } else {

        //todo: extract common logic with "dataset"

        const newPropTxt = String(
          newValue
        );

        if (
          newPropTxt
          !==
          String(oldValue)
        ) {

          elem["dataset"][
            dataPropName
          ] = newPropTxt;
        };
      };
    },
  },
] as ReadonlyArray<
  {
    mutate: (
      elem: HTMLElement,
      newValue: any,//todo?
      oldValue: any,//todo?
      propName: string,
    ) => void,
    emptyValue?: unknown,
  }
  &
  (
    {
      propNames: ReadonlyArray<
        string
      >,
      checkProp?: never,
    }
    |
    {
      propNames?: never,
      checkProp: (
        propName: string,
      ) => boolean,
    }
  )
>;//todo w/o as




function applyStyleChanges(
  elemStyle: CSSStyleDeclaration,
  newStyleDescriptor: StyleDescriptor,
  oldStyleDescriptor: StyleDescriptor,
) {

  for (
    const propName
    in
    newStyleDescriptor
  ) {

    const [
      newStylePropValue,
      newIsImportant,
    ] = getStyleData(
      newStyleDescriptor[propName]
    );
    const [
      oldStylePropValue,
      oldIsImportant,
    ] = getStyleData(
      oldStyleDescriptor[propName]
    );

    if (
      (
        newStylePropValue
        !==
        oldStylePropValue
      )
      ||
      (
        newIsImportant
        !==
        oldIsImportant
      )
    ) {

      elemStyle["setProperty"](
        kebabFromCamel(propName),
        newStylePropValue,
        newIsImportant
      );
    };
  };
};

function getStyleData(
  stylePropValue: (
    StyleDescriptorPropValue
  ),
): StyleData {

  stylePropValue = (
    checkIsEmptyStylePropValue(
      stylePropValue
    )
    ?
    ""
    :
    stylePropValue
  );

  return (
    (
      typeof stylePropValue
      ===
      "object"
    )
    ?
    [
      String(
        checkIsEmptyStylePropValue(
          stylePropValue["value"]
        )
        ?
        ""
        :
        stylePropValue["value"]
      ),
      getImportanceTxt(
        stylePropValue["important"]
      ),
    ]
    :
    (
      typeof stylePropValue
      ===
      "string"
    )
    ?
    [
      stylePropValue.replace(
        / ?!important$/,
        ""
      ),
      getImportanceTxt(
        stylePropValue.slice(
          -10
        )
        ===
        "!important"
      ),
    ]
    :
    [
      String(stylePropValue),
      "",
    ]
  );
};

function checkIsEmptyStylePropValue(
  stylePropValue: (
    StyleDescriptorPropValue
  ),
) {

  return (
    stylePropValue
    == //non-strict comparison: is null or undefined
    null
  )
  ||
  (
    stylePropValue
    ===
    false
  );
};

function getImportanceTxt(
  isImportant: unknown,
) {

  return (
    isImportant
    ?
    "important"
    :
    ""
  );
};





//todo: textable classes
function parseClass_s(
  class_s: Class_s,
) {
  return flat(
    (
      flat([class_s]) as (//todo
        ReadonlyArray<
          string
          |
          EmptyValue
        >
      )
    ).map(
      splitClassText
    )
  ) as ReadonlyArray<
    string
  >;
};

function splitClassText(
  classText: (
    string
    |
    EmptyValue
  ),
    //can be "class1 class2 class3"
) {

  return (
    classText
    ||
    ""
  ).split(" ");
};

function removeClassName(
  elem: HTMLElement,
  className: string,
) {
  elem["classList"]["remove"](
    className
  );
};
//todo: make a single function for both actions?
function addClassName(
  elem: HTMLElement,
  className: string,
) {
  elem["classList"]["add"](
    className
  );
};

function applyClassListMutating(
  elem: HTMLElement,
  maybeRelevantClassNames: (
    ReadonlyArray<string>
  ),
  irrelevantClassNames: (
    ReadonlyArray<string>
  ),
  mutating: (//add or remove className
    elem: HTMLElement,
    className: string
  ) => void,
) {

  for (
    const maybeRelevantClassName
    of
    maybeRelevantClassNames
  ) {

    if (
      //if not an empty string:
      maybeRelevantClassName
      &&
      //if not irrelevant:
      !~irrelevantClassNames.indexOf(
        maybeRelevantClassName
      )
    ) {

      const relevantClassName = (
        maybeRelevantClassName
      );

      mutating(
        elem,
        relevantClassName
      )
    };
  };
};




function addListener(
  elem: HTMLElement,
  eventType: EventType,
  listener: Listener,
  options: ListenerOptionsValue,
) {
  elem["addEventListener"](
    eventType,
    listener,
    options,
  );
};
//todo: make a single function for both actions?
function removeListener(
  elem: HTMLElement,
  eventType: EventType,
  listener: Listener,
  options: ListenerOptionsValue,
) {
  elem["removeEventListener"](
    eventType,
    listener,
    options,
  );
};


function applyHandlersMutatings<
  ConstantEventTypeType extends (
    EventType
    |
    null//no common event type; each should have own event type
  ),
>(
  elem: HTMLElement,
  constantEventType: (
    ConstantEventTypeType
  ),
  newHandler_s: (
    ConstantEventTypeType extends (
      EventType
    )
    ?
    Handler_sOrListener_s
    :
    Handler_sWithEventType_s
  ),
  oldHandler_s: typeof newHandler_s,
) {

  const newHandlers = flat(
    [newHandler_s]
  ) as unknown as (
    ConstantEventTypeType extends (
      EventType
    )
    ?
    HandlersOrListeners
    :
    HandlersWithEventType_s
  )//todo w/o as;
  const oldHandlers = flat(
    [oldHandler_s]
  ) as unknown as (
    typeof newHandlers
  )//todo w/o as;

  [
    {
      maybeRelevantHandlers: (
        oldHandlers
      ),
      irrelevantHandlers: (
        newHandlers
      ),
      mutating: removeListener,
    },
    {
      maybeRelevantHandlers: (
        newHandlers
      ),
      irrelevantHandlers: (
        oldHandlers
      ),
      mutating: addListener,
    },
  ].reduce(
    reduceHandlersMutating<
      ConstantEventTypeType
    >,
    {
      cachedIrrelevantDistinctors: (
        null
      ),
      elem,
      constantEventType,
    }
  );
};


function reduceHandlersMutating<
  ConstantEventTypeType extends (
    EventType
    |
    null
  )
>(
  {
    cachedIrrelevantDistinctors,
    elem,
    constantEventType,
  }: {
    cachedIrrelevantDistinctors: (
      null
      |
      ReadonlyArray<
        HandlerDistinctor
      >
    ),
    elem: HTMLElement,
    constantEventType: (
      ConstantEventTypeType
    ),
  },
  itm: {
    maybeRelevantHandlers: (
      ConstantEventTypeType extends (
        EventType
      )
      ?
      HandlersOrListeners
      :
      HandlersWithEventType_s
    ),
    irrelevantHandlers: (
      ConstantEventTypeType extends (
        EventType
      )
      ?
      HandlersOrListeners
      :
      HandlersWithEventType_s
    ),
    mutating: (//add or remove listener
      elem: HTMLElement,
      eventType: EventType,
      listener: Listener,
      options: ListenerOptionsValue,
    ) => void,
  },
) {

  return {
    cachedIrrelevantDistinctors: (
      applyHandlersMutating<
        ConstantEventTypeType
      >(
        elem,
        itm,
        cachedIrrelevantDistinctors,
        constantEventType
      )
    ),
    elem,
    constantEventType,
  };
};



//todo: extract same logic with classNames
function applyHandlersMutating<
  ConstantEventTypeType extends (
    EventType
    |
    null
  )
>(
  elem: HTMLElement,

  //todo: arr destructuring instead of obj?
  {
    maybeRelevantHandlers,
    irrelevantHandlers,
    mutating,
  }: {
    maybeRelevantHandlers: (
      ConstantEventTypeType extends (
        EventType
      )
      ?
      HandlersOrListeners
      :
      HandlersWithEventType_s
    ),
    irrelevantHandlers: (
      typeof maybeRelevantHandlers
    ),
    mutating: (//add or remove listener
      elem: HTMLElement,
      eventType: EventType,
      listener: Listener,
      options: ListenerOptionsValue,
    ) => void,
  },
  oldIrrelevantDistinctors: (
    null
    |
    ReadonlyArray<
      HandlerDistinctor
    >
  ),
  constantEventType: (
    ConstantEventTypeType
  ),
) {

  const newIrrelevantDistinctors: (
    Array<
      HandlerDistinctor
    >
    |
    null
  ) = (
    oldIrrelevantDistinctors
    ?
    null
    :
    []
  );

  for (
    const maybeRelevantHandler
    of
    maybeRelevantHandlers
  ) {

    const [
      maybeRelevantListeners,
      maybeRelevantOptionsValues,
    ] = (
      getHandlerData(
        maybeRelevantHandler
      )
    );

    const maybeRelevantEventTypes = (
      constantEventType === null
      ?
      getEventTypes(
        maybeRelevantHandler as (
          HandlerWithEventType_s
        )
      )
      :
      [constantEventType]
    );//todo: w/o as

    for (
      const maybeRelevantEventType
      of
      maybeRelevantEventTypes
    ) {

      for (
        const maybeRelevantOptionsValue
        of
        maybeRelevantOptionsValues
      ) {

        const maybeRelevantIsCapture = (
          checkIsCapture(
            maybeRelevantOptionsValue
          )
        );

        for (//4 nested loops, nice
          const maybeRelevantListener
          of
          maybeRelevantListeners
        ) {

          applyHandlerMutatingOrCache<
            ConstantEventTypeType
          >(
            elem,
            mutating,
            irrelevantHandlers,
            maybeRelevantListener,
            maybeRelevantIsCapture,
            maybeRelevantEventType,
            maybeRelevantOptionsValue,
            oldIrrelevantDistinctors,
            newIrrelevantDistinctors,
            constantEventType,
          );
        };
      };
    };
  };

  return newIrrelevantDistinctors;
};

function applyHandlerMutatingOrCache<
  ConstantEventTypeType extends (
    EventType
    |
    null
  )
>(
  elem: HTMLElement,
  mutating: (//add or remove listener
    elem: HTMLElement,
    eventType: EventType,
    listener: Listener,
    options: ListenerOptionsValue,
  ) => void,
  irrelevantHandlers: (
    ConstantEventTypeType extends (
      EventType
    )
    ?
    HandlersOrListeners
    :
    HandlersWithEventType_s
  ),
  maybeRelevantListener: Listener,
  maybeRelevantIsCapture: IsCapture,
  maybeRelevantEventType: EventType,
  maybeRelevantOptionsValue: (
    ListenerOptionsValue
  ),
  oldIrrelevantDistinctors: (
    ReadonlyArray<
      HandlerDistinctor
    >
    |
    null
  ),
  newIrrelevantDistinctors: (
    Array<
      HandlerDistinctor
    >
    |
    null
  ),
  constantEventType: (
    ConstantEventTypeType
  ),
) {

  const maybeRelevantDistinctor = [
    maybeRelevantListener,
    maybeRelevantIsCapture,
    maybeRelevantEventType,
  ] as const;

  const isIrrelevant = (
    oldIrrelevantDistinctors
    ?
    checkIsInIrrelevantDistinctors(
      maybeRelevantDistinctor,
      oldIrrelevantDistinctors
    )
    :
    checkIsInIrrelevantHandlers<
      ConstantEventTypeType
    >(
      maybeRelevantDistinctor,
      irrelevantHandlers,
      constantEventType
    )
  );

  if (
    isIrrelevant
  ) {

    if (newIrrelevantDistinctors) {

      const irrelevantDistinctor = (
        maybeRelevantDistinctor
      );

      newIrrelevantDistinctors.push(
        irrelevantDistinctor
      );
    };
  } else {

    const [
      relevantEventType,
      relevantListener,
      relevantOptionsValue,
    ] = [
      maybeRelevantEventType,
      maybeRelevantListener,
      maybeRelevantOptionsValue,
    ];

    mutating(
      elem,
      relevantEventType,
      relevantListener,
      relevantOptionsValue
    );
  };
};

function checkIsInIrrelevantDistinctors(
  maybeRelevantDistinctor: (
    HandlerDistinctor
  ),
  irrelevantDistinctors: (
    ReadonlyArray<
      HandlerDistinctor
    >
  ),
) {

  for (
    const irrelevantDistinctor
    of
    irrelevantDistinctors
  ) {

    if (
      !checkIsDiffItmsAtSomeIdx0(
        irrelevantDistinctor,
        maybeRelevantDistinctor,
        checkIsStrictlyEqual
      )
    ) {

      return true;
    };
  };
};

function checkIsInIrrelevantHandlers<
  ConstantEventTypeType extends (
    EventType
    |
    null
  )
>(
  maybeRelevantDistinctor: (
    HandlerDistinctor
  ),
  irrelevantHandlers: (
    ConstantEventTypeType extends (
      EventType
    )
    ?
    HandlersOrListeners
    :
    HandlersWithEventType_s
  ),
  constantEventType: (
    ConstantEventTypeType
  ),
) {

  for (
    const irrelevantHandler
    of
    irrelevantHandlers
  ) {

    const [
      irrelevantListeners,
      irrelevantOptionsValues,
    ] = (
      getHandlerData(
        irrelevantHandler
      )
    );

    const irrelevantEventTypes = (
      constantEventType === null
      ?
      getEventTypes(
        irrelevantHandler as (
          HandlerWithEventType_s
        )
      )
      :
      [constantEventType]
    );//todo: w/o as

    if (
      checkIsHandlerDistinctorMatch(
        maybeRelevantDistinctor,
        irrelevantListeners,
        irrelevantOptionsValues,
        irrelevantEventTypes
      )
    ) {

      return true;
    };
  };
};

function checkIsHandlerDistinctorMatch(
  handlerDistinctor0: (
    HandlerDistinctor
  ),
  listeners1: Listeners,
  optionsValues1: ListenerOptionsValues,
  eventTypes1: EventTypes,
) {

  const [
    listener0,
    isCapture0,
    eventType0,
  ] = handlerDistinctor0;

  for (
    const eventType1
    of
    eventTypes1
  ) {

    if (
      (
        eventType0
        ===
        eventType1
      )
    ) {

      for (
        const listener1
        of
        listeners1
      ) {

        if (
          (
            listener0
            ===
            listener1
          )
        ) {

          for (
            const optionsValue1
            of
            optionsValues1
          ) {

            if (
              isCapture0
              ===
              checkIsCapture(
                optionsValue1
              )
            ) {

              return true;
            };
          };
        };
      };
    };
  };
};


function getHandlerData(
  handler: HandlerOrListener,
) {

  const listener_s = (
    getListener_s(handler)
  );

  const listeners = (
    flat([listener_s]) as (
      Listeners
    )//todo w/o as
  );

  const optionsValue_s = (
    (
      handler as (
        Optional<
          ObjWithListenerOptionsValue_s
        >
        //even if there is no .options prop - undefined is ok
        //todo?: remove exactOptionalPropertyTypes from tsconfig? or will it affect something else (like {propName?: never} types)?
      )
    )["options"]
  );

  const optionsValues = (
    flat([optionsValue_s]) as (
      ListenerOptionsValues
    )//todo w/o as
  );

  return [
    listeners,
    optionsValues,
  ] as const;
};

function getEventTypes(
  handler: HandlerWithEventType_s,
) {

  const eventType_s = (
    getEventType_s(handler)
  );

  const eventTypes = (
    flat([eventType_s]) as (
      EventTypes
    )//todo w/o as
  );

  return eventTypes;
};

function checkIsCapture(
  optionValue: ListenerOptionsValue,
) {

  return !!(
    (
      typeof optionValue
      ===
      "object"
    )
    ?
    optionValue["capture"]
    :
    optionValue
  );
};

function getListener_s(
  handler: HandlerOrListener,
) {
  return (
    (
      "listener" in handler
    )
    ?
    handler["listener"]
    :
    (
      "listeners" in handler
    )
    ?
    handler["listeners"]
    :
    handler
  )
};

function checkIsPrefixedPropName(
  propName: string,
  prefix: string,
) {

  const lengthOfPrefix = prefix.length;

  return (
    propName.slice(
      0,
      lengthOfPrefix
    ) === prefix
    &&
    checkCharAfterPrefix(
      propName,
      lengthOfPrefix
    )
  );
};

function checkCharAfterPrefix(
  propName: string,
  lengthOfPrefix: number,
) {

  const charAfterPrefix = propName[
    lengthOfPrefix
  ];

  return (
    checkIsPrefixSeparator(
      charAfterPrefix
    )
    ||
    (
      charAfterPrefix.toLowerCase()
      !==
      charAfterPrefix
    )
  )
};

function getUnprefixedPropName(
  propName: string,
  lengthOfPrefix: number,
) {

  const charAfterPrefix = propName[
    lengthOfPrefix
  ];

  return (
    checkIsPrefixSeparator(
      charAfterPrefix
    )
    ?
    ""
    :
    charAfterPrefix.toLowerCase()
  ) + propName.slice(
    lengthOfPrefix + 1
  );
};

function checkIsPrefixSeparator(
  charAfterPrefix: string,
) {

  return (
    charAfterPrefix === "_"
    ||
    charAfterPrefix === "-"
  );
};

function getEventType_s(
  handler: HandlerWithEventType_s,
): EventType_s {
  //todo: proper typization

  for (
    const propName
    of
    eventType_sPropNames
  ) {

    if (
      propName in handler
    ) {

      return handler[propName] as (
        EventType_s
      );
    };
  };

  //never occurs; only for satisfying ts
  return undefined as (
    unknown
  ) as (
    EventType_s
  );
};



function checkIsTextableAttrValue(
  attrValue: AttrValue,
) {

  return (
    typeof attrValue === "string"
    ||
    typeof attrValue === "number"
    ||
    typeof attrValue === "bigint"
  );
};