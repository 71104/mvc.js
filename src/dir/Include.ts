/// <reference path="../Directives.ts" />
/// <reference path="../Templates.ts" />


class IncludeDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'include';

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && 'mvc-include' === node.nodeName.toLowerCase();
  }

  public constructor(next: DirectiveChainer, model: Model, node: Node) {
    super(next, model, node);
    const element = <Element>node;
    if (!element.hasAttribute('template')) {
      throw new Error('mvc-include requires the "template" attribute');
    }
    // TODO
  }

  public destroy(): void {
    super.destroy();
    // TODO
  }
}
