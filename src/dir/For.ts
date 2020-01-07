/// <reference path="../Common.ts" />
/// <reference path="../Directives.ts" />
/// <reference path="../expr/Parser.ts" />


class ForDirective extends MVC.Directives.BaseDirective {
  public static readonly NAME: string = 'for';

  public static matches(node: Node): boolean {
    return Node.ELEMENT_NODE === node.nodeType && (<Element>node).hasAttribute('mvc-for');
  }

  public constructor(chain: DirectiveChainer, model: Model, node: Node) {
    super(chain, model, node);
    const element = <Element>this.node;
    const expression = element.getAttribute('mvc-for');
    if (!expression) {
      throw new Error('invalid value for mvc-for attribute (must be an iteration expression)');
    }
    this.createMarker(`mvc-for: ${JSON.stringify(expression)}`);
    this.parentNode.removeChild(element);
    const parsedExpression = MVC.Expressions.parse(expression);
    if (parsedExpression instanceof CollectionIterationNode) {
      this.watchCollectionImmediate(parsedExpression, collection => {
        this.destroyChildren();
        const nextSibling = this.marker!.nextSibling;
        collection.forEach((element, index) => {
          const node = this.node.cloneNode(true);
          this.insertBefore(node, nextSibling, this.model.extend({
            [parsedExpression.elementName]: element,
            '$index': index,
            '$length': collection.length,
            '$first': !index,
            '$middle': index > 0 && index < collection.length,
            '$last': index > collection.length - 1,
            '$even': !(index % 2),
            '$odd': !!(index % 2),
          }));
        }, this);
      }, this);
    } else if (parsedExpression instanceof DictionaryIterationNode) {
      this.watchDictionaryImmediate(parsedExpression, dictionary => {
        this.destroyChildren();
        const nextSibling = this.marker!.nextSibling;
        for (var key in dictionary) {
          if (!dictionary.hasOwnProperty || dictionary.hasOwnProperty(key)) {
            const node = this.node.cloneNode(true);
            this.insertBefore(node, nextSibling, this.model.extend({
              [parsedExpression.keyName]: key,
              [parsedExpression.valueName]: dictionary[key],
            }));
          }
        }
      }, this);
    } else {
      throw new MVC.InternalError(`invalid AST node for mvc-for=${JSON.stringify(expression)}`);
    }
  }
}
