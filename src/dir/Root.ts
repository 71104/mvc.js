/// <reference path="../Directives.ts" />


class RootDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'root';

  private readonly _children: DirectiveInterface[] = [];

  public static matches(node: Node): boolean {
    return true;
  }

  public constructor(next: DirectiveChainer, model: Model, node: Node) {
    super(next, model, node);
    var child = node.firstChild;
    while (child) {
      const nextSibling = child.nextSibling;
      this._children.push(this.next(model, child));
      child = nextSibling;
    }
  }

  public destroy(): void {
    super.destroy();
    this._children.forEach(childDirective => {
      childDirective.destroy();
    });
    this._children.length = 0;
  }
}
