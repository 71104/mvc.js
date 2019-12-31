/// <reference path="../Common.ts" />
/// <reference path="../Model.ts" />


namespace MVC {
export namespace Expressions {


class WatchNode {
  private _path: string[];
  private readonly _children: WatchNode[];

  public constructor(
      public readonly model: Model,
      public readonly freePath: FreePath,
      private readonly _handler: () => void,
      private readonly _scope: any)
  {
    this._path = this.freePath.bind(this.model);
    this.model.on(this._path, this._trigger, this);
    this._children = this.freePath.getDependentPaths().map(
      path => new WatchNode(this.model, path, () => {
        this.model.off(this._path, this._trigger);
        this._path = this.freePath.bind(this.model);
        this.model.on(this._path, this._trigger, this);
      }, this), this);
  }

  private _trigger(): void {
    this._handler.call(this._scope);
  }

  public get path(): string[] {
    return this._path;
  }

  public destroy(): void {
    this._children.forEach(child => {
      child.destroy();
    });
    this._children.length = 0;
  }
}


class WatchTree {
  private readonly _roots: WatchNode[];

  public constructor(
      public readonly model: Model,
      public readonly expression: NodeInterface,
      private readonly _handler: () => void,
      private readonly _scope: any)
  {
    this._roots = expression.getFreePaths().map(path => new WatchNode(model, path, _handler, _scope));
  }

  public destroy(): void {
    this._roots.forEach(child => {
      child.destroy();
    });
    this._roots.length = 0;
  }
}


export type ValueHandler<ValueType> = (newValue: ValueType, oldValue: ValueType) => void;


export interface WatcherInterface {
  trigger(): void;
  triggerSection<ReturnValue>(section: () => ReturnValue, scope: any): ReturnValue;
  destroy(): void;
}


abstract class Watcher<ValueType> implements WatcherInterface {
  public readonly compiledExpression: CompiledExpression<ValueType>;
  private _watchTree: WatchTree;
  private _lastValue: ValueType;
  private _blocked: boolean = false;
  private _triggered: boolean = false;

  public constructor(
      public readonly model: Model,
      public readonly expression: NodeInterface,
      immediate: boolean,
      private readonly _handler: ValueHandler<ValueType>,
      private readonly _scope: any = null)
  {
    this.compiledExpression = this._compile(this.expression);
    this._watchTree = new WatchTree(this.model, this.expression, this.trigger, this);
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
    if (this._blocked) {
      this._triggered = true;
    } else {
      const lastValue = this._lastValue;
      this._lastValue = value;
      try {
        this._handler.call(this._scope, value, lastValue);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public trigger(): void {
    this._triggerInternal(this.value);
  }

  public triggerSection<ReturnValue>(section: () => ReturnValue, scope: any = null): ReturnValue {
    this._blocked = true;
    this._triggered = false;
    try {
      return section.call(scope);
    } finally {
      this._blocked = false;
      if (this._triggered) {
        this.trigger();
      }
    }
  }

  public destroy(): void {
    this._watchTree.destroy();
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


export class DictionaryWatcher extends Watcher<Dictionary> {
  protected _compile(expression: NodeInterface): CompiledExpression<Dictionary> {
    return MVC.Expressions.compileSafeDictionary(expression);
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
type DictionaryWatcher = MVC.Expressions.DictionaryWatcher;
