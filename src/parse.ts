export {
  parse,
};


import type {
  RawData,
  ParsedData,
  Token,
  ElemNodeTag,
  Descriptor,
  ElemDescriptor,
  TextToken,
  EmptyToken,
  Render,
  RenderFn,
  Renderer,
  Tokens,
  LocalUpdationData,
  PrimitiveToken,
  TaggedDescriptor,
  RendererConstructor,
  CreateEnsurer,
  Tag,
  Distinctors,
  CreationData,
  InstanceOfRender,
  Props,
} from "./types.ts";

import {
  emptyArr,
  emptyObj,
} from "./utils.ts";

import {
  createPrimitiveEnsurer,
} from "./ensurers/primitiveEnsurer.ts";

import {
  createMultiEnsurer,
  //@bundle-ignore-line //irrelevant if bunlded into a single file:
  setParse as setParse0,
} from "./ensurers/multiEnsurer.ts";

import {
  createCharDataEnsurer,
} from "./ensurers/charDataEnsurer.ts";

import {
  createRenderEnsurer,
  type HooksObj,

  //@bundle-ignore-line //irrelevant if bunlded into a single file:
  setParse as setParse1,
} from "./ensurers/renderEnsurer.ts";

import {
  createElemEnsurer,
} from "./ensurers/elemEnsurer.ts";


//@bundle-ignore-start //irrelevant if bunlded into a single file:
//for avoiding circular imports:
setParse0(parse as any);
setParse1(parse as any);
//@bundle-ignore-end



//todo: w/o any
function parse<
  TokenType extends Token,
>(
  rawData: RawData<TokenType>,
): ParsedData<TokenType> {

  const token = rawData.token;

  //todo?: optimize multiple typeof calls?
  if (
    checkIsTextToken(token)
  ) {

    return createPrimitiveParsedData(
      String(token)
    ) as any;
  };

  if (
    checkIsEmptyToken(token)
  ) {

    return emptyTokenParsedData as any;
  };

  if (
    checkIsFunction(token)
  ) {

    return createRenderNotRendererData(
      token,
      [
        null,
        token,
      ],
      undefined,
      keyForUnkeyed,
    );
  };

  if (
    checkIsObject(token)
  ) {

    if (
      checkIsNodeToken(token)
    ) {

      return createPrimitiveParsedData(
        token
      ) as any;
    };

    if (
      checkIsTokens(token)
    ) {

      return createNonGenericParsedData(
        {tokens: token} as any,
        createMultiEnsurer as any
      ) as any;
    };

    if (
      checkIsTaggedDescriptor(token)
    ) {

      const tag = token["tag"];
      const key = getKey(token);
      const distinctors = [tag];

      if (
        checkIsString(tag)
      ) {

        const createCharData = (
          getCreateCharData(tag)
        );

        if (
          createCharData
        ) {

          return {
            distinctors,
            createEnsurer: (
              createCharDataEnsurer
            ),
            localUpdationData: String(
              (//todo: better typization
                token as {
                  data?: unknown,
                }
              )["data"] as any
            ),
            key,
            creationData: (
              createCharData
            ),
          } as any;
        } else {

          return {
            distinctors,
            createEnsurer: (
              createElemEnsurer
            ),
            localUpdationData: {
              ownUpdationData: (
                token
              ),
              childParsedData: parse(
                {
                  token: getChild(
                    token as (
                      ElemDescriptor
                    )
                  )
                }
              ),
            },
            key,
            creationData: {
              tag,
            },
          } as any;
        };
      };

      if (
        checkIsFunction(tag)
      ) {

        return (
          createRenderNotRendererData(
            tag,
            distinctors,
            getProps(token),
            key,
          )
        );
      };

      if (
        tag
        &&
        checkIsObject(tag)
      ) {

        if (
          checkIsRenderer(tag)
          &&
          !checkIsTaggedDescriptor(tag)
        ) {

          return createRendererData(
            tag,
            distinctors,
            getProps(token),
            key,
          );
        };

        throw new TypeError(
          "Illegal token: object with illegal tag property: object without render property or object with tag property"
        );
      };

      throw new TypeError(
        "Illegal token: object with illegal non-object tag property: "
        +
        tag
      );
    } else {//if !(tag in object token):

      if (
        checkIsRenderer(token)
      ) {

        return createRendererData(
          token,
          [
            null,
            token
          ],
          undefined,
          keyForUnkeyed
        );
      };

      throw new TypeError(
        "Illegal token: object without tag or render property"
      );
    };
  };

  throw new TypeError(
    "Illegal non-object token: "
    +
    token
  );
};


