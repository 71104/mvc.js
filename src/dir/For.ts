/// <reference path="../Model.ts" />
/// <reference path="../expr/AST.ts" />


class Replica {
  public constructor(
      public readonly node: Node,
      public readonly nextDirective: DirectiveInterface) {}
}


class ForDirective implements DirectiveInterface {
  public static readonly NAME: string = 'for';

  private readonly _parentNode: Node;
  private readonly _marker: Node;
  private readonly _replicas: Replica[];

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-for');
  }

  public constructor(
      public readonly next: DirectiveChainer,
      private readonly _model: Model,
      public readonly node: Node)
  {
    const element = <Element>this.node;
    const expression = String(element.getAttribute('mvc-for'));
    if (!this.node.parentNode) {
      throw new Error(`element with mvc-for=${JSON.stringify(expression)} is an orphan`);
    } else {
      this._parentNode = this.node.parentNode;
    }
    this._marker = document.createComment(`mvc-for: ${JSON.stringify(expression)}`);
    this._parentNode.insertBefore(this._marker, element);
    this._parentNode.removeChild(element);
    const parsedExpression = MVC.Expressions.parse(expression);
    if (parsedExpression instanceof CollectionIterationNode) {
      const compiledExpression = MVC.Expressions.compileSafeCollection(parsedExpression);
      this._replicas = compiledExpression.call(this._model).map((element: any, index: number) => {
        const node = this.node.cloneNode(true);
        const childScope: Dictionary = {};
        childScope[parsedExpression.elementName] = element;
        childScope['$index'] = index;
        return this._model.frameMany(childScope, (() => {
          this._parentNode.insertBefore(node, this._marker.nextSibling);
          const nextDirective = this.next(this._model, node);
          return new Replica(node, nextDirective);
        }).bind(this));
      }, this);
    } else {
      // TODO
    }
  }

  public destroy(): void {
    this._replicas.forEach(replica => {
      replica.nextDirective.destroy();
      this._parentNode.removeChild(replica.node);
    }, this);
    this._replicas.length = 0;
  }
}
