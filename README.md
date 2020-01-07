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

### `mvc-controller`

TBD

### `mvc-if`

TBD

### `mvc-for`

TBD

### `mvc-with-*`

TBD

## Defining Custom Directives

TBD
