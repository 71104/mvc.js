/// <reference path="../Directives.ts" />
/// <reference path="../expr/Parser.ts" />


class IfDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME = 'if';

  private readonly _parentNode: Node;
  private readonly _marker: Comment;
  private _nextDirective: DirectiveInterface | null = null;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-if');
  }

  public constructor(chain: DirectiveChainer, model: Model, node: Node) {
    super(chain, model, node);
    const element = <Element>this.node;
    const expression = element.getAttribute('mvc-if');
    if (!expression) {
      throw new Error('invalid value for mvc-if attribute (must be an expression)');
    }
    if (!element.parentNode) {
      throw new Error(`element with mvc-if=${JSON.stringify(expression)} is an orphan`);
    }
    this._parentNode = element.parentNode;
    this._marker = document.createComment(`mvc-if: ${JSON.stringify(expression)}`);
    this._parentNode.insertBefore(this._marker, element);
    const parsedExpression = MVC.Expressions.parse(expression);
    const watcher = this.watchBoolean(parsedExpression, value => {
      if (value !== this.status) {
        if (value) {
          this._parentNode.insertBefore(element, this._marker.nextSibling);
          this._nextDirective = this.chain(this.model, this.node);
        } else {
          this._remove();
        }
      }
    }, this);
    if (watcher.value) {
      this._nextDirective = this.chain(this.model, this.node);
    } else {
      try {
        this._parentNode.removeChild(element);
      } catch (e) {}
    }
  }

  public get status(): boolean {
    return null !== this._nextDirective;
  }

  private _remove(): void {
    if (this._nextDirective) {
      this._nextDirective.destroy();
      this._nextDirective = null;
      try {
        this._parentNode.removeChild(this.node);
      } catch (e) {}
    }
  }

  public _cleanup(): void {
    this._remove();
    try {
      this._parentNode.removeChild(this._marker);
    } catch (e) {}
  }

  public destroy(): void {
    super.destroy();
    this._cleanup();
  }
}
