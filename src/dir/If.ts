/// <reference path="../expr/Parser.ts" />
/// <reference path="../expr/Watchers.ts" />


class IfDirective implements DirectiveInterface {
  public static readonly NAME = 'if';

  private readonly _marker: Comment;
  private readonly _watcher: BooleanWatcher;
  private _nextDirective: DirectiveInterface | null = null;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-if');
  }

  public constructor(
      public readonly next: DirectiveChainer,
      private readonly _model: Model,
      public readonly node: Node)
  {
    const element = <Element>node;
    const expression = String(element.getAttribute('mvc-if'));
    const parentNode = element.parentNode;
    if (!parentNode) {
      throw new Error(`element with mvc-if=${JSON.stringify(expression)} is an orphan`);
    }
    this._marker = document.createComment(`mvc-if: ${JSON.stringify(expression)}`);
    parentNode.insertBefore(element, this._marker);
    const parsedExpression = MVC.Expressions.parse(expression);
    this._watcher = this._model.watchBoolean(parsedExpression, ((value: boolean) => {
      if (value !== this.status) {
        if (value) {
          parentNode.insertBefore(this._marker.nextSibling!, element);
          this._nextDirective = this.next(this._model, this.node);
        } else {
          this._nextDirective!.destroy();
          this._nextDirective = null;
          parentNode.removeChild(element);
        }
      }
    }).bind(this));
    if (this._watcher.value) {
      this._nextDirective = this.next(this._model, this.node);
    } else {
      parentNode.removeChild(element);
    }
  }

  public get status(): boolean {
    return null !== this._nextDirective;
  }

  public destroy(): void {
    if (null !== this._nextDirective) {
      this._nextDirective.destroy();
      this._nextDirective = null;
      this._watcher.destroy();
    }
  }
}
