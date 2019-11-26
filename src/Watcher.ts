/// <reference path="EventEmitter.ts" />
/// <reference path="Model.ts" />


class PathHandler {
  public constructor(
      public readonly path: string[],
      public readonly handler: EventHandler) {}
}


type CompileFunction = (expression: NodeInterface) => Function;


abstract class Watcher {
  public readonly model: Model;
  public readonly expression: NodeInterface;
  public readonly compiledExpression: Function;
  public readonly handler: EventHandler;
  private readonly _pathHandlers: PathHandler[];

  public constructor(model: Model, expression: NodeInterface, handler: EventHandler) {
    this.model = model;
    this.expression = expression;
    this.compiledExpression = this._compile(expression);
    this.handler = handler;
    this._pathHandlers = expression.getFreePaths().map(freePath => {
      // TODO: what if the following binding changes?
      const path = freePath.bind(this.model);
      this.model.on(path, handler);
      return new PathHandler(path, handler);
    });
  }

  protected abstract _compile(expression: NodeInterface): Function;

  public destroy(): void {
    this._pathHandlers.forEach(({path, handler}) => {
      this.model.off(path, handler);
    }, this);
    this._pathHandlers.length = 0;
  }
}


class GenericWatcher extends Watcher {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafe(expression);
  }

  public get value(): any {
    return this.compiledExpression.call(this.model.proxy);
  }
}


class BooleanWatcher extends Watcher {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeBoolean(expression);
  }

  public get value(): boolean {
    return this.compiledExpression.call(this.model.proxy);
  }
}


class IntegerWatcher extends Watcher {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeInteger(expression);
  }

  public get value(): number {
    return this.compiledExpression.call(this.model.proxy);
  }
}


class NumberWatcher extends Watcher {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeNumber(expression);
  }

  public get value(): number {
    return this.compiledExpression.call(this.model.proxy);
  }
}


class StringWatcher extends Watcher {
  protected _compile(expression: NodeInterface): Function {
    return MVC.Expressions.compileSafeString(expression);
  }

  public get value(): string {
    return this.compiledExpression.call(this.model.proxy);
  }
}
