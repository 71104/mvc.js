/// <reference path="../Directives.ts" />
/// <reference path="../Templates.ts" />


class IncludeDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'include';

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && 'mvc-include' === node.nodeName.toLowerCase();
  }

  public constructor(chain: DirectiveChainer, model: Model, node: Node) {
    super(chain, model, node);
    const element = <Element>node;
    if (!element.hasAttribute('template')) {
      throw new Error('mvc-include requires the "template" attribute');
    }
    const templateName = element.getAttribute('template');
    const parentNode = this.node.parentNode;
    if (!parentNode) {
      throw new Error(`<mvc-include template=${JSON.stringify(templateName)}> is an orphan`);
    }
    const fragment = MVC.Templates.lookup(templateName!);
    for (var child = fragment.firstChild; child; child = child.nextSibling) {
      const clone = child.cloneNode(true);
      parentNode.insertBefore(clone, this.node);
      this.next(this.model, clone);
    }
    parentNode.removeChild(this.node);
  }
}
