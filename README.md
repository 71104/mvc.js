# mvc.js

A lightweight MVC framework inspired by [AngularJS](https://angularjs.org/) (not Angular).

## Bootstrap

Import the latest build:

```html
<html>
<head>
  ...
  <script src="mvc.min.js"></script>
</head>
<body>
  ...
</body>
</html>
```

Initialize by binding a DOM element to a model object:

```html
<body>
  <div id="container">
    ...
  </div>
  <script>
    window.addEventListener('DOMContentLoaded', function () {
      var container = document.getElementById('container');
      MVC.bind({
        foo: 'bar',
        lorem: 'ipsum',
        ...
      }, container);
    });
  </script>
</body>
```

Or just bind the document's body:

```html
<html>
<head>
  ...
  <script src="mvc.min.js"></script>
</head>
<body>
  ...
  <script>
    window.addEventListener('DOMContentLoaded', function () {
      MVC.bindBody({
        foo: 'bar',
        lorem: 'ipsum',
        ...
      });
    });
  </script>
</body>
</html>
```

If you want to start out with an empty model (and add data later in your
controllers) you can simply tag the root element with the `mvc-app` attribute:

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
