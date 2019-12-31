/// <reference path="Common.ts" />
/// <reference path="EventEmitter.ts" />
/// <reference path="Model.ts" />
/// <reference path="expr/AST.ts" />
/// <reference path="expr/Watchers.ts" />


type DirectiveInterface = MVC.Directives.DirectiveInterface;
type BaseDirective = MVC.Directives.BaseDirective;
type DirectiveChainer = MVC.Directives.DirectiveChainer;
type DirectiveConstructorInterface = MVC.Directives.DirectiveConstructorInterface;


namespace MVC {
export namespace Directives {


export interface DirectiveInterface {
  destroy(): void;
}


export type DirectiveChainer = (model: Model, node: Node) => DirectiveInterface;


export interface DirectiveConstructorInterface {
  NAME: string;
  matches(node: Node): boolean;
  new (next: DirectiveChainer, model: Model, node: Node): DirectiveInterface;
}


export class BaseDirective implements DirectiveInterface {
  private readonly _watchers: WatcherInterface[] = [];

  protected constructor(
      public readonly next: DirectiveChainer,
      public readonly model: Model,
      public readonly node: Node) {}

  private _register<WatcherType extends WatcherInterface>(watcher: WatcherType): WatcherType {
    this._watchers.push(watcher);
    return watcher;
  }

  public watch(expression: NodeInterface, handler: ValueHandler<any>, scope: any = null): GenericWatcher {
    return this._register(new MVC.Expressions.GenericWatcher(this.model, expression, false, handler, scope));
  }

  public watchBoolean(expression: NodeInterface, handler: ValueHandler<boolean>, scope: any = null): BooleanWatcher {
    return this._register(new MVC.Expressions.BooleanWatcher(this.model, expression, false, handler, scope));
  }

  public watchInteger(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): IntegerWatcher {
    return this._register(new MVC.Expressions.IntegerWatcher(this.model, expression, false, handler, scope));
  }

  public watchNumber(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): NumberWatcher {
    return this._register(new MVC.Expressions.NumberWatcher(this.model, expression, false, handler, scope));
  }

  public watchString(expression: NodeInterface, handler: ValueHandler<string>, scope: any = null): StringWatcher {
    return this._register(new MVC.Expressions.StringWatcher(this.model, expression, false, handler, scope));
  }

  public watchCollection(expression: NodeInterface, handler: ValueHandler<any[]>, scope: any = null): CollectionWatcher {
    return this._register(new MVC.Expressions.CollectionWatcher(this.model, expression, false, handler, scope));
  }

  public watchDictionary(expression: NodeInterface, handler: ValueHandler<Dictionary>, scope: any = null): DictionaryWatcher {
    return this._register(new MVC.Expressions.DictionaryWatcher(this.model, expression, false, handler, scope));
  }

  public watchImmediate(expression: NodeInterface, handler: ValueHandler<any>, scope: any = null): GenericWatcher {
    return this._register(new MVC.Expressions.GenericWatcher(this.model, expression, true, handler, scope));
  }

  public watchBooleanImmediate(expression: NodeInterface, handler: ValueHandler<boolean>, scope: any = null): BooleanWatcher {
    return this._register(new MVC.Expressions.BooleanWatcher(this.model, expression, true, handler, scope));
  }

  public watchIntegerImmediate(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): IntegerWatcher {
    return this._register(new MVC.Expressions.IntegerWatcher(this.model, expression, true, handler, scope));
  }

  public watchNumberImmediate(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): NumberWatcher {
    return this._register(new MVC.Expressions.NumberWatcher(this.model, expression, true, handler, scope));
  }

  public watchStringImmediate(expression: NodeInterface, handler: ValueHandler<string>, scope: any = null): StringWatcher {
    return this._register(new MVC.Expressions.StringWatcher(this.model, expression, true, handler, scope));
  }

  public watchCollectionImmediate(expression: NodeInterface, handler: ValueHandler<any[]>, scope: any = null): CollectionWatcher {
    return this._register(new MVC.Expressions.CollectionWatcher(this.model, expression, true, handler, scope));
  }

  public watchDictionaryImmediate(expression: NodeInterface, handler: ValueHandler<Dictionary>, scope: any = null): DictionaryWatcher {
    return this._register(new MVC.Expressions.DictionaryWatcher(this.model, expression, true, handler, scope));
  }

  public destroy(): void {
    this._watchers.forEach(watcher => {
      watcher.destroy();
    });
    this._watchers.length = 0;
  }
}


}  // namespace Directives
}  // namespace MVC