function getKey<
  TokenType extends Token & object,
>(
  token: TokenType,
) {

  if (keyPropName in token) {

    const key = token[keyPropName]

    if (key !== key) {

      throw new TypeError(
        "Illegal token: \"key\" property is NaN"
      );

    };

    return key;

  } else {

    return keyForUnkeyed;
  };
};

const keyForUnkeyed = emptyObj;


function getProps<
  TokenType extends (
    Token
    &
    TaggedDescriptor<Tag>
  ),
>(
  token: TokenType,
): Props {

  const props: {
    [propName: string]: unknown;
  } = {};

  for (const propName in token) {

    if (
      !~reservedTokenPropNames.indexOf(
        propName
      )
    ) {

      props[propName] = token[propName];
    };
  };

  const tokenProps = token["props"];

  if (tokenProps) {

    for (const propName in tokenProps) {

      props[propName] = (
        tokenProps[propName]
      );
    };
  };

  return props;
};

const reservedTokenPropNames = [
  "tag",
  "props",
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
];


function createPrimitiveParsedData<
  TokenType extends PrimitiveToken,
>(
  localUpdationData: LocalUpdationData<
    TokenType
  >,
): ParsedData<TokenType> {

  return createNonGenericParsedData<
    any
  >(
    localUpdationData,
    createPrimitiveEnsurer as any,
  ) as any;
};

function createNonGenericParsedData<
  TokenType extends (
    PrimitiveToken
    |
    Tokens
  ),
>(
  localUpdationData: LocalUpdationData<
    TokenType
  >,
  createEnsurer: CreateEnsurer<
    TokenType
  >,
): ParsedData<TokenType> {

  //@ts-ignore //Type instantiation is excessively deep and possibly infinite.
  return createNonDescriptorParsedData<
    any
  >(
    //@ts-ignore //Type instantiation is excessively deep and possibly infinite.
    localUpdationData,
    createEnsurer,
    null,
    emptyArr
  ) as any;
};

function createNonDescriptorParsedData<
  TokenType extends Exclude<
    Token,
    TaggedDescriptor<Tag>
  >,
>(
  localUpdationData: LocalUpdationData<
    TokenType
  >,
  createEnsurer: CreateEnsurer<
    TokenType
  >,
  creationData: CreationData<TokenType>,
  distinctors: Distinctors,
): ParsedData<TokenType> {

  return {
    distinctors,
    createEnsurer,
    localUpdationData,
    key: keyForUnkeyed,
    creationData,
  } as any;
};

const emptyTokenParsedData = (
  createPrimitiveParsedData(
    false
  )
);




function createRenderNotRendererData<
  TokenType extends Render,
>(
  render: (
    RenderFn
    |
    RendererConstructor
  ),
  distinctors: Distinctors,
  localUpdationData: LocalUpdationData<
    TokenType
  >,
  key: unknown,

) {

  if (
    checkIsRendererConstructor(render)
  ) {

    return {
      distinctors,
      createEnsurer: (
        createRenderEnsurer
      ),
      localUpdationData,
      key,
      creationData: {
        render,
        createInstanceOfRender: (
          createInstanceOfRender
        ),
        callRender: (
          callRenderer
        ),
      },
    } as any;
  } else {

    return {
      distinctors,
      createEnsurer: (
        createRenderEnsurer
      ),
      localUpdationData,
      key: keyForUnkeyed,
      creationData: {
        render,
        createInstanceOfRender: (
          getInstanceOfRender
        ),
        callRender: (
          callRenderFn
        ),
      },
    } as any;
  };
};


function createRendererData<
  TokenType extends Render,
