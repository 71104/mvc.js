/// <reference path="../Directives.ts" />
/// <reference path="../expr/Parser.ts" />


class IfDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME = 'if';

  private readonly _marker: Comment;
  private _nextDirective: DirectiveInterface | null = null;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-if');
  }

  public constructor(next: DirectiveChainer, model: Model, node: Node) {
    super(next, model, node);
    const element = <Element>this.node;
    const expression = element.getAttribute('mvc-if');
    if (!expression) {
      throw new Error('invalid value for mvc-if attribute (must be an expression)');
    }
    const parentNode = element.parentNode;
    if (!parentNode) {
      throw new Error(`element with mvc-if=${JSON.stringify(expression)} is an orphan`);
    }
    this._marker = document.createComment(`mvc-if: ${JSON.stringify(expression)}`);
    parentNode.insertBefore(this._marker, element);
    const parsedExpression = MVC.Expressions.parse(expression);
    const watcher = this.watchBoolean(parsedExpression, value => {
      if (value !== this.status) {
        if (value) {
          parentNode.insertBefore(element, this._marker.nextSibling);
          this._nextDirective = this.next(this.model, this.node);
        } else {
          this._nextDirective!.destroy();
          this._nextDirective = null;
          parentNode.removeChild(element);
        }
      }
    }, this);
    if (watcher.value) {
      this._nextDirective = this.next(this.model, this.node);
    } else {
      parentNode.removeChild(element);
    }
  }

  public get status(): boolean {
    return null !== this._nextDirective;
  }

  public destroy(): void {
    super.destroy();
    if (this._nextDirective) {
      this._nextDirective.destroy();
      this._nextDirective = null;
    }
  }
}
