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
  private _nextDirective: DirectiveInterface | null;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType &&
        Array.from((<Element>node).attributes).some(
            ({name}) => name.startsWith('mvc-on-'));
  }

  public constructor(next: DirectiveChainer, model: Model, node: Node) {
    super(next, model, node);
    this._element = <Element>this.node;
    const attributes = Array.from(this._element.attributes).filter(
        ({name}) => name.startsWith('mvc-on-'));
    this._handlers = attributes.map(attribute => {
      const key = attribute.name.replace(/^mvc-on-/, '');
      return new ElementEventHandler(key, () => {
        // TODO: handle event, call into controller
      });
    }, this);
    this._nextDirective = this.next(model, node);
  }

  public destroy(): void {
    super.destroy();
    this._handlers.forEach(({name, handler}) => {
      this._element.removeEventListener(name, handler, false);
    }, this);
    this._handlers.length = 0;
    if (this._nextDirective) {
      this._nextDirective.destroy();
      this._nextDirective = null;
    }
  }
}
