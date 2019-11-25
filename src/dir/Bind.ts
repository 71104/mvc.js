/// <reference path="../expr/Parser.ts" />


class ExpressionWatcher {
  public constructor(
      public readonly path: string[],
      public readonly handler: EventHandler) {}
}


class BindDirective implements DirectiveInterface {
  public static readonly NAME: string = 'bind';

  private readonly _watchers: ExpressionWatcher[] = [];

  public static matches(node: Node): boolean {
    return [Node.ELEMENT_NODE, Node.TEXT_NODE].includes(node.nodeType);
  }

  public constructor(
      public readonly next: DirectiveChainer,
      private readonly _model: Model,
      public readonly node: Node)
  {
    switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      this._bindElement(<Element>node);
      break;
    case Node.TEXT_NODE:
      this._bindText(<Text>node);
      break;
    }
    this.next(this._model, this.node);
  }

  private _bindElement(element: Element): void {
    const model = this._model;
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      if (!attribute.name.startsWith('mvc-')) {
        const expression = MVC.Expressions.interpolate(attribute.value);
        if (!expression.isAllStatic()) {
          const compiledExpression = MVC.Expressions.compileSafeString(expression);
          attribute.value = compiledExpression.call(model.proxy);
          expression.getFreePaths().forEach(freePath => {
            const path = freePath.bind(model.proxy);
            const handler = (value: any): void => {
              attribute.value = compiledExpression.call(model.proxy);
            };
            this._watchers.push(new ExpressionWatcher(path, handler));
            this._model.on(path, handler);
          }, this);
        }
      }
    }
  }

  private _bindText(text: Text): void {
    const model = this._model;
    const expression = MVC.Expressions.interpolate('' + text.textContent);
    if (!expression.isAllStatic()) {
      const compiledExpression = MVC.Expressions.compileSafeString(expression);
      text.textContent = compiledExpression.call(model.proxy);
      expression.getFreePaths().forEach(freePath => {
        const path = freePath.bind(model.proxy);
        const handler = (value: any): void => {
          text.textContent = compiledExpression.call(model.proxy);
        };
        this._watchers.push(new ExpressionWatcher(path, handler));
        this._model.on(path, handler);
      }, this);
    }
  }

  public destroy(): void {
    this._watchers.forEach(({path, handler}) => {
      this._model.off(path, handler);
    }, this);
    this._watchers.length = 0;
  }
}
