/// <reference path="../Model.ts" />
/// <reference path="../Trie.ts" />


namespace MVC {
export namespace Expressions {


class WatchNode {
  private readonly _children: Trie<WatchNode>;

  public constructor(
      private readonly _model: Model,
      freePaths: FreePath[],
      private readonly _handler: () => void,
      private readonly _scope: any)
  {
    const paths = new Trie<FreePath[]>();
    freePaths.forEach(freePath => {
      const path = freePath.bind(this._model);
      const dependentPaths = paths.lookup(path) || [];
      paths.insert(path, dependentPaths.concat(freePath.getDependentPaths()));
    }, this);
    this._children = paths.map((path, dependentPaths) => {
      return (function childHandler() {
        const newNode = new WatchNode(this._model, dependentPaths, childHandler, this);
        const oldNode = this._children.insert(path, newNode);
        if (oldNode) {
          oldNode.destroy();
        }
        return newNode;
      }());
    }, this);
  }

  public destroy(): void {
    this._children.forEach((path, child) => {
      child.destroy();
    });
    this._children.clear();
  }
}


class PathHandler {
  public constructor(
      public readonly path: string[],
      public readonly handler: EventHandler) {}
}


export type ValueHandler<ValueType> = (newValue: ValueType, oldValue: ValueType) => void;


export interface WatcherInterface {
  destroy(): void;
}


abstract class Watcher<ValueType> implements WatcherInterface {
  public readonly compiledExpression: CompiledExpression<ValueType>;
  private readonly _pathHandlers: PathHandler[];
  private _lastValue: ValueType;

  public constructor(
      public readonly model: Model,
      public readonly expression: NodeInterface,
      immediate: boolean,
      private readonly _handler: ValueHandler<ValueType>,
      private readonly _scope: any = null)
  {
    this.compiledExpression = this._compile(expression);
    this._pathHandlers = expression.getFreePaths().map(freePath => {
      // TODO: what if the following binding changes?
      const path = freePath.bind(this.model);
      this.model.on(path, this.trigger, this);
      return new PathHandler(path, this.trigger);
    });
    this._lastValue = this.value;
    if (immediate) {
      this._triggerInternal(this._lastValue);
    }
  }

  protected abstract _compile(expression: NodeInterface): CompiledExpression<ValueType>;

  public get value(): ValueType {
    return this.compiledExpression.call(this.model.proxy);
  }

  private _triggerInternal(value: ValueType): void {
    this._handler.call(this._scope, value, this._lastValue);
    this._lastValue = value;
  }

  public trigger(): void {
    this._triggerInternal(this.value);
  }

  public destroy(): void {
    this._pathHandlers.forEach(({path, handler}) => {
      this.model.off(path, handler);
    }, this);
    this._pathHandlers.length = 0;
  }
}


export class GenericWatcher extends Watcher<any> {
  protected _compile(expression: NodeInterface): CompiledExpression<any> {
    return MVC.Expressions.compileSafe(expression);
  }
}


export class BooleanWatcher extends Watcher<boolean> {
  protected _compile(expression: NodeInterface): CompiledExpression<boolean> {
    return MVC.Expressions.compileSafeBoolean(expression);
  }
}


export class IntegerWatcher extends Watcher<number> {
  protected _compile(expression: NodeInterface): CompiledExpression<number> {
    return MVC.Expressions.compileSafeInteger(expression);
  }
}


export class NumberWatcher extends Watcher<number> {
  protected _compile(expression: NodeInterface): CompiledExpression<number> {
    return MVC.Expressions.compileSafeNumber(expression);
  }
}


export class StringWatcher extends Watcher<string> {
  protected _compile(expression: NodeInterface): CompiledExpression<string> {
    return MVC.Expressions.compileSafeString(expression);
  }
}


export class CollectionWatcher extends Watcher<any[]> {
  protected _compile(expression: NodeInterface): CompiledExpression<any[]> {
    return MVC.Expressions.compileSafeCollection(expression);
  }
}


}  // namespace Expressions
}  // namespace MVC


type ValueHandler<ValueType> = MVC.Expressions.ValueHandler<ValueType>;
type WatcherInterface = MVC.Expressions.WatcherInterface;
type GenericWatcher = MVC.Expressions.GenericWatcher;
type BooleanWatcher = MVC.Expressions.BooleanWatcher;
type IntegerWatcher = MVC.Expressions.IntegerWatcher;
type NumberWatcher = MVC.Expressions.NumberWatcher;
type StringWatcher = MVC.Expressions.StringWatcher;
type CollectionWatcher = MVC.Expressions.CollectionWatcher;
