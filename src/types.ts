export type {
  Token,
  PrimitiveToken,
  EmptyToken,
  TextToken,
  Tokens,
  Render,
  RenderFn,
  Renderer,
  RendererConstructor,
  InstanceOfRender,
  Descriptor,
  TaggedDescriptor,
  Tag,
  ElemNodeTag,
  CharDataTag,
  ElemDescriptor,
  Ensurer,
  Demander,
  Distinctors,
  RawData,
  ParsedData,
  CreateEnsurer,
  CreationData,
  ElemCreationData,
  LocalUpdationData,
  MultiLocalUpdationData,
  Proclaimer,
  Result,
  Results,
  PrimitiveResult,
  Parse,
  Props,
};

//todo?: remove circular import? or it is ok for types?
import type {
  HooksObj,
} from "./ensurers/renderEnsurer.ts";

import type {
  CharDataNameMap,
  ElemByTag,
  OnlyOneProp,
  Optional,
} from "./utilityTypes.ts";




type Token = (
  PrimitiveToken
  |
  Tokens
  |
  Render
  |
  Descriptor<Tag>
);

type PrimitiveToken = (
  TextToken
  |
  EmptyToken
  |
  //uncontrolled Node is treated like primitive:
  Node
);

type EmptyToken = (
  false
  |
  null
  |
  undefined
);

//no true token:
//bool && {tag} //OK, the type is (false | Descriptor), extends Token
//bool //not OK, the type is boolean, you probably forgot to write "&& something"

type TextToken = (
  string
  |
  number
  |
  bigint
);

type Tokens = ReadonlyArray<Token>;


type Descriptor<
  TagType extends (Tag | null)
> = (
  TagType extends null
  ?
  TaglessDescriptor
  :
  TaggedDescriptor<Tag>
);

type TaglessDescriptor = (
  {
    tag?: never,
  }
  &
  (
    OnlyOneProp<
      [
        "child",
        "children",
      ],
      Token
    >
    &
    OnlyOneProp<
      [
        "context",
        "cxt",
      ],
      unknown
    >
  )
);

type TaggedDescriptor<
  TagType extends Tag
> = {
  tag: TagType,
  props?: Props,
  child?: Token,
};

type Tag = (
  NodeTag
  |
  Render
);

type Render = (
  InstanceOfRender
  |
  RendererConstructor
);

type InstanceOfRender = (
  Renderer
  |
  RenderFn
);

//todo: make implicit types work
type RenderFn = <
  PropsType extends Props,
  StateType extends unknown,
>(
  props: PropsType,
  hooksObj: HooksObj,
) => Token;

type Renderer = {
  render: RenderFn,
};

type RendererConstructor = {

  new (props: Props): Renderer,
  prototype: Renderer,
};

type NodeTag = (
  ElemNodeTag
  |
  NonElemNodeTag
);

type ElemNodeTag = string;

type NonElemNodeTag = (
  CharDataTag
  |
  FragNodeTag
);

type FragNodeTag = "#document-fragment";

type CharDataTag = (
  keyof CharDataNameMap
);



type ElemDescriptor = (
  TaggedDescriptor<
    ElemNodeTag
  >
  &
  Optional<
    OnlyOneProp<
      readonly [
        "child",
        "children",
      ],
      Token
    >
  >
);

type CharDataDescriptor<
  DataType extends CharData,
> = (
  TaggedDescriptor<
    CharDataTag
  >
  &
  {
    data: DataType,
  }
);

type CharData = (
  TextToken
);






type Ensurer<
  TokenType extends Token
> = {
  ensure: (
    localUpdationData: (
      LocalUpdationData<
        TokenType
      >
    ),
  ) => void,
  cleanup: () => void,
};


type Demander<
  TokenType extends Token,
> = {

  readonly demand: (
    parsedData: ParsedData<TokenType>,
  ) => void,

  readonly cleanup: () => void,
};







type ParsedData<
  TokenType extends Token,
> = {
  readonly distinctors: Distinctors,
  readonly createEnsurer: (
    CreateEnsurer<
      TokenType
    >
  ),
  readonly creationData: CreationData<
    TokenType
  >,
  readonly localUpdationData: (
    LocalUpdationData<
      TokenType
    >
  ),
  readonly key: unknown,
};


