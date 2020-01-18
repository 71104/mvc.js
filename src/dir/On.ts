/// <reference path="../Directives.ts" />


class ElementEventHandler {
  public constructor(
      public readonly name: string,
      public readonly handler: EventListener) {}
}


class OnDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'on';

  private readonly _element: Element;
  private readonly _handlers: ElementEventHandler[];

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType &&
        Array.from((<Element>node).attributes).some(
            ({name}) => name.startsWith('mvc-on-'));
  }

  public constructor(
      chain: DirectiveChainer,
      model: Model,
      node: Node,
      controllers: ControllerFrame)
  {
    super(chain, model, node, controllers);
    this._element = <Element>this.node;
    const attributes = Array.from(this._element.attributes).filter(
        ({name}) => name.startsWith('mvc-on-'));
    this._handlers = attributes.map(attribute => {
      const name = attribute.name.replace(/^mvc-on-/, '');
      const handler = this.controllers.lookup(attribute.value);
      return {name, handler};
    }, this).filter(({handler}) => !!handler).map(({name, handler}) => {
      this._element.addEventListener(name, handler!, false);
      return new ElementEventHandler(name, handler!);
    }, this);
    this.next(this.model, this.node, this.controllers);
  }

  public destroy(): void {
    this._handlers.forEach(({name, handler}) => {
      this._element.removeEventListener(name, handler, false);
    }, this);
    this._handlers.length = 0;
    super.destroy();
  }
}
