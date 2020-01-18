/// <reference path="../Directives.ts" />
/// <reference path="../Controllers.ts" />


class ControllerDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'controller';

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-controller');
  }

  public constructor(
      chain: DirectiveChainer,
      model: Model,
      node: Node,
      controllers: ControllerFrame)
  {
    super(chain, model, node, controllers.push(function () {
      const name = (<Element>node).getAttribute('mvc-controller');
      if (name) {
        const ControllerConstructor = MVC.Controllers.lookup(name);
        return new ControllerConstructor(model.proxy);
      } else {
        throw new Error('invalid value for attribute mvc-controller (must be a controller name)');
      }
    }()));
    this.next(this.model, this.node, this.controllers);
  }
}
