/// <reference path="../Model.ts" />


namespace MVC {
export namespace Expressions {


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

  public constructor(
      public readonly model: Model,
      public readonly expression: NodeInterface,
      immediate: boolean,
      private readonly _handler: ValueHandler<ValueType>,
      scope: any = null)
  {
    this.compiledExpression = this._compile(expression);
    this._pathHandlers = expression.getFreePaths().map(freePath => {
      // TODO: what if the following binding changes?
      const path = freePath.bind(this.model);
      this.model.on(path, this._handler, scope);
      return new PathHandler(path, this._handler);
    });
    const value = this.value;
    if (immediate) {
      this._handler.call(scope, value, value);
    }
  }

  protected abstract _compile(expression: NodeInterface): CompiledExpression<ValueType>;

  public get value(): ValueType {
    return this.compiledExpression.call(this.model.proxy);
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
