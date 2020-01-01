/// <reference path="../Directives.ts" />


class RootDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'root';

  public static matches(node: Node): boolean {
    return true;
  }

  public constructor(chain: DirectiveChainer, model: Model, node: Node) {
    super(chain, model, node);
    var child = node.firstChild;
    while (child) {
      const nextSibling = child.nextSibling;
      this.next(model, child);
      child = nextSibling;
    }
  }
}
