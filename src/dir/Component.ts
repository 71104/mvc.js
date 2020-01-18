/// <reference path="../Directives.ts" />
/// <reference path="../Components.ts" />


class ComponentDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'component';

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType &&
        MVC.Components.isValid(node.nodeName.toLowerCase());
  }

  public constructor(
      chain: DirectiveChainer,
      model: Model,
      node: Node,
      controllers: ControllerFrame)
  {
    super(chain, model, node, controllers);
    const canonicalName = node.nodeName.toLowerCase();
    const fragment = MVC.Components.lookupTemplate(canonicalName);
    this.createMarker(canonicalName);
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
