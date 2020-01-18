/// <reference path="../Directives.ts" />
/// <reference path="../expr/Parser.ts" />


class IfDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME = 'if';

  private _nextDirective: DirectiveInterface | null = null;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-if');
  }

  public constructor(
      chain: DirectiveChainer,
      model: Model,
      node: Node,
      controllers: ControllerFrame)
  {
    super(chain, model, node, controllers);
    const element = <Element>this.node;
    const expression = element.getAttribute('mvc-if');
    if (!expression) {
      throw new Error('invalid value for mvc-if attribute (must be an expression)');
    }
    this.createMarker(`mvc-if: ${JSON.stringify(expression)}`);
    const parsedExpression = MVC.Expressions.parse(expression);
    const watcher = this.watchBoolean(parsedExpression, value => {
      if (value !== this.status) {
        if (value) {
          this._nextDirective = this.insertBefore(element, this.marker!.nextSibling);
        } else {
          this.destroyChildren();
        }
      }
    }, this);
    if (watcher.value) {
      this._nextDirective = this.chain(this.model, this.node, this.controllers);
    } else {
      try {
        this.parentNode.removeChild(element);
      } catch (e) {}
    }
  }

  public get status(): boolean {
    return null !== this._nextDirective;
  }
}
