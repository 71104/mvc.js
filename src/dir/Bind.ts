/// <reference path="../expr/Parser.ts" />
/// <reference path="../expr/Watchers.ts" />


class BindDirective implements DirectiveInterface {
  public static readonly NAME: string = 'bind';

  private readonly _watchers: StringWatcher[] = [];
  private readonly _nextDirective: DirectiveInterface;

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
    this._nextDirective = this.next(this._model, this.node);
  }

  private _bindElement(element: Element): void {
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      if (!attribute.name.startsWith('mvc-')) {
        const expression = MVC.Expressions.interpolate(attribute.value);
        if (!expression.isAllStatic()) {
          this._watchers.push(this._model.watchStringImmediate(expression, value => {
            attribute.value = value;
          }));
        }
      }
    }
  }

  private _bindText(text: Text): void {
    const expression = MVC.Expressions.interpolate('' + text.textContent);
    if (!expression.isAllStatic()) {
      this._watchers.push(this._model.watchStringImmediate(expression, value => {
        text.textContent = value;
      }));
    }
  }

  public destroy(): void {
    this._nextDirective.destroy();
    this._watchers.forEach(watcher => {
      watcher.destroy();
    });
    this._watchers.length = 0;
  }
}
