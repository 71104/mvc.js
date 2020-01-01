/// <reference path="../Directives.ts" />
/// <reference path="../Controllers.ts" />


class ControllerDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'controller';

  private _controller: ControllerInterface | null;

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-controller');
  }

  private _lookupController(): ControllerConstructor | null {
    const name = (<Element>this.node).getAttribute('mvc-controller');
    try {
      if (name) {
        return MVC.Controllers.lookup(name);
      } else {
        throw new Error('invalid value for attribute mvc-controller (must be a controller name)');
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public constructor(chain: DirectiveChainer, model: Model, node: Node) {
    super(chain, model, node);
    const ControllerConstructor = this._lookupController();
    if (ControllerConstructor) {
      this._controller = new ControllerConstructor(model.proxy);
    } else {
      this._controller = null;
    }
    this.next(model, node);
  }

  public destroy(): void {
    if (this._controller) {
      this._controller.destroy?.();
      this._controller = null;
    }
    super.destroy();
  }
}
