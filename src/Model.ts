/// <reference path="Common.ts" />
/// <reference path="EventEmitter.ts" />
/// <reference path="expr/Watchers.ts" />


type Model = MVC.Model;


class ModelHandler {
  private constructor(
      private readonly _model: Model,
      private readonly _path: string[],
      private readonly _target: {}) {}

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

  public apply(target: {}, thisArgument: any, argumentList: any[]): any {
    throw new TypeError('cannot invoke model object');
  }

  public construct(target: {}, argumentList: any[], newTarget: any): any {
    throw new TypeError('cannot use new operator on model object');
  }

  public defineProperty(target: {}, key: any, descriptor: {}): boolean {
    return false;
  }

  public deleteProperty(target: {}, key: any): boolean {
    const oldValue = Reflect.get(this._target, key);
    const childPath = this._path.concat(String(key));
    Reflect.deleteProperty(this._target, key);
    this._model.fire(this._path, this._target);
    this._model.fireRecursive(childPath, void 0, oldValue);
    return true;
  }

  public get(target: {}, key: any, receiver: any): any {
    return Reflect.get(this._target, key, receiver);
  }

  public getOwnPropertyDescriptor(target: {}, key: any) {
    return Reflect.getOwnPropertyDescriptor(this._target, key);
  }

  public getPrototypeOf(target: {}) {
    return Reflect.getPrototypeOf(this._target);
  }

  public has(target: {}, key: any): boolean {
    return Reflect.has(this._target, key);
  }

  public isExtensible(target: {}): boolean {
    return Reflect.isExtensible(this._target);
  }

  public ownKeys(target: {}) {
    return Reflect.ownKeys(this._target);
  }

  public preventExtensions(target: {}): boolean {
    return Reflect.preventExtensions(this._target);
  }

  public set(target: {}, key: any, value: any, receiver: any): boolean {
    const exists = !Reflect.has(this._target, key);
    const oldValue = exists ? Reflect.get(this._target, key, receiver) : void 0;
    const childPath = this._path.concat(String(key));
    const wrappedValue = this._model.wrap(childPath, value);
    Reflect.set(this._target, key, wrappedValue, receiver);
    if (!exists) {
      this._model.fire(this._path, this._target);
    }
    this._model.fireRecursive(childPath, wrappedValue, oldValue);
    return true;
  }

  public setPrototypeOf(target: {}, prototype: {}): boolean {
    return false;
  }
}


namespace MVC {


export class Model {
  private readonly _handlers: EventEmitter = new EventEmitter();
  private readonly _proxy: typeof Proxy;

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

  public constructor(data: Dictionary) {
    this._proxy = this.wrap([], data);
  }

  public get proxy(): typeof Proxy {
    return this._proxy;
  }

  public push(key: string, value: any): void {
    // TODO
  }

  public pushMany(data: Dictionary): void {
    // TODO
  }

  public pop(): void {
    // TODO
  }

  public on(path: string[], handler: EventHandler): Model {
    this._handlers.on(path, handler);
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

  public watch(expression: NodeInterface, handler: ValueHandler<any>): GenericWatcher {
    return new MVC.Expressions.GenericWatcher(this, expression, handler);
  }

  public watchBoolean(expression: NodeInterface, handler: ValueHandler<boolean>): BooleanWatcher {
    return new MVC.Expressions.BooleanWatcher(this, expression, handler);
  }

  public watchInteger(expression: NodeInterface, handler: ValueHandler<number>): IntegerWatcher {
    return new MVC.Expressions.IntegerWatcher(this, expression, handler);
  }

  public watchNumber(expression: NodeInterface, handler: ValueHandler<number>): NumberWatcher {
    return new MVC.Expressions.NumberWatcher(this, expression, handler);
  }

  public watchString(expression: NodeInterface, handler: ValueHandler<string>): StringWatcher {
    return new MVC.Expressions.StringWatcher(this, expression, handler);
  }
}


}  // namespace MVC
