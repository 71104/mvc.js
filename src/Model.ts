/// <reference path="EventEmitter.ts" />
/// <reference path="Types.ts" />


class ModelHandler {
  private readonly _wrapped: Dictionary;

  public constructor(
      private readonly _model: Model,
      private readonly _path: string[],
      value: Dictionary)
  {
    this._wrapped = Object.create(null);
    for (var property in value) {
      const key = String(property);
      if (value.hasOwnProperty(key)) {
        this._wrapped[key] = this._model.wrap(this._path.concat(key), value[key]);
      }
    }
  }

  public apply(target: Dictionary, thisArgument: any, argumentList: any[]): any {
    throw new TypeError('cannot invoke model object');
  }

  public construct(target: Dictionary, argumentList: any[], newTarget: any): any {
    throw new TypeError('cannot use new operator on model object');
  }

  public deleteProperty(target: Dictionary, key: any): boolean {
    const oldValue = Reflect.get(this._wrapped, key);
    const childPath = this._path.concat(String(key));
    Reflect.deleteProperty(this._wrapped, key);
    this._model.fire(childPath, void 0, oldValue);
    return true;
  }

  public get(target: Dictionary, key: any, receiver: any): any {
    return Reflect.get(this._wrapped, key, receiver);
  }

  public has(target: Dictionary, key: any): boolean {
    return Reflect.has(this._wrapped, key);
  }

  public set(target: Dictionary, key: any, value: any, receiver: any): boolean {
    const oldValue = Reflect.get(this._wrapped, key, receiver);
    const childPath = this._path.concat(String(key));
    const wrappedValue = this._model.wrap(childPath, value);
    Reflect.set(this._wrapped, key, wrappedValue, receiver);
    this._model.fire(childPath, wrappedValue, oldValue);
    return true;
  }
}


class CollectionHandler {
  private readonly _wrapped: any[];

  public constructor(
      private readonly _model: Model,
      private readonly _path: string[],
      value: any[])
  {
    this._wrapped = value.map((element, index) => {
      return this._model.wrap(this._path.concat('' + index), element);
    }, this);
  }

  public apply(target: any[], thisArgument: any, argumentList: any[]): any {
    throw new TypeError('cannot invoke model collection');
  }

  public construct(target: any[], argumentList: any[], newTarget: any): any {
    throw new TypeError('cannot use new operator on model collection');
  }

  public has(target: any[], key: any): boolean {
    return Reflect.has(this._wrapped, key);
  }

  // TODO
}


class Model {
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
        return new Proxy(value, new CollectionHandler(this, path, value));
      } else {
        return new Proxy(value, new ModelHandler(this, path, value));
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

  private _getEventKey(path: string[]): string {
    return path.map(component => {
      return component.replace(/\\/g, '\\\\').replace(/\./g, '\\.');
    }).join('.');
  }

  public on(path: string[], handler: EventHandler): Model {
    this._handlers.on(this._getEventKey(path), handler);
    return this;
  }

  public off(path: string[], handler: EventHandler): Model {
    this._handlers.off(this._getEventKey(path), handler);
    return this;
  }

  public fire(path: string[], ...parameters: any[]): Model {
    this._handlers.fire(this._getEventKey(path), ...parameters);
    return this;
  }
}
