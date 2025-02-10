<article style="font-family: monospace">

# xerakt

DOM rendering library

![logo](https://github.com/xerakt/xerakt-branding/raw/main/xeraktLogo.svg)

<br>




## overview

xerakt is a library for creating and updating DOM in a declarative way;

it provides built-in [hooks](#hooks) for managing the state of your application and allows to create and use custom hooks;

xerakt doesn't require the use of any additional syntax other than JS, but if you want to use JSX with xerakt, you can quite easily configure your project for transpiling JSX into regular JS with external tools;

although the initial idea of xerakt arose independently of any existing JS frameworks, later, after searching for already existing implementations of similar ideas, it was heavily influenced by [React](react.dev), and many concepts (such as [hooks](#hooks), [keys](#keys) and [effects](#useeffect)) are taken from there, so if you already know [React](react.dev), many things will be familiar for you, although there are crucial differences;

nevertheless, xerakt is not a fork of [React](react.dev), and all the code was written from scratch and without mocking the code of [React](react.dev) even when the behavior was intended to be similar;

<br>




## installation

as a package dependency:

```bash
npm install xerakt
```

<br>

as a dev dependency:

```bash
npm install xerakt -D
```

<br>

for using as a ["classic script"](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type#attribute_is_not_set_default_an_empty_string_or_a_javascript_mime_type) (not a [module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)), with assigning all the exports to the global `window` object:

```bash
npm install @xerakt/nomodule
```

<br>




## usage

if you are using a bundler that resolves bare modules, you can import `xerakt` like this:

```js
import {xerakt} from "xerakt";
```

<br>

`xerakt` is a function that accepts[^0] a [token](#tokens) as the first argument and returns a [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) that contains DOM nodes that correspond to the token;

then you can append that document fragment to the root element of your app:

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">

      import {xerakt} from "https://unpkg.com/xerakt@0.0.0/esm.js";

      const root = document.getElementById("root");

      const myFirstToken = {
        tag: "h1",
        style: {
          backgroundColor: "#f7df1e",
        },
        child: "Hello, world!",
      };

      const docFragment = xerakt(myFirstToken);

      root.appendChild(docFragment);

    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

<br>




## tokens

tokens are values that are parsed at runtime by xerakt to get corresponding [result](#results) or to ensure that the existing result corresponds to the token;

tokens correspond to DOM nodes (or to an absence of DOM node, as in case of [empty token](#empty-token));

for example, this token corresponds to a `<section>` element with particular class and children:

```js
const mySectionToken = {
  tag: "section",
  class: "article-section",
  children: [
    {
      tag: "h2",
      style: {
        backgroundColor: "#f7df1e",
      },
      child: "heading text",
    },
    "section text",
  ],
};

//returns a document fragment with a <section> element:
xerakt(mySectionToken);
/*
<section class="article-section">
  <h2 style="background-color: rgb(247, 223, 30);">
    heading text
  </h2>
  section text
</section>
*/
```

<br>

one token can have different results over time: for example, you can create a [render token](#render-token) that changes its outcome every second to a new string with an up-to-date current time, or you can create one that changes according to user interaction - render tokens are the main way to make your xerakt-based app interactive and animated;

there are different types of tokens:

- [element descriptor token](#element-descriptor-token)
- [array token](#array-token)
- [textable token](#textable-token)
- [render token](#render-token)
- [character data descriptor token](#character-data-descriptor-token)
- [empty token](#empty-token)
- [foreign node token](#foreign-node-token)

<br>


### element descriptor token

element descriptor token is an object that has `tag` property with a value of type `string` and is not a [character data descriptor token](#character-data-descriptor-token);

for example:

```js
const elementDescriptorToken = {
  tag: "div",
};
```

<br>

element descriptor token corresponds to a DOM element created by calling `document.createElement(tag)`, where `tag` is the `tag` property of the element descriptor token;

> [!WARNING]  
> xerakt doesn't check that `tag` is a valid tag name for an element: for example, if you do something like `xerakt({tag: "$illegal#tag"})`, you will get `InvalidCharacterError: Failed to execute 'createElement' on 'Document': The tag name provided ('$illegal#tag') is not a valid name.`

<br>

element descriptor token can have child tokens[^1] (that represent the child nodes of the DOM element represented by that element descriptor token) as value of the `child` or `children` property;

any token can be used as the child token of an element descriptor token;

`child` and `children` property names are synonymous, you can choose either one:

```js
//these two element descriptor tokens are equivalent with each other:
const tokenWithSingleChild0 = {
  tag: "div",
  child: "some text",
};
const tokenWithSingleChild1 = {
  tag: "div",
  children: "some text",
};

//these two element descriptor tokens are also equivalent with each other:
const tokenWithMultipleChildren0 = {
  tag: "div",
  child: [
    "some text",
    {tag: "hr"},
    "another text",
  ],
};
const tokenWithMultipleChildren1 = {
  tag: "div",
  children: [
    "some text",
    {tag: "hr"},
    "another text",
  ],
};
```

> [!WARNING]  
> if you use both `child` and `children` properties simultaneously on the same element descriptor token, only the `child` property will be parsed, the `children` property will be ignored

<br>

element descriptor token can have other properties:

```js
const someElementDescriptorToken = {
  tag: "button",
  class: "editable-button",
  style: {
    fontStyle: "italic",
  },
  contentEditable: true,
  child: "initial text",
  onClick: ({target}) => alert(
    `current text is: ${target.textContent}`
  ),
};
```

for more information about properties read the section [element descriptor props](#element-descriptor-props);

<br>


### array token

array token is an [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array);

> [!WARNING]  
> array token must include only tokens, otherwise an error will be thrown

<br>

array token can be used for putting multiple children into an [element descriptor token](#element-descriptor-token):

```js
const arrayToken = [

  //tokens:

  "some text",
  {tag: "hr"},
  "another text",
];

const elementDescriptorToken = {
  tag: "div",
  child: arrayToken,
};

//returns a document fragment with a <div> element that contains 3 child nodes:
xerakt(elementDescriptorToken);
/*
<div>
  some text
  <hr>
  another text
</div>
*/
```

<br>

you can[^0] pass an array token as an argument to `xerakt` if you want the returned document fragment to contain multiple nodes:

```js
const arrayToken = [

  //tokens:

  {tag: "hr"},
  "some text",
  {tag: "br"},
  {tag: "span", child: "another text"},
];

//appends 4 child nodes to the body of the document:
document.body.append(
  xerakt(arrayToken)
);
/*
<hr>
some text
<br>
<span>another text</span>
*/

//if the document body was empty, now it looks like this:
/*
<body>
  <hr>
  some text
  <br>
  <span>another text</span>
</body>
*/
```

<br>

array token can include any tokens, even other array tokens:

```js
const arrayToken0 = [

  //tokens:

  {tag: "hr"},
  "text0",
];

const arrayToken1 = [

  //tokens:

  arrayToken0,
  {tag: "hr"},
  "text1",
  [[{tag: "hr"}], "text2"],
];

const elementDescriptorToken = {
  tag: "div",
  child: arrayToken1,
};

//returns a document fragment with a <div> element that contains 6 child nodes:
xerakt(elementDescriptorToken);
/*
<div>
  <hr>
  text0
  <hr>
  text1
  <hr>
  text2
</div>
*/
```

<br>

as you could see in this example, even if array token is deeply nested, the list of resulting child nodes is flat ([NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) can't be nested);

an empty array is a valid array token:

```js
const someTokens = [

  //tokens:

  {tag: "div", child: "first div text"},
  {tag: "p", child: "p text"},
  {tag: "div", child: "second div text"},
];

//there are no tokens that will match, so arrayToken will be empty:
const arrayToken = someTokens.filter(
  (token) => token.tag === "span"
);

//the resulting document fragment will be empty:
const docFragment = xerakt(
  arrayToken
);

docFragment.childNodes.length; //0
```

<br>


### textable token

textable token is a value of type `string`, `number` or `bigint`;

textable token corresponds to the contents of a `Text` DOM node (which is automatically created for this purpose by xerakt);

when parsed, textable tokens are [converted to strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion);

many contiguous textable tokens (e. g. inside an [array token](#array-token)) are concatenated into a single `Text` DOM node:


```js
const someNumber = Math.PI * 13.37;
const someBigint = 0x7f8617295f145cc60000n;

const docFragment = xerakt(
  [

    //textable tokens:

    someNumber,
    " some text ",
    someBigint,
  ]
);

docFragment.childNodes.length; //1
docFragment.childNodes[0].nodeName; //"#text"
```

<br>


### render token

render token is a _bare [render](#renders)_ or a _render descriptor:_ an object that has `tag` property with a value that is a [render](#renders):

```js
//render tokens:
const renderDescriptorToken = {
  tag: SomeRender,
  someProp: "some value",
};
const bareRenderToken = SomeRender;
```

<br>

render token corresponds to the same DOM nodes that its outcome token does correspond to;

outcome token of a render token is a token that is the outcome of [rerendering](#rerendering) this render token's render with this render token's props;

render of a render descriptor token is the value of its `tag` property; render of a bare render token is the bare render token itself;

props of a render descriptor token are all its non-[reserved](#reserved-props) properties and, if it has `props` property, all the properties of the object that is the value of this render descriptor's `props` property (with priority to the latter in case of conflicts, the similar way as in `Object.assign(excludeReservedProps(token), token.props)`); props of a bare render token are none;

> [!WARNING]  
> if a render descriptor token has `props` property, its value must be an object, otherwise an error will be thrown

<br>

the outcome of a render token can change after some event, so the corresponding DOM will also change:

```js
const MyRender = (props) => {

  const [state, setState] = useState(
    "before click"
  );

  const outcomeTokenBeforeClick = {
    tag: "div",
    child: [
      `props.text is: ${
        props.text
      }, the state is: ${state}, `,
      {
        tag: "button",
        onClick: () => setState(
          "click was done"
        ),
        child: "click the button to change the outcome",
      },
    ],
  };

  const outcomeTokenAfterClick = {
    tag: "div",
    child: `props.text is: ${
      props.text
    }, the state is: ${state}.`,
  };

  return (
    state === "before click"
    ?
    outcomeTokenBeforeClick
    :
    outcomeTokenAfterClick
  );
};

//myRenderToken has different outcome tokens before click and after click:
//the outcome token before click is
//an element descriptor token with an array token as a child,
//and the outcome token after click is
//an element descriptor token with a textable token as a child:
const myRenderToken = {
  tag: MyRender,
  props: {
    text: "some text",
  },
};

//returns a document fragment with a <div> element that has
//2 child nodes before click and only 1 child node after click:
xerakt(myRenderToken);
//before click:
/*
<div>
  props.text is: some text, the state is: before click, 
  <button>click the button to change the outcome</button>
</div>
*/
//after click:
/*
<div>
  props.text is: some text, the state is: click was done.
</div>
*/
```

<br>


### character data descriptor token

character data descriptor token is an object that has `tag` property with value `#text`, `"#comment"` or `"#cdata-section"`;

character data descriptor token corresponds to a `CharacterData` DOM node;

the particular type of the corresponding `CharacterData` DOM node is determined by the `tag` property of the character data descriptor token: `#text` corresponds to `Text`, `"#comment"` to `Comment`, and `"#cdata-section"` to `CDATASection`;

> [!CAUTION]  
> `"#cdata-section"` value of the `tag` property currently leads to `NotSupportedError: Failed to execute 'createCDATASection' on 'Document': This operation is not supported for HTML documents.` - so don't use it until xerakt will support other namespaces than HTML

<br>

the `data` property of a character data descriptor token corresponds to the contents of the resulting `CharacterData` DOM node;

when parsed, the value of the `data` property is [converted to string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion);

unlike [textable tokens](#textable-token), the `Text` DOM nodes of many contiguous character data descriptor tokens with `tag: "#text"` are **not** concatenated:

```js
const docFragment = xerakt(
  [

    //character data descriptor tokens:

    {
      tag: "#text",
      data: 0x2a,
    },
    {
      tag: "#text",
      data: " some text ",
    },
    {
      tag: "#text",
      data: new Date(),
    },
  ]
);

docFragment.childNodes.length; //3
```

\- you can use it if you need your resulting DOM **not** to appear [normalized](https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize)[^2] or/and if another part of your code somehow relies on individual `Text` nodes;

also character data descriptor tokens (but with `tag: "#comment"`) are the appropriate way to make your resulting DOM contain HTML comments:

```js
const commentCharDataDescriptorToken = {
  tag: "#comment",
  data: "the div seems empty after appending to the page?\n try to open developer tools in your browser!"
};

//returns a document fragment with a <div> containing an HTML comment:
xerakt({
  tag: "div",
  child: commentCharDataDescriptorToken,
});
/*
<div><!--the div seems empty after appending to the page?
 try to open developer tools in your browser!--></div>
*/
```

<br>


### empty token

empty token is `null`, `false` or `undefined`;

empty token corresponds to an absence of DOM node;

it is skipped when xerakt appends child DOM nodes to a parent node;

you can use it for conditionally rendering tokens:

```js
//consider an expression:
booleanValue && myToken

//if booleanValue is true, the expression becomes:
true && myToken
//the result of this expression is the value of myToken,
//so in that case xerakt can render myToken from this expression;

//if booleanValue is false, the expression becomes:
false && myToken
//the result of this expression is false, that is an empty token,
//so in that case xerakt will not render anything from this expression;
```

> [!WARNING]  
> `true` is **not** a valid token, don't forget your equivalent of `&& myToken` part from the example above

<br>


### foreign node token

foreign node token is an instance of `Node`;

it can be used for inserting some non-xerakt-generated DOM as a child (or one of multiple children, if inside an [array token](#array-token)) of an [element descriptor token](#element-descriptor-token):

```js
const someOtherLib = (tag) => {

  const element = document.createElement(tag);

  element.append(
    `this ${tag} element is created by some non-xerakt library`
  );
  element.style.backgroundColor = "#0074a6";

  return element;
};

const divByOtherLib = someOtherLib("div");

const elementDescriptorToken = {
  tag: "section",
  children: [
    divByOtherLib,
    {
      tag: "p",
      style: {
        backgroundColor: "#f7df1e",
      },
      child: "this p element is created by xerakt",
    },
  ],
};

//returns a document fragment with a <section> element that contains
//2 child elements, one created by some non-xerakt library
//and another one created by xerakt:
xerakt(elementDescriptorToken);
/*
<section>
  <div style="background-color: rgb(0, 116, 166);">
    this div element is created by some non-xerakt library
  </div>
  <p style="background-color: rgb(247, 223, 30);">
    this p element is created by xerakt
  </p>
</section>
*/
```

> [!IMPORTANT]  
> xerakt does **not** [clone](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode) (or something like this) foreign node tokens, so you **can't** use one foreign node token [in many different places](#multipliable-and-non-multipliable-tokens)

<br>

xerakt does not affect in any way the inserted non-xerakt-generated DOM - the only things it does are checking that it is an instance of `Node` and passing it as an argument to `insertBefore` or `appendChild` (and, if necessary, to `removeChild`) method of the parent node;

> [!WARNING]  
> xerakt doesn't check what kind of node a foreign node token is, xerakt tries to insert it as child in any case, so it's your responsibility to check that this node can be inserted as a child to the corresponding parent node without any negative outcomes such as unintentional removal from previous parent or, for examle, suddenly losing all its own children in case it is a [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) (using a document fragment as a foreign node token is not a good idea in most cases)

<br>




## renders

render is used for figuring out the relevant outcome of [render tokens](#render-token) where it is used:

```js
const someRenderToken0 = {
  tag: SomeRender,
  buttonText: "some text 0",
  buttonColor: "#f7df1e",
};

//for someRenderToken0 the outcome token will be:
/*
{
    tag: "button",
    style: {
      backgroundColor: "#f7df1e",
      color: "#000000",
    },
    child: "some text 0",
    onClick: (event) => alert(
      `clicked on button with "${
        event.currentTarget.textContent
      }" text`
    ),
  }
*/

const someRenderToken1 = {
  tag: SomeRender,
  buttonText: "some text 1",
  buttonColor: "#0820e1",
  textColor: "#ffffff",
};

//for someRenderToken1 the outcome token will be:
/*
{
    tag: "button",
    style: {
      backgroundColor: "#0820e1",
      color: "#ffffff",
    },
    child: "some text 1",
    onClick: (event) => alert(
      `clicked on button with "${
        event.currentTarget.textContent
      }" text`
    ),
  }
*/


function SomeRender({
  buttonText,
  buttonColor,
  textColor = "#000000",
}) {

  return {
    tag: "button",
    style: {
      backgroundColor: buttonColor,
      color: textColor,
    },
    child: buttonText,
    onClick: (event) => alert(
      `clicked on button with "${
        event.currentTarget.textContent
      }" text`
    ),
  };
};
```

<br>

on every [rerender](#rerendering) the render is called to get the corresponding outcome token;

renders are called in different ways according to the type of render they are:

- if it is a [render function](#render-function), then it is called itself
- if it is a [renderer object](#renderer-object), then its `render` method is called
- if it is a [renderer constructor](#renderer-constructor), then the `render` method of its instance is called

> [!IMPORTANT]  
> renderer constructors (like every [constructor](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics#introducing_constructors)) are functions, and render functions are also functions, so to distinguish one from other xerakt checks if there is `render` property in the `prototype` property of the function - if there is, then the function is considered a renderer constructor

<br>


### render function

render functions are called on every [rerender](#rerendering) and must return an outcome token corresponding to the current props and state;

when xerakt calls a render function, it passes an object with corresponding props as the first argument:

```js
const MyRenderFunction0 = (props) => {

  return `the props are: ${
    Object.entries(props).map(
      (entry) => entry.join(": ")
    ).join(", ")
  };`;
};

//returns a document fragment with a text node
//containing the string returned by MyRenderFunction0:
xerakt({
  tag: MyRenderFunction0,
  someProp0: "some text",
  props: {
    someProp1: true,
  },
});
/*
the props are: someProp0: some text, someProp1: true;
*/
```

<br>

the state is managed using [hooks](#hooks):

```js
const MyRenderFunction1 = (props) => {

  const [state, setState] = useState(0);

  useEffect(
    () => setInterval(
      () => setState((state) => state + 1),
      1000
    )
  );

  return `the props are: ${
    Object.entries(props).map(
      (entry) => entry.join(": ")
    ).join(", ")
  }; the state is: ${state};`;
};

//returns a document fragment with a text node
//containing the string returned by MyRenderFunction1:
xerakt({
  tag: MyRenderFunction1,
  someProp0: "some text",
  props: {
    someProp1: true,
  },
});
/*
the props are: someProp0: some text, someProp1: true; the state is: 0;
*/
//after 1 second:
/*
the props are: someProp0: some text, someProp1: true; the state is: 1;
*/
//after another 1 second:
/*
the props are: someProp0: some text, someProp1: true; the state is: 2;
*/
//and so on;
```

<br>


### renderer object

> [!TIP]  
> probably you don't need to use renderer object - don't use it if you don't have a good reason why you should use it

on every [rerender](#rerendering) the `render` method of a renderer object is called for figuring out the relevant outcome token;

the `render` method is basically the same as [render function](#render-function), but with the value of [`this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) being the renderer object;

<br>


### renderer constructor

> [!IMPORTANT]  
> renderer constructors are **not** the same as [React class components](https://react.dev/reference/react/Component)

> [!TIP]  
> probably you don't need to use renderer constructor - don't use it if you don't have a good reason why you should use it

<br>

a renderer constructor is [constructed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) right before the initial rerender, then the resulting instance is used as a [renderer object](#renderer-object) in all the rerenders, including the initial one;

when constructed, a renderer constructor receives the prop object of the initial rerender as the first (and the only) argument - the same object will be passed to `render` method of the created instance right after the creation;

> [!TIP]  
> inside the constructor itself (not in the `render` method) you should only use the props that are not intended to change over time, because construction occurs only before the initial rerender, and if on some subsequent rerender some prop that you rely on will change, the constructor will not be called again with this prop - only the `render` method is called on every rerender (with relevant props), so it is better to move all the logic that relies on the up-to-date value of some volatile prop to the `render` method

<br>




## rerendering

[.......]

<br>




## hooks

[.......]

<br>


### useState, useReplaceableState, useDerivableState

<br>


### useStore

<br>


### useEffect, useResultEffect

<br>


### useDeps, useCompute

<br>


### usePlug

<br>


### useProps

<br>




## element descriptor props

by default, properties of an [element descriptor token](#element-descriptor-token) are assigned to the corresponding DOM element as is:

```js
//for example, this code:
document.body.append(
  xerakt({
    tag: "p",
    contentEditable = true,
  })
);

//does exactly the same as this code:
const docFragment = document.createDocumentFragment();
const p = document.createElement("p");
p.contentEditable = true;
docFragment.appendChild(p);
document.body.append(docFragment);
```

> [!WARNING]  
> defining some specific properties on an element descriptor token can even cause an error, because xerakt isn't aware of the consequences, it will assign the property nevertheless:
>
> ```js
> xerakt({
>   tag: "div",
>   insertBefore: null,//bad property, because there is a DOM method with that name;
>   child: "some text",
> });
> //TypeError: parentNode.insertBefore is not a function
> ```
>
> \- it's your responsibility to check if it is a good idea to change some particular property of an element

<br>

but for some properties the behavior is different:

```js
//for example, this code:
document.body.append(
  xerakt({
    tag: "p",
    style: {
      backgroundColor: "#f7df1e",
      fontSize: "24pt!important",
    },
    classList: ["paragraph", "section-content"],
  })
);
//appends to the document body the following element:
/*
<p
  class="paragraph section-content"
  style="background-color: rgb(247, 223, 30); font-size: 24pt !important;"
>
</p>
*/

//but if you will try to "decompile" it in the same manner as
//in the first example, this time you will not get the same result:
const docFragment = document.createDocumentFragment();
const p = document.createElement("p");
p.style = {
  backgroundColor: "#f7df1e",
  fontSize: "24pt!important",
};
p.classList = ["paragraph", "section-content"];
docFragment.appendChild(p);
document.body.append(docFragment);
//appends to the document body the following element:
/*
<p
  class="paragraph,section-content"
  style=""
>
</p>
//the style is empty, the class list contains only
//1 class name (which contains comma) instead of 2 separate class names;
*/
```

\- this is because `style` and `classList` are _special props_ of element descriptor;

special props are treated differently than regular ones to make changing some aspects of element more convenient;

a prop is specal not only if the property name exactly matches some constant value (as with `style`), but also if it is prefixed with `on` or with `data`, and the character after the prefix is upper-case (e. g. as in `onClick`, `dataName`), or if it is prefixed with `on_`, with `on-`, with `data_` or with `data-` (e. g. as in `on_DOMContentLoaded`, `"data-name"`);

special props can have aliases ...........

> [!WARNING]  
> don't use multiple aliases of the same special prop on the same element descriptor token, it may cause unexpected behavior

<br>

special props are:

- [`style` | `styles` | `css`](#style--styles--css)
- [`class` | `classes` | `classList` | `className`](#class--classes--classlist--classname)
- [`attributes` | `attribute` | `attrs` | `attr`](#attributes--attribute--attrs--attr)
- [`handlers` | `handler` | `listeners` | `listener`](#handlers--handler--listeners--listener)
- [`on`](#on)
- [prefixed with `on` and starting after that with an uppercase character, or prefixed with `on_` | `on-`](#prefixed-with-on);
- [`dataset`](#dataset)
- [prefixed with `data` and starting after that with an uppercase character, or prefixed with `data_` | `data-`](#prefixed-with-data);
- [`props`](#props)

<br>

[.......]

<br>


### `style` | `styles` | `css`

the value can be of type `string` or `object`, or be `false`, `null` or `undefined`;

> [!WARNING]  
> if the value is an object, it should not have multiple property names that lead to same kebab-case representation (for example `{"font-size": 14, fontSize: 16}`) - this may lead to unexpected behavior

> [!WARNING]  
> if the value is an object, it should not have `cssText` property - this may lead to unexpected behavior

<br>

if the value is `false`, `null` or `undefined`, then an empty string is assigned to the `cssText` property of the element style declaration;

if the value is a string, then it is assigned to the `cssText` property of the element style declaration;

if the value is an object, then each property of this object is converted from camelCase to kebab-case (if it is not camelCased, then it is used as is) and added to the style declaration using the [`setProperty`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method (and later, if necessary, removed using the [`removeProperty`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty) method);

if the value of such property is `false`, `null` or `undefined`, then an empty sting is passed as the second and the third arguments to the `setProperty` method;

if the value of such property is of type `string` and ends with `" !important"` or `"!important"`, then the contents of the string before such ending are passed as the second argument to the `setProperty` method, and `"!important"` is passed as the third;

if the value of such property is any other string, then it is passed as the second argument to the `setProperty` method, and an empty string is passed as the third;

if the value of such property is of type `object`, then its `value` property is converted to string (except that values `false`, `null` and `undefined` are substituted with an empty string) and passed as the second argument to the `setProperty` method, the third argument being `"improtant"` if the object has [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) `important` property, and being an empty string otherwise;

any other values of such property are converted to string and passed as the second argument to the `setProperty` method, with the third argument being an empty string;

<br>


### `class` | `classes` | `classList` | `className`

the value can be of type `string`, be `false`, `null` or `undefined`, or be an array (possibly nested) of any of these values;

if the value is a string, then it is added to the [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) of the element, and if it is `false`, `null` or `undefined`, then nothing is added to the `classList`;

if the value is an array, then it is flattened, and then each item is treated in the same way as described above;

<br>


### `attributes` | `attribute` | `attrs` | `attr`

the value can be of type `object`, or be `false`, `null` or `undefined`;

if the value is `false`, `null` or `undefined`, then no attributes are added;

if the value is an object, then each its property must have a value of type `string`, `number` or `bigint`, or a value `true`, `false`, `null` or `undefined`;

if the value of such property is `false`, `null` or `undefined`, then no attribute is added for this property;

if the value of such property is of type `string`, `number` or `bigint`, then it is converted to the string and passed as the second argument to the [`setAttribute`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute) method of the element, with the property name being the first argument;

if the value of such property is `true`, then an empty string is passed as the second argument to the `setAttribute` method of the element, with the property name being the first argument;

<br>


### prefixed with `on`

[.......]

<br>


### `on`

[.......]

<br>


### `handlers` | `handler` | `listeners` | `listener`

[.......]

<br>


### `dataset`

[.......]

<br>


### prefixed with `data`

[.......]

<br>


### `props`

[.......]

<br>




## keys

[.......]

<br>




## results

[.......]

<br>




## top-level token

top-level token is a token that you pass as an argument to `xerakt` function;

top-level token must always correspond to the same DOM nodes[^3], otherwise an error will be thrown when the corresponding DOM nodes will change;

> [!IMPORTANT]  
> xerakt **can't** immediately check if a token that is passed to it as an argument does always correspond to the same DOM nodes, and this can be figured out at runtime only when it is already too late (an error will be thrown, but that can be much later than calling the `xerakt` function and, possibly, not in all execution scenarios), so it is your responsibility to ensure that a token passed as argument to `xerakt` is a legal top-level token

<br>

to be sure that the corresponding DOM nodes will not change, you should use only [consistent](#consistent-and-non-consistent-tokens) tokens as top-level token - every consistent token always corresponds to the same DOM nodes[^4];

> [!NOTE]  
> there are some non-consistent tokens that *do* always correspond to the same DOM nodes (for example, a [render token](#render-token) that changes its outcome only from `"some text"` to `[["some", " ", "other", " "], () => "text"]` and vice versa - it is [non-consistent (because a collection of a textable token and an array token is not an interconsistent collection)](#consistent-render-token), but in both cases all the text ends up in the same `Text` node, so using such token as an argument for `xerakt` function will not cause an error), but sometimes it can be very difficult to tell if some particular non-consistent token is a legal top-level token, so it is more convenient to use only [consistent](#consistent-and-non-consistent-tokens) tokens as an argument to `xerakt` function

<br>


### consistent and non-consistent tokens

> [!TIP]  
> there is a hight probability that your app token which you pass to xerakt as `xerakt(MyApp)` is already consistent and you have nothing to worry about:
>
> <details>
>
>   <summary>...</summary>
>
>   ```js
>   import {xerakt} from "xerakt";
>
>   import {
>     Header,
>     NavBar,
>     MainSection,
>     Footer,
>   } from "./PageParts.js"
>
>
>   const MyApp = () => {
>
>     /* some code */
>
>     //always returns an element descriptor token:
>     return {
>
>       //no .key property
>
>       //.tag is always the same ("div", in this case):
>       tag: "div",
>
>       //all the components of the app are children of the returned token:
>       children: [
>         {
>           tag: Header,
>           /*
>           ...some props for Header
>           */
>         },
>         {
>           tag: NavBar,
>           /*
>           ...some props for NavBar
>           */
>         },
>         {
>           tag: MainSection,
>           /*
>           ...some props for MainSection
>           */
>         },
>         Footer,
>       ],
>     };
>   };
>
>   //MyApp is consistent, so you can pass it as argument to xerakt:
>   document.body.append(
>     xerakt(MyApp) //should work fine
>   );
>   ```
>
>   <br>
>
>   if your `MyApp` (or whatever you called it) function always returns [element descriptor token](#element-descriptor-token) with always the same `tag` property (e. g. always only `"div"` - the value isn't created dynamically at runtime, isn't choosed conditionally) and without `key` property, then you can be sure that it is consistent and you can use `xerakt(MyApp)` without any troubles
>
> </details>

> [!TIP]  
> if the previous tip is not the case, the most strightforward way to ensure that you pass a consistent token as argument to `xerakt` is to use a container:
>
> ```js
> xerakt({
>   tag: "div",
>   child: MyApp,
> });
> ```
>
> \- suchwise you pass to `xerakt` an [element descriptor token](#element-descriptor-token) (which is always consistent by definition), and the `child` of element descriptor token (`MyApp`, in this case) **can** be non-consistent, this doesn't make any trouble

<br>

consistent token is:

- any [element descriptor token](#element-descriptor-token) (always corresponds to an HTMLElement DOM node)
- any [textable token](#textable-token) (one textable token or multiple contiguous textable tokens always correspond to a Text DOM node)
- any [character data descriptor token](#character-data-descriptor-token) (always corresponds to a CharacterData DOM node)
- any [empty token](#empty-token) (always doesn't correspond to any DOM node)
- any [foreign node token](#foreign-node-token) (always corresponds to itself)
- an [array token](#array-token) that doesn't include any non-consistent tokens (always corresponds to what the tokens it includes do correspond to)
- a [consistent render token](#consistent-render-token) (always corresponds to same DOM nodes)

<br>

non-consistent token is any other token:

- an [array token](#array-token) that includes one or more non-consistent tokens
- a [render token](#render-token) that is not [consistent render token](#consistent-render-token)

<br>


### consistent render token

a [render token](#render-token) is consistent if and only if the collection of all its possible outcome tokens is _interconsistent_;

a collection of tokens is interconsistent if and only if it meets **one** of the following criteria:

- each member of the collection is an [element descriptor token](#element-descriptor-token) without `key` property, and all the members have the same value of `tag` property
- each member of the collection is an [element descriptor token](#element-descriptor-token) with `key` property, and all the members have the same value of `tag` property and have the same value of `key` property
- each member of the collection is a [character data descriptor token](#character-data-descriptor-token) without `key` property, and all the members have the same value of `tag` property
- each member of the collection is a [character data descriptor token](#character-data-descriptor-token) with `key` property, and all the members have the same value of `tag` property and have the same value of `key` property
- each member of the collection is a [consistent render token](#consistent-render-token) that is a render descriptor without `key` property, and all the members have the same value of `tag` property
- each member of the collection is a [consistent render token](#consistent-render-token) that is a render descriptor with `key` property, and all the members have the same value of `tag` property and have the same value of `key` property
- each member of the collection is a [consistent render token](#consistent-render-token) that is a bare render, and all the members are the same value
- each member of the collection is a [textable token](#textable-token)
- each member of the collection is an [empty token](#empty-token)
- each member of the collection is a [foreign node token](#foreign-node-token), and all the members are the same value
- each member of the collection is an [array token](#array-token) that includes only tokens, and all the members have the same value of `length` property, and for every possible non-negative integer value N that is lesser than the value of `length` property of any member, the collection of tokens at index N of all the members is interconsistent

<br>

for example:

```js
const SomeRender0 = () => {

  const [state, setState] = useState(true);

  useEffect(
    () => setInterval(
      () => setState((oldState) => !oldState),
      1000
    )
  );

  if (state) {

    return "the state is true";

  } else {

    return 0 / 0;
  };
};

const renderToken0 = {
  tag: SomeRender0,
};

//the collection of outcome tokens of renderToken0 contains only 2 members:
//"the state is true" and NaN - both are textable tokens, so that collection
//is interconsistent, and you can be sure that renderToken0
//is a legal top-level token:
xerakt(renderToken0);//all is fine, no error
```

<br>

another example:

```js
//the possible outcome of rerendering SomeRender1 can be eiter <div> or <p>:
const SomeRender1 = ({isDiv}) => {

  if (isDiv) {

    return {
      tag: "div",
      child: "this is a <div> element",
    };

  } else {

    return {
      tag: "p",
      child: "this is not a <div> element",
    };
  };
};

//but not all possible outcomes of SomeRender1 can be
//an outcome of renderToken1 which has specific props:
const renderToken1 = {
  tag: SomeRender1,
  isDiv: true,
};

//because renderToken1.isDiv === true, the outcome of rerendering SomeRender1
//can only be an element descriptor token without a key and only
//with "div" value of its .tag property, so collection
//of all the possible outcome tokens of renderToken1 is interconsistent,
//and you can be sure that renderToken1 is a legal top-level token:
xerakt(renderToken1);//all is fine, no error
```

<br>

and another example:

```js
const SomeRender2 = ({color}) => {

  const [isDiv, setIsDiv] = useState(true);

  useEffect(
    () => setInterval(
      () => setIsDiv((oldState) => !oldState),
      5000
    )
  );
  
  return {

    tag: isDiv ? "div" : "p",
    style: {color},
  };
};

const renderToken2 = {
  tag: SomeRender2,
  color: "#E22025",
};

//all the members of the collection of outcome tokens of renderToken2
//are element descriptor tokens, but they can have different .tag property,
//so that collection isn't interconsistent, therefore renderToken2
//is non-consistent render token, and if you pass it as an argument
//to xerakt function, there will be an error after 5 seconds:
xerakt(renderToken2);//TypeError: Illegal result: the argument passed to xerakt has rendered a result that corresponds to different DOM node(s) than its initial result ...

//an array token that includes any non-consistent token is also non-consistent:
xerakt([renderToken2]);//still the same error

//but element descriptor token is always consistent, so this will work:
xerakt({
  tag: "div",
  child: renderToken2,
});//all is fine, no error
```

<br>

and example with an array token:

```js
const SomeRender3 = ({color}) => {

  const [isDiv, setIsDiv] = useState(true);

  useEffect(
    () => setInterval(
      () => setIsDiv((oldState) => !oldState),
      5000
    )
  );
  
  return [
    {
      tag: "#text",
      data: `the next element is${
        isDiv ? "" : "n't"
      } <div>`,
    },
    {
      tag: isDiv ? "div" : "p",
      style: {color},
    },
  ];
};

const renderToken3 = {
  tag: SomeRender3,
  color: "#E22025",
};

//all the members of the collection of outcome tokens of renderToken3
//are array tokens,
//and all the members have the same value (the value is 2) of .length property,
//so this collection will be interconsistent if and only if
//for every relevant N the collection of tokens that are
//at index N of all possible outcome tokens is consistent;
//for N = 0, such collection is the collection of tokens that
//are at index 0 of the outcome array token;
//any outcome array token of renderToken3 always
//has a character data descriptor token on index 0,
//and that character data descriptor token always
//has "#text" as the value of its .tag property
//(and never "#comment", for example), so for N = 0 the collection
//is interconsistent;
//and collection of tokens that are at index 1 will include
//only element descriptor tokens, but .tag property will not be the same
//for all the members, because it can be "div" and also can be "p";
//so for N = 1 such collection will not be interconsistent,
//therefore neither is the collection of all the possible outcome tokens
//of renderToken3, and if you pass renderToken3 as an argument
//to xerakt function, there will be an error after 5 seconds:
xerakt(renderToken3);//TypeError: Illegal result: the argument passed to xerakt has rendered a result that corresponds to different DOM node(s) than its initial result ...
```

<br>




## miscellaneous


### multipliable and non-multipliable tokens

many types of tokens are _multipliable_, i. e. you can use the same value multiple times as if it were multiple tokens:

```js
const someElementDescriptorToken = {
  tag: "div",
  child: "some text",
};

const arrayToken = [

  //same token is used twice:

  someElementDescriptorToken,
  someElementDescriptorToken,
];

//true, it is the same token:
arrayToken[0] === arrayToken[1];//true

//in the returned document fragment there is 2 different <div> elements:
const docFragment = xerakt(arrayToken);
/*
<div>some text</div>
<div>some text</div>
*/

//false, it is 2 different <div> elements, not the same element:
docFragment.childNodes[0] === docFragment.childNodes[1];//false
```

\- it works exactly the same as if it were 2 different tokens:

```js
const arrayToken = [

  //two different tokens with the same properties:

  {
    tag: "div",
    child: "some text",
  },
  {
    tag: "div",
    child: "some text",
  },
];

//in previous example it was true, but here it
//is false, because now it is not the same token:
arrayToken[0] === arrayToken[1];//false

//but nevertheless the behavior is exactly the same as in the previous example:
const docFragment = xerakt(arrayToken);
/*
<div>some text</div>
<div>some text</div>
*/

//false, exactly as in previous example:
docFragment.childNodes[0] === docFragment.childNodes[1];//false
```

<br>

for some tokens, using exactly the same token multiple times is the only reasonable way to get multiple DOM nodes:

```js
const SomeRender = () => {

  const [count, setCount] = useState(0);

  const getCount = usePlug(
    () => count,
    [count]
  );

  const onClick = usePlug(
    () => {

      setCount((oldCount) => oldCount + 1);

      const count = getCount();

      console.log(
        `this is the click #${count}`
      );
    },
    [setCount, getCount]
  );

  return {
    tag: "button",
    child: "log the number of current click",
    onClick,
  };
};

const bareRenderToken = SomeRender;

const arrayToken = [

  //the same bareRenderToken is used in two different places:

  {
    tag: "p",
    child: bareRenderToken,
  },
  {
    tag: "div",
    child: bareRenderToken,
  },
];

arrayToken[0].child === arrayToken[1].child//true, it is the same token

//however, the DOM structure of the returned document fragment contains
//2 different <button> elements, they count clicks independently:
xerakt(arrayToken);
/*
<p>
  <button>log the number of current click</button>
</p>
<div>
  <button>log the number of current click</button>
</div>
*/
```

<br>

but for some tokens this **doesn't** work:

```js
const foreignNode = document.createElement("div");
foreignNode.append("this <div> element isn't created by xerakt");
foreignNode.style.backgroundColor = "#0074a6";

const foreignNodeToken = foreignNode;

const arrayToken = [

  //foreignNodeToken is used twice:

  foreignNodeToken,
  foreignNodeToken,
];

//but, in contrast to the previous examples, there is only
//1 element in the returned document fragment:
xerakt(arrayToken);
/*
<div style="background-color: rgb(0, 116, 166);">
  this &lt;div&gt; element isn't created by xerakt
</div>
*/

//even something like this wouldn't work:
const foreignNodeToken0 = foreignNode;
const foreignNodeToken1 = foreignNode;

const docFragment = xerakt([
  foreignNodeToken0,
  foreignNodeToken1,
]);

//foreignNodeToken0 === foreignNodeToken1, so there
//is still only 1 element inside the returned document fragment:
docFragment.childNodes.length;//1
```

<br>

the last example works differenly from the previous examples because [foreign node tokens](#foreign-node-token) are _non-multipliable_;

you **can't** use a non-multipliable token in multiple different places the same way as you would use a multipliable token;

> [!WARNING]  
> using a non-multipliable token in multiple places can even cause an error in some cases

<br>

non-multipliable token is:

- any [foreign node token](#foreign-node-token)
- an [array token](#array-token) that includes one or more non-multipliable tokens
- a [render token](#render-token) that has any non-multipliable token as its outcome
- an [element descriptor token](#element-descriptor-token) that has any non-multipliable token as its child

<br>

multipliable token is any other token:

- any [textable token](#textable-token)
- any [character data descriptor token](#character-data-descriptor-token)
- any [empty token](#empty-token)
- an [array token](#array-token) that doesn't include any non-multipliable tokens
- a [render token](#render-token) that doesn't have any non-multipliable tokens as its outcome
- an [element descriptor token](#element-descriptor-token) that doesn't have a non-multipliable token as its child

<br>


### reserved props

[.......]

<br>




## license

[.......]

<br>

</article>


[^0]: a token [passed to `xerakt` as an argument](#top-level-tokens) should be [consistent](#consistent-and-non-consistent-tokens), otherwise it can be possible that an illegal rerender will occur and an error will be thrown

[^1]: in fact, each element descriptor token can have only one child, but this child can be an [array token](#array-token) that includes many tokens, so it works like having multiple children

[^2]: even if you are not using any [character data descriptor tokens](#character-data-descriptor-token) with `tag: "#text"` (and aren't using, for expample, [foreign node tokens](#foreign-node-token), `innerHTML` property on [element descriptor token](#element-descriptor-token) or any other way to insert non-xerakt-generated DOM (where could be additional `Text` nodes) into the xerakt-generated one), then the resulting DOM will not necessarily be in a fully [_normalized_ form](https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize), because, for optimization reasons, contiguous [textable tokens](#textable-token), each of which is an empty string, will correspond to an empty `Text` DOM node (*not* an absence of any) - such behavior is implemented to avoid additional rearrangements of a parent node's child nodes if contents of such textable tokens are calculated dynamically and can sometimes become empty; only if (in addition to all the previous constictions) your code doesn't contain any contiguous textable tokens that can become each an empty string the same time, then the resulting DOM will be in a _normalized_ form

[^3]: shallowly, of course - if the parent node remains the same, its child nodes can be changed without any problem

[^4]: if it is used in the same place (using it as an argument for `xerakt` function means it is used in only one place, so it is fine)