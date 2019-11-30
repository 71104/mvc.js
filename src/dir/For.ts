/// <reference path="../Model.ts" />


class ForDirective implements DirectiveInterface {
  public static readonly NAME: string = 'for';

  private readonly _marker: Node;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-for');
  }

  public constructor(
      public readonly next: DirectiveChainer,
      private readonly _model: Model,
      public readonly node: Node) {
    const element = <Element>node;
    const expression = element.getAttribute('mvc-for');
    this._marker = document.createComment(`mvc-for: ${JSON.stringify(expression)}`);
    // TODO
  }

  public destroy(): void {
    // TODO
  }
}
