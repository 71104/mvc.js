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

TBD

### `mvc-controller`

TBD

### `mvc-if`

TBD

### `mvc-for`

TBD

### `mvc-with-*`

TBD

### `mvc-on-*`

TBD

## Defining Custom Directives

TBD
