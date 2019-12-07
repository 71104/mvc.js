/// <reference path="../Directives.ts" />
/// <reference path="../expr/Parser.ts" />


class BindDirective extends MVC.Directives.BaseDirective implements DirectiveInterface {
  public static readonly NAME: string = 'bind';

  private _nextDirective: DirectiveInterface | null;

  public static matches(node: Node): boolean {
    return [Node.ELEMENT_NODE, Node.TEXT_NODE].includes(node.nodeType);
  }

  public constructor(next: DirectiveChainer, model: Model, node: Node) {
    super(next, model, node);
    switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      this._bindElement(<Element>node);
      break;
    case Node.TEXT_NODE:
      this._bindText(<Text>node);
      break;
    }
    this._nextDirective = this.next(this.model, this.node);
  }

  private _bindElement(element: Element): void {
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      if (!attribute.name.startsWith('mvc-')) {
        const expression = MVC.Expressions.interpolate(attribute.value);
        if (!expression.isAllStatic()) {
          this.watchStringImmediate(expression, value => {
            attribute.value = value;
          });
        }
      }
    }
  }

  private _bindText(text: Text): void {
    const expression = MVC.Expressions.interpolate('' + text.textContent);
    if (!expression.isAllStatic()) {
      this.watchStringImmediate(expression, value => {
        text.textContent = value;
      });
    }
  }

  public destroy(): void {
    super.destroy();
    if (this._nextDirective) {
      this._nextDirective.destroy();
      this._nextDirective = null;
    }
  }
}
