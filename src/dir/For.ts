/// <reference path="../Common.ts" />
/// <reference path="../Directives.ts" />
/// <reference path="../expr/Parser.ts" />


class Replica {
  public constructor(
      public readonly node: Node,
      public readonly nextDirective: DirectiveInterface) {}
}


class ForDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'for';

  private readonly _parentNode: Node;
  private readonly _marker: Node;
  private _replicas: Replica[] = [];

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-for');
  }

  public constructor(next: DirectiveChainer, model: Model, node: Node) {
    super(next, model, node);
    const element = <Element>this.node;
    const expression = element.getAttribute('mvc-for');
    if (!expression) {
      throw new Error('invalid value for mvc-for attribute (must be an iteration expression)');
    }
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
      this.watchCollectionImmediate(parsedExpression, collection => {
        this._destroyReplicas();
        const nextSibling = this._marker.nextSibling;
        this._replicas = collection.map((element, index) => {
          const node = this.node.cloneNode(true);
          this._parentNode.insertBefore(node, nextSibling);
          const childScope: Dictionary = {};
          childScope[parsedExpression.elementName] = element;
          childScope['$index'] = index;
          childScope['$length'] = collection.length;
          childScope['$first'] = !index;
          childScope['$middle'] = index > 0 && index < collection.length;
          childScope['$last'] = index > collection.length - 1;
          childScope['$even'] = !(index % 2);
          childScope['$odd'] = !!(index % 2);
          const nextDirective = this.next(this.model.extend(childScope), node);
          return new Replica(node, nextDirective);
        }, this);
      }, this);
    } else if (parsedExpression instanceof DictionaryIterationNode) {
      this.watchDictionaryImmediate(parsedExpression, dictionary => {
        this._destroyReplicas();
        const nextSibling = this._marker.nextSibling;
        for (var key in dictionary) {
          if (!dictionary.hasOwnProperty || dictionary.hasOwnProperty(key)) {
            const node = this.node.cloneNode(true);
            this._parentNode.insertBefore(node, nextSibling);
            const childScope: Dictionary = {};
            childScope[parsedExpression.keyName] = key;
            childScope[parsedExpression.valueName] = dictionary[key];
            const nextDirective = this.next(this.model.extend(childScope), node);
            this._replicas.push(new Replica(node, nextDirective));
          }
        }
      }, this);
    } else {
      throw new MVC.InternalError(`invalid AST node for mvc-for=${JSON.stringify(expression)}`);
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
    super.destroy();
    this._destroyReplicas();
  }
}
