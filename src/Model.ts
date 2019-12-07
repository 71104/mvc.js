/// <reference path="Common.ts" />
/// <reference path="EventEmitter.ts" />
/// <reference path="expr/Watchers.ts" />


type Model = MVC.Model;


class ModelHandler {
  private constructor(
      public readonly model: Model,
      public readonly path: string[],
      public readonly target: object) {}

  public static createForObject(model: Model, path: string[], data: Dictionary) {
    const wrapped = Object.create(null);
    for (var property in data) {
      const key = String(property);
      if (data.hasOwnProperty(key)) {
        wrapped[property] = model.wrap(path.concat(key), data[property]);
      }
    }
    return new ModelHandler(model, path, wrapped);
  }

  public static createForArray(model: Model, path: string[], data: any[]) {
    return new ModelHandler(model, path, data.map((element, index) => {
      return model.wrap(path.concat('' + index), element);
    }));
  }

  public static createWithPrototype(model: Model, path: string[], data: object) {
    return new ModelHandler(model, path, Object.create(data));
  }

  public apply(target: object, thisArgument: any, argumentList: any[]): any {
    throw new TypeError('cannot invoke model object');
  }

  public construct(target: object, argumentList: any[], newTarget: any): any {
    throw new TypeError('cannot use new operator on model object');
  }

  public defineProperty(target: object, key: any, descriptor: object): boolean {
    return false;
  }

  public deleteProperty(target: object, key: any): boolean {
    const oldValue = Reflect.get(this.target, key);
    const childPath = this.path.concat(String(key));
    Reflect.deleteProperty(this.target, key);
    this.model.fire(this.path, this.target);
    this.model.fireRecursive(childPath, void 0, oldValue);
    return true;
  }

  public get(target: object, key: any, receiver: any): any {
    return Reflect.get(this.target, key, receiver);
  }

  public getOwnPropertyDescriptor(target: object, key: any) {
    return Reflect.getOwnPropertyDescriptor(this.target, key);
  }

  public getPrototypeOf(target: object) {
    return Reflect.getPrototypeOf(this.target);
  }

  public has(target: object, key: any): boolean {
    return Reflect.has(this.target, key);
  }

  public isExtensible(target: object): boolean {
    return Reflect.isExtensible(this.target);
  }

  public ownKeys(target: object) {
    return Reflect.ownKeys(this.target);
  }

  public preventExtensions(target: object): boolean {
    return Reflect.preventExtensions(this.target);
  }

  public set(target: object, key: any, value: any, receiver: any): boolean {
    const exists = !Reflect.has(this.target, key);
    const oldValue = exists ? Reflect.get(this.target, key, receiver) : void 0;
    const childPath = this.path.concat(String(key));
    const wrappedValue = this.model.wrap(childPath, value);
    Reflect.set(this.target, key, wrappedValue, receiver);
    if (!exists) {
      this.model.fire(this.path, this.target);
    }
    this.model.fireRecursive(childPath, wrappedValue, oldValue);
    return true;
  }

  public setPrototypeOf(target: object, prototype: object): boolean {
    return false;
  }
}


namespace MVC {


export class Model {
  private readonly _handlers: EventEmitter = new EventEmitter();
  public readonly proxy: object;

  public wrap(path: string[], value: any): any {
    switch (typeof value){
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
      return value;
    case 'object':
      if (null === value) {
        return null;
      } else if (Array.isArray(value)) {
        return new Proxy(value, ModelHandler.createForArray(this, path, value));
      } else {
        return new Proxy(value, ModelHandler.createForObject(this, path, value));
      }
    default:
      throw new TypeError(`illegal value of type "${typeof value}" in model`);
    }
  }

  private constructor(data: object, extend: boolean) {
    if (extend) {
      const handler = ModelHandler.createWithPrototype(this, [], data);
      this.proxy = new Proxy<object>(handler.target, handler);
    } else {
      this.proxy = <object>(this.wrap([], data));
    }
  }

  public static create(data: Dictionary): Model {
    return new Model(data, false);
  }

  public extend(data: Dictionary): Model {
    const childScope = new Model(this.proxy, true);
    const childProxy: Dictionary = childScope.proxy;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        childProxy[key] = data[key];
      }
    }
    return childScope;
  }

  public extendWith(key: string, value: any): Model {
    const data: Dictionary = {};
    data[key] = value;
    return this.extend(data);
  }

  public on(path: string[], handler: EventHandler, scope: object | null = null): Model {
    this._handlers.on(path, handler, scope);
    return this;
  }

  public off(path: string[], handler: EventHandler): Model {
    this._handlers.off(path, handler);
    return this;
  }

  public fire(path: string[], ...parameters: any[]): Model {
    this._handlers.fire(path, ...parameters);
    return this;
  }

  public fireRecursive(path: string[], ...parameters: any[]): Model {
    this._handlers.fireRecursive(path, ...parameters);
    return this;
  }

  public watch(expression: NodeInterface, handler: ValueHandler<any>, scope: object | null = null): GenericWatcher {
    return new MVC.Expressions.GenericWatcher(this, expression, false, handler, scope);
  }

  public watchBoolean(expression: NodeInterface, handler: ValueHandler<boolean>, scope: object | null = null): BooleanWatcher {
    return new MVC.Expressions.BooleanWatcher(this, expression, false, handler, scope);
  }

  public watchInteger(expression: NodeInterface, handler: ValueHandler<number>, scope: object | null = null): IntegerWatcher {
    return new MVC.Expressions.IntegerWatcher(this, expression, false, handler, scope);
  }

  public watchNumber(expression: NodeInterface, handler: ValueHandler<number>, scope: object | null = null): NumberWatcher {
    return new MVC.Expressions.NumberWatcher(this, expression, false, handler, scope);
  }

  public watchString(expression: NodeInterface, handler: ValueHandler<string>, scope: object | null = null): StringWatcher {
    return new MVC.Expressions.StringWatcher(this, expression, false, handler, scope);
  }

  public watchImmediate(expression: NodeInterface, handler: ValueHandler<any>, scope: object | null = null): GenericWatcher {
    return new MVC.Expressions.GenericWatcher(this, expression, true, handler, scope);
  }

  public watchBooleanImmediate(expression: NodeInterface, handler: ValueHandler<boolean>, scope: object | null = null): BooleanWatcher {
    return new MVC.Expressions.BooleanWatcher(this, expression, true, handler, scope);
  }

  public watchIntegerImmediate(expression: NodeInterface, handler: ValueHandler<number>, scope: object | null = null): IntegerWatcher {
    return new MVC.Expressions.IntegerWatcher(this, expression, true, handler, scope);
  }

  public watchNumberImmediate(expression: NodeInterface, handler: ValueHandler<number>, scope: object | null = null): NumberWatcher {
    return new MVC.Expressions.NumberWatcher(this, expression, true, handler, scope);
  }

  public watchStringImmediate(expression: NodeInterface, handler: ValueHandler<string>, scope: object | null = null): StringWatcher {
    return new MVC.Expressions.StringWatcher(this, expression, true, handler, scope);
  }
}


}  // namespace MVC