>(
  renderer: Renderer,
  distinctors: Distinctors,
  localUpdationData: LocalUpdationData<
    TokenType
  >,
  key: unknown,
) {

  return {
    distinctors,
    createEnsurer: (
      createRenderEnsurer
    ),
    localUpdationData,
    key,
    creationData: {
      render: renderer,
      createInstanceOfRender: (
        getInstanceOfRender
      ),
      callRender: (
        callRenderer
      ),
    },
  } as any;
};







function checkIsTextToken(
  token: Token,
) {

  return (
    typeof token === "string"
    ||
    typeof token === "number"
    ||
    typeof token === "bigint"
  );
};

function checkIsEmptyToken(
  token: Exclude<
    Token,
    TextToken
  >,
) {

  return !token;
};

function checkIsNodeToken(
  token: Exclude<
    Token,
    (
      TextToken
      |
      EmptyToken
    )
  >,
) {

  return (
    token instanceof Node
      //todo: check if will be cross-realm problems with iframes etc.
  );
};

function checkIsTokens(
  token: Exclude<
    Token,
    (
      TextToken
      |
      EmptyToken
      |
      Node
    )
  >,
) {

  return (
    token instanceof Array
      //todo: check if will be cross-realm problems with iframes etc.
  );
};

function checkIsTaggedDescriptor(
  token: Exclude<
    Token,
    (
      TextToken
      |
      EmptyToken
      |
      Node
      |
      Tokens
    )
  >,
) {

  return "tag" in token;
};

function checkIsRenderer(
  render: Render,
) {

  return "render" in render;
};

function checkIsRendererConstructor(
  render: (
    RendererConstructor
    |
    RenderFn
  ),//todo?: change types for implicit return type?
): render is RendererConstructor {

  return (
    render["prototype"]
    &&
    "render" in render["prototype"]
  );
};


function checkIsObject(
  value: NonNullable<unknown>,
) {

  return (
    typeof value === "object"
  );
};

function checkIsFunction(
  value: NonNullable<unknown>,
) {

  return (
    typeof value === "function"
  );
};

function checkIsString(
  value: unknown,
) {

  return (
    typeof value === "string"
  );
};




function getCreateCharData(
  tag: string,
) {

  switch (
    tag
  ) {

    case "#cdata-section": {
      return createCDATASection;
    };
    case "#comment": {
      return createComment;
    };
    case "#text": {
      return createTextNode;
    };
  };
};

function getChild(
  token: ElemDescriptor,
) {

  for (
    const propName
    of
    childPropNames
  ) {

    if (propName in token) {

      return token[propName];
    };
  };
};


//todo?: move to something like "tokenPropNames.ts"
const keyPropName = "key";

//todo?: move to something like "tokenPropNames.ts"
const childPropNames = [
  "child",
  "children",
] as const;

function createTextNode(
  data: string,
) {

  return document["createTextNode"](
    data
  );
};
function createComment(
  data: string,
) {

  return document["createComment"](
    data
  );
};
function createCDATASection(
  data: string,
) {

  return document["createCDATASection"](
    data
  );
};





function getInstanceOfRender<
  InstanceType extends InstanceOfRender,
>(
  instanceOfRender: InstanceType,
) {

  return instanceOfRender
};

function createInstanceOfRender<
  ConstructorType extends (
    RendererConstructor
  ),
>(
  Constructor: ConstructorType,
  props: Props,
) {

  return new Constructor(props);
};

function callRenderFn(
  renderFn: RenderFn,
  props: Props,
  hooksObj: HooksObj<Props>,
) {

  return renderFn.call(
    undefined,
    //@ts-ignore ts bug?: The type 'readonly unknown[]' is 'readonly' and cannot be assigned to the mutable type '[]'
    props,
    hooksObj
  );
};

function callRenderer(
  renderer: Renderer,
  props: Props,
  hooksObj: HooksObj<Props>,
) {

  return renderer["render"].call(
    renderer,
    //@ts-ignore ts bug?: The type 'readonly unknown[]' is 'readonly' and cannot be assigned to the mutable type '[]'
    props,
    hooksObj
  );
};
