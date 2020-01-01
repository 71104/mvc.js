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

  private _registerWatcher<WatcherType extends WatcherInterface>(watcher: WatcherType): WatcherType {
    this._watchers.push(watcher);
    return watcher;
  }

  protected watch(expression: NodeInterface, handler: ValueHandler<any>, scope: any = null): GenericWatcher {
    return this._registerWatcher(new MVC.Expressions.GenericWatcher(this.model, expression, false, handler, scope));
  }

  protected watchBoolean(expression: NodeInterface, handler: ValueHandler<boolean>, scope: any = null): BooleanWatcher {
    return this._registerWatcher(new MVC.Expressions.BooleanWatcher(this.model, expression, false, handler, scope));
  }

  protected watchInteger(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): IntegerWatcher {
    return this._registerWatcher(new MVC.Expressions.IntegerWatcher(this.model, expression, false, handler, scope));
  }

  protected watchNumber(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): NumberWatcher {
    return this._registerWatcher(new MVC.Expressions.NumberWatcher(this.model, expression, false, handler, scope));
  }

  protected watchString(expression: NodeInterface, handler: ValueHandler<string>, scope: any = null): StringWatcher {
    return this._registerWatcher(new MVC.Expressions.StringWatcher(this.model, expression, false, handler, scope));
  }

  protected watchCollection(expression: NodeInterface, handler: ValueHandler<any[]>, scope: any = null): CollectionWatcher {
    return this._registerWatcher(new MVC.Expressions.CollectionWatcher(this.model, expression, false, handler, scope));
  }

  protected watchDictionary(expression: NodeInterface, handler: ValueHandler<Dictionary>, scope: any = null): DictionaryWatcher {
    return this._registerWatcher(new MVC.Expressions.DictionaryWatcher(this.model, expression, false, handler, scope));
  }

  protected watchImmediate(expression: NodeInterface, handler: ValueHandler<any>, scope: any = null): GenericWatcher {
    return this._registerWatcher(new MVC.Expressions.GenericWatcher(this.model, expression, true, handler, scope));
  }

  protected watchBooleanImmediate(expression: NodeInterface, handler: ValueHandler<boolean>, scope: any = null): BooleanWatcher {
    return this._registerWatcher(new MVC.Expressions.BooleanWatcher(this.model, expression, true, handler, scope));
  }

  protected watchIntegerImmediate(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): IntegerWatcher {
    return this._registerWatcher(new MVC.Expressions.IntegerWatcher(this.model, expression, true, handler, scope));
  }

  protected watchNumberImmediate(expression: NodeInterface, handler: ValueHandler<number>, scope: any = null): NumberWatcher {
    return this._registerWatcher(new MVC.Expressions.NumberWatcher(this.model, expression, true, handler, scope));
  }

  protected watchStringImmediate(expression: NodeInterface, handler: ValueHandler<string>, scope: any = null): StringWatcher {
    return this._registerWatcher(new MVC.Expressions.StringWatcher(this.model, expression, true, handler, scope));
  }

  protected watchCollectionImmediate(expression: NodeInterface, handler: ValueHandler<any[]>, scope: any = null): CollectionWatcher {
    return this._registerWatcher(new MVC.Expressions.CollectionWatcher(this.model, expression, true, handler, scope));
  }

  protected watchDictionaryImmediate(expression: NodeInterface, handler: ValueHandler<Dictionary>, scope: any = null): DictionaryWatcher {
    return this._registerWatcher(new MVC.Expressions.DictionaryWatcher(this.model, expression, true, handler, scope));
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