type CreateEnsurer<
  TokenType extends Token,
> = (
  proclaimer: Proclaimer<
    Result<TokenType>
  >,
  creationData: CreationData<TokenType>,
) => Ensurer<TokenType>;

type Distinctors = ReadonlyArray<
  unknown
>;

type CreationData<
  TokenType extends Token
> = (
  TokenType extends TaggedDescriptor<
    CharDataTag
  >
  ?
  (
    data: string,
  ) => CharDataNameMap[
    TokenType["tag"]
  ]
  :
  TokenType extends ElemDescriptor
  ?
  ElemCreationData<TokenType>
  :
  TokenType extends Render
  ?
  {
    render: TokenType,
    createInstanceOfRender: (
      render: TokenType,
      props: Props,
    ) => InstanceOfRender,
    applyRender: (
      instanceOfRender: (
        InstanceOfRender
      ),
      args: ReadonlyArray<unknown>,
    ) => Token,
  }
  :
  null
);

type Props = {
  readonly [propName: string]: unknown,
};

type ElemCreationData<
  TokenType extends ElemDescriptor
> = {
  tag: TokenType["tag"],
};

type LocalUpdationData<
  TokenType extends Token
> = (
  TokenType extends PrimitiveToken
  ?
  PrimitiveResult<TokenType>
  :
  TokenType extends CharDataDescriptor<
    CharData
  >
  ?
  `${TokenType["data"]}`
  :
  TokenType extends Tokens
  ?
  MultiLocalUpdationData<TokenType>
  :
  TokenType extends ElemDescriptor
  ?
  {
    readonly ownUpdationData: {},
    readonly childParsedData: (
      ParsedData<
        ChildToken<TokenType>
      >
    ),
  }
  :
  {} | undefined
);

type MultiLocalUpdationData<
  TokensType extends Tokens,
> = {
  tokens: TokensType,
    //need other props? or it will be not local?
};

type ChildToken<ElemDescriptor> = (
  ElemDescriptor extends {
    child: Token,
  }
  ?
  ElemDescriptor["child"]
  :
  ElemDescriptor extends {
    children: Token,
  }
  ?
  ElemDescriptor["children"]
  :
  null
);




type RawData<
  TokenType extends Token
> = {
  token: TokenType,
};

//an object with a method that is used as callback when the final result is achieved (e. g. text node has been created) and there is nothing more to do (the call will only submit the result (if necessary) and return it w/o modification):
type Proclaimer<
  ResultType,// extends Result<Token>,
> = {

  proclaim: (
    this: Proclaimer<ResultType>,
    result: ResultType,
  ) => void,
};







//final result from initial or intermediate:
type Result<
  TokenType extends Token
> = (
  TokenType extends Tokens
  ?
  Results<TokenType>
  :
  TokenType extends Render
  ?
  Result<
    ReturnOfRender<TokenType>
  >
  :
  TokenType extends TaggedDescriptor<
    Render
  >
  ?
  Result<
    ReturnOfRender<TokenType["tag"]>
  >
  :
  TokenType extends PrimitiveToken
  ?
  PrimitiveResult<TokenType>
  :
  TokenType extends TaggedDescriptor<
    CharDataTag
  >
  ?
  CharDataNameMap[TokenType["tag"]]
  :
  TokenType extends TaggedDescriptor<
    string
  >
  ?
  ElemByTag<TokenType["tag"]>
  :
  never
);

type PrimitiveResult<
  TokenType extends PrimitiveToken
> = (
  TokenType extends TextToken
  ?
  `${TokenType}`
    //not a Text node because afterwards needs to be easily merged with adjacent text
  :
  TokenType extends EmptyToken
  ?
  false
  :
  TokenType extends Node
  ?
  TokenType
  :
  never
);

type ReturnOfRender<
  RenderType extends Render
> = ReturnType<
  RenderType extends RendererConstructor
  ?
  RenderType["prototype"]["render"]
  :
  RenderType extends Renderer
  ?
  RenderType["render"]
  :
  RenderType
>;

type Results<
  TokensType extends Tokens,
> = {
  [
    Idx in keyof TokensType
  ]: Result<TokensType[Idx]>
};







type Parse = <
  TokenType extends Token,
>(
  rawData: RawData<TokenType>,
) => ParsedData<TokenType>;