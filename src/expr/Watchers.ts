/// <reference path="../Model.ts" />


namespace MVC {
export namespace Expressions {


class PathHandler {
  public constructor(
      public readonly path: string[],
      public readonly handler: EventHandler) {}
}


export type ValueHandler<ValueType> = (value: ValueType) => void;


abstract class Watcher<ValueType> {
  public readonly compiledExpression: Function;
  private readonly _pathHandlers: PathHandler[];

  public constructor(
      public readonly model: Model,
      public readonly expression: NodeInterface,
      public readonly handler: ValueHandler<ValueType>)
  {
    this.compiledExpression = this._compile(expression);
    this._internalHandler = this._internalHandler.bind(this);
    this._pathHandlers = expression.getFreePaths().map(freePath => {
      // TODO: what if the following binding changes?
      const path = freePath.bind(this.model);
      this.model.on(path, this._internalHandler);
      return new PathHandler(path, this._internalHandler);
    });
  }

  private _internalHandler(value: ValueType): void {
    this.handler(value);
  }

  protected abstract _compile(expression: NodeInterface): Function;

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
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafe(expression);
  }
}


export class BooleanWatcher extends Watcher<boolean> {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeBoolean(expression);
  }
}


export class IntegerWatcher extends Watcher<number> {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeInteger(expression);
  }
}


export class NumberWatcher extends Watcher<number> {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeNumber(expression);
  }
}


export class StringWatcher extends Watcher<string> {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeString(expression);
  }
}


}  // namespace Expressions
}  // namespace MVC


type GenericWatcher = MVC.Expressions.GenericWatcher;
type BooleanWatcher = MVC.Expressions.BooleanWatcher;
type IntegerWatcher = MVC.Expressions.IntegerWatcher;
type NumberWatcher = MVC.Expressions.NumberWatcher;
type StringWatcher = MVC.Expressions.StringWatcher;
