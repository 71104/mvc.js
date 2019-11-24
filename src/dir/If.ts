class IfDirective implements DirectiveInterface {
  public static readonly NAME = 'if';

  private readonly _marker: Comment;

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
    this._marker = document.createComment(`mvc-if: ${JSON.stringify(expression)}`);
    // TODO
  }

  public destroy(): void {
    // TODO
  }
}
