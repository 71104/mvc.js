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
  private _replicas: Replica[] = [];
  private readonly _watcher: CollectionWatcher;

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
      this._watcher = this._model.watchCollectionImmediate(parsedExpression, collection => {
        this._destroyReplicas();
        const nextSibling = this._marker.nextSibling;
        this._replicas = collection.map((element, index) => {
          const node = this.node.cloneNode(true);
          this._parentNode.insertBefore(node, nextSibling);
          const childScope: Dictionary = {};
          childScope[parsedExpression.elementName] = element;
          childScope['$index'] = index;
          const nextDirective = this.next(this._model.extend(childScope), node);
          return new Replica(node, nextDirective);
        }, this);
      }, this);
    } else {
      // TODO
    }
  }

  private _destroyReplicas(): void {
    this._replicas.forEach(replica => {
      replica.nextDirective.destroy();
      this._parentNode.removeChild(replica.node);
    }, this);
    this._replicas.length = 0;
  }

  public destroy(): void {
    this._watcher.destroy();
    this._destroyReplicas();
  }
}
