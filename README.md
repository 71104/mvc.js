# mvc.js

A lightweight MVC framework inspired by [AngularJS](https://angularjs.org/) (not Angular 2).

This is mostly a trimmed-down version of AngularJS with a few important
differences that make it more usable. It is also more efficient because it
relies on [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
objects to detect changes rather than evaluating the entire model every time.

## Bootstrap

Import the latest build and initialize mvc.js by adding the `mvc-app` attribute
to an element of your choice (typically the document body):

```html
<html>
<head>
  ...
  <script src="mvc.min.js"></script>
</head>
<body mvc-app>
  ...
</body>
</html>
```

Much like in AngularJS, you can use `mvc-cloak` to prevent showing template DOM before mvc.js has a chance to render it, but you'll have to style it on your own (mvc.js only removes the `mvc-cloak` attribute or CSS class after rendering).

```html
<html>
<head>
  ...
  <style>
    [mvc-cloak] {
      display: none !important;
    }
  </style>
  <script src="mvc.min.js"></script>
</head>
<body mvc-app mvc-cloak>
  ...
</body>
</html>
```

## Directives

Much like AngularJS, mvc.js has directives that affect the HTML elements to which they're attached and can be specified as HTML attributes (e.g. [`mvc-if`](#mvc-if)) or elements (e.g. [`mvc-include`](#mvc-include-mvc-transclude)).

When a DOM tree is bound to a model (either explicitly with `MVC.bind()` or implicitly using `mvc-app`) the tree is walked depth-first and for each node, each registered directive decides whether or not it can attach itself to the node. When a directive attaches itself to a node it takes responsibility for any changes performed on the node while keeping in mind that the next directives in the chain may also decide to attach themselves to the same node and perform other changes. Possible changes include even eliminating the node from the tree (cfr. [`mvc-if`](#mvc-if)) or replicating it many times (cfr. [`mvc-for`](#mvc-for)).

The order in which existing directives are executed on each node is well defined and it's very important to determine how each element works, e.g. what fields can be fecthed from the model by each directive. Built-in directives are executed in the following order:

1. [`mvc-with-*`](#mvc-with-)
2. [`mvc-for`](#mvc-for)
3. [`mvc-if`](#mvc-if)
4. [`mvc-controller`](#mvc-controller)
5. [`mvc-include`](#mvc-include-mvc-transclude)
6. [`mvc-on-*`](#mvc-on-)
7. [Two-way data binding](#two-way-data-binding)

This means, for example, that `mvc-if` can access fields that are added to the model by `mvc-for`, such as the iteration variable, the `$index` variable, and so on, because `mvc-if` runs after `mvc-for`.

## Built-in Directives

### Two-way data binding

mvc.js supports the double curly bracket syntax for HTML attributes and text elements. They get updated automatically as the model changes. Example:

```html
<p mvc-controller="MyController" class="first-class {{secondClass}} third-class">
  The quick brown {{jumper}} jumps over the lazy {{jumpee}}.
</p>
```

```js
MVC.Controllers.register(function MyController(model) {
  model.secondClass = 'second-class';
  model.jumper = 'fox';
  model.jumpee = 'dog';
});
```

In the above we used [`mvc-controller`](#mvc-controller) to change the `secondClass`, `jumper`, and `jumpee` variables in the model.

### `mvc-on-*`

TBD

### `mvc-include`, `mvc-transclude`

`mvc-include` elements are automatically replaced with the HTML code of the specified template. Templates are identified by unique names and can be either provided to the JavaScript API or as HTML5 `<template>` elements.

The following:

```html
<body mvc-app>
  <mvc-include template="template1"></mvc-include>
  <mvc-include template="template2"></mvc-include>
  <template id="template2">
    <p>Paragraph 2.</p>
  </template>
</body>
```

```js
MVC.Templates.registerFromString('template1', `
  <p>Paragraph 1</p>
`);
```

is equivalent to the following:

```html
<body>
  <p>Paragraph 1.</p>
  <p>Paragraph 2.</p>
</body>
```

Templates may contain other directives. The following:

```html
<body mvc-app>
  <mvc-include template="paragraphs"></mvc-include>
  <template id="paragraphs">
    <p mvc-for="i in [1, 2, 3]">Paragraph {{i}}.</p>
  </template>
</body>
```

is equivalent to:

```html
<body>
  <p>Paragraph 1.</p>
  <p>Paragraph 2.</p>
  <p>Paragraph 3.</p>
</body>
```

The content of an `mvc-include` element itself is _transcluded_ in the template if the template has one or more _transclusion points_. Transclusion points are marked by the `<mvc-transclude>` element. For example:

```html
<body mvc-app>
  <mvc-include template="dialog">
    <p>The quick brown fox jumps over the lazy dog.</p>
  </mvc-include>
  <template id="dialog">
    <dialog open>
      <mvc-transclude></mvc-transclude>
    </dialog>
  </template>
</body>
```

is equivalent to:

```html
<body>
  <dialog open>
    <p>The quick brown fox jumps over the lazy dog.</p>
  </dialog>
</body>
```

### `mvc-controller`

TBD

### `mvc-if`

Adds or removes a DOM node conditionally based on an expression.

Example:

```html
<body mvc-app>
  ...
  <div mvc-if="var1 && var2">
    ...
  </div>
  ...
</body>
```

The `<div>` element and its content are kept in the DOM iff both model fields `var1` and `var2` are `true` (or other non-falsey JS values).

### `mvc-for`

TBD

### `mvc-with-*`

TBD

## Defining Custom Directives

TBD
