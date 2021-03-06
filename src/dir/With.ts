/// <reference path="../Common.ts" />
/// <reference path="../Directives.ts" />
/// <reference path="../expr/Parser.ts" />


class WithDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'with';

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType &&
        Array.from((<Element>node).attributes).some(
            ({name}) => name.startsWith('mvc-with-'));
  }

  public constructor(
      chain: DirectiveChainer,
      model: Model,
      node: Node,
      controllers: ControllerFrame)
  {
    super(chain, model, node, controllers);
    const attributes = Array.from((<Element>this.node).attributes).filter(
        attribute => attribute.name.startsWith('mvc-with-'));
    const childModel = this.model.extend();
    const childScope = <Dictionary>(childModel.proxy);
    attributes.forEach(attribute => {
      const key = attribute.name.replace(/^mvc-with-/, '');
      const expression = MVC.Expressions.parse(attribute.value);
      this.watchImmediate(expression, value => {
        childScope[key] = value;
      });
    }, this);
    this.next(childModel, this.node, this.controllers);
  }
}
