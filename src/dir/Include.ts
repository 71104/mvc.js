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
    const fragment = MVC.Templates.lookup(templateName!);
    this.createMarker(`mvc-template: ${JSON.stringify(templateName)}`);
    this.parentNode.removeChild(this.node);
    const nextSibling = this.marker!.nextSibling;
    for (var child = fragment.firstChild; child; child = child.nextSibling) {
      const clone = child.cloneNode(true);
      if (Node.ELEMENT_NODE === clone.nodeType) {
        this._transclude(<Element>clone);
      }
      this.insertBefore(clone, nextSibling);
    }
  }

  private _transclude(template: Element): void {
    const transclusionPoints = Array.from(template.querySelectorAll('mvc-transclude'));
    transclusionPoints.forEach(element => {
      const parentNode = element.parentNode;
      for (var child = this.node.firstChild; child; child = child.nextSibling) {
        parentNode!.insertBefore(child.cloneNode(true), element);
      }
      parentNode!.removeChild(element);
    }, this);
  }
}
