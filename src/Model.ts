/// <reference path="Common.ts" />
/// <reference path="EventEmitter.ts" />


type Model = MVC.Model;


class ModelHandler {
  private constructor(
      public readonly model: Model,
      public readonly path: string[],
      public readonly target: object) {}

  private _createProxy(): object {
    return new Proxy(this.target, this);
  }

  public static createForObject(model: Model, path: string[], data: Dictionary) {
    const wrapped = Object.create(null);
    for (var property in data) {
      const key = String(property);
      if (data.hasOwnProperty(key)) {
        wrapped[property] = model.wrap(path.concat(key), data[property]);
      }
    }
    const handler = new ModelHandler(model, path, wrapped);
    return handler._createProxy();
  }

  public static createForArray(model: Model, path: string[], data: any[]) {
    const handler = new ModelHandler(model, path, data.map((element, index) => {
      return model.wrap(path.concat('' + index), element);
    }));
    return handler._createProxy();
  }

  public static createWithPrototype(model: Model, path: string[], data: object) {
    const handler = new ModelHandler(model, path, Object.create(data));
    return handler._createProxy();
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
  private readonly _parent: Model | null;
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
        return ModelHandler.createForArray(this, path, value);
      } else {
        return ModelHandler.createForObject(this, path, value);
      }
    default:
      throw new TypeError(`illegal value of type "${typeof value}" in model`);
    }
  }

  private constructor(parent: Model | null, data: object, extend: boolean) {
    this._parent = parent;
    if (extend) {
      this.proxy = ModelHandler.createWithPrototype(this, [], data);
    } else {
      this.proxy = <object>(this.wrap([], data));
    }
  }

  public static create(data: Dictionary): Model {
    return new Model(null, data, false);
  }

  public extend(data: Dictionary = {}): Model {
    const childScope = new Model(this, this.proxy, true);
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

  public on(path: string[], handler: EventHandler, scope: any = null): Model {
    this._parent?.on(path, handler, scope);
    this._handlers.on(path, handler, scope);
    return this;
  }

  public off(path: string[], handler: EventHandler): Model {
    this._parent?.off(path, handler);
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
}


}  // namespace MVC
