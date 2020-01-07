/// <reference path="../Directives.ts" />
/// <reference path="../Controllers.ts" />


class ControllerDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'controller';

  private readonly _controller: ControllerInterface;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-controller');
  }

  private _lookupController(): ControllerConstructor {
    const name = (<Element>this.node).getAttribute('mvc-controller');
    if (name) {
      return MVC.Controllers.lookup(name);
    } else {
      throw new Error('invalid value for attribute mvc-controller (must be a controller name)');
    }
  }

  public constructor(chain: DirectiveChainer, model: Model, node: Node) {
    super(chain, model, node);
    const ControllerConstructor = this._lookupController();
    this._controller = new ControllerConstructor(model.proxy);
    this.next(model, node);
  }

  public destroy(): void {
    this._controller.$destroy?.();
    super.destroy();
  }
}
