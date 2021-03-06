/// <reference path="Common.ts" />
/// <reference path="EventEmitter.ts" />
/// <reference path="Model.ts" />
/// <reference path="Controllers.ts" />
/// <reference path="expr/AST.ts" />
/// <reference path="expr/Watchers.ts" />


type DirectiveInterface = MVC.Directives.DirectiveInterface;
type BaseDirective = MVC.Directives.BaseDirective;
type DirectiveChainer = MVC.Directives.DirectiveChainer;
type DirectiveConstructorInterface = MVC.Directives.DirectiveConstructorInterface;


namespace MVC {
export namespace Directives {


export interface DirectiveInterface {
  readonly node: Node;
  destroy(): void;
}


export type DirectiveChainer = (
    model: Model,
    node: Node,
    controllers: ControllerFrame) => DirectiveInterface;


export interface DirectiveConstructorInterface {
  NAME: string;
  matches(node: Node): boolean;
  new (
    next: DirectiveChainer,
    model: Model,
    node: Node,
    controllers: ControllerFrame): DirectiveInterface;
}


export abstract class BaseDirective implements DirectiveInterface {
  private readonly _watchers: WatcherInterface[] = [];
  private readonly _children: DirectiveInterface[] = [];

  protected readonly parentNode: Node;
  private _marker: Comment | null = null;

  public constructor(
      protected readonly chain: DirectiveChainer,
      public readonly model: Model,
      public readonly node: Node,
      public readonly controllers: ControllerFrame)
  {
    if (node.parentNode) {
      this.parentNode = node.parentNode;
    } else {
      throw new Error(`cannot bind an orphan node`);
    }
  }

  protected get marker(): Comment | null {
    return this._marker;
  }

  protected createMarker(description: string): Comment {
    if (this._marker) {
      throw new Error(`duplicate marker: ${JSON.stringify(description)}`);
    }
    const marker = document.createComment(description);
    this._marker = marker;
    this.parentNode.insertBefore(this._marker, this.node);
    return marker;
  }

  protected next(model: Model, node: Node, controllers: ControllerFrame): DirectiveInterface {
    const child = this.chain(model, node, controllers);
    this._children.push(child);
    return child;
  }

  protected insertBefore(node: Node, reference: Node | null, model?: Model): DirectiveInterface {
    this.parentNode.insertBefore(node, reference);
    const child = this.chain(model || this.model, node, this.controllers);
    this._children.push(child);
    return child;
  }

  protected removeChild(child: DirectiveInterface): boolean {
    const index = this._children.indexOf(child);
    if (index >= 0) {
      this._children.splice(index, 1);
      const node = child.node;
      try {
        child.destroy();
      } catch (e) {
        console.error(e);
      }
      try {
        this.parentNode.removeChild(node);
      } catch (e) {}
      return true;
    } else {
      return false;
    }
  }

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

  protected destroyChildren(): void {
    this._children.forEach(child => {
      const node = child.node;
      try {
        child.destroy();
      } catch (e) {
        console.error(e);
      }
      try {
        this.parentNode.removeChild(node);
      } catch (e) {}
    });
    this._children.length = 0;
  }

  public destroy(): void {
    this._watchers.forEach(watcher => {
      watcher.destroy();
    });
    this._watchers.length = 0;
    this.controllers.destroy();
    this.destroyChildren();
    if (this._marker) {
      try {
        this.parentNode.removeChild(this._marker);
      } catch (e) {
        console.warn('failed to remove marker node');
        console.warn(e);
      }
    }
  }
}


}  // namespace Directives
}  // namespace MVC
