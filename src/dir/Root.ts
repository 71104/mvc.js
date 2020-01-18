/// <reference path="../Directives.ts" />


class RootDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'root';

  public static matches(node: Node): boolean {
    return true;
  }

  public constructor(
      chain: DirectiveChainer,
      model: Model,
      node: Node,
      controllers: ControllerFrame)
  {
    super(chain, model, node, controllers);
    var child = node.firstChild;
    while (child) {
      const nextSibling = child.nextSibling;
      this.next(model, child, controllers);
      child = nextSibling;
    }
    if (Node.ELEMENT_NODE === node.nodeType) {
      const element = <Element>node;
      element.removeAttribute('mvc-cloak');
      if (element.hasAttribute('class')) {
        element.className = element.className
            .split(' ')
            .filter(name => 'mvc-cloak' !== name)
            .join(' ');
      }
    }
  }
}
