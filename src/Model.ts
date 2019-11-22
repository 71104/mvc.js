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

  public set(obj: Dictionary, key: any, value: any): boolean {
    const oldValue = obj[key];
    const childPath = this._path.concat(String(key));
    obj[key] = this._model.wrap(childPath, value);
    this._model.fire(childPath, obj[key], oldValue);
    return true;
  }

  public deleteProperty(obj: Dictionary, key: any): boolean {
    const oldValue = obj[key];
    const childPath = this._path.concat(String(key));
    delete obj[key];
    this._model.fire(childPath, obj[key], oldValue);
    return true;
  }
}


class Model {
  private readonly _handlers: EventEmitter = new EventEmitter();
  private readonly _proxy: typeof Proxy;

  private _wrapObject(path: string[], value: Dictionary): Dictionary {
    return new Proxy(value, new ModelHandler(this, path, value));
  }

  private _wrapCollection(path: string[], value: any[]): any[] {
    let length = value.length;
    return new Proxy(value.map((item, index) => {
      return this.wrap(path.concat('' + index), item);
    }, this), {
      set: ((obj: any[], key: any, value: any): boolean => {
        if (/^[0-9]+$/.test(String(key))) {
          const index = parseInt(key, 10);
          const childPath = path.concat('' + index);
          // TODO
          return true;
        } else {
          // TODO
          return false;
        }
      }).bind(this),
      deleteProperty: ((obj: any[], key: any): boolean => {
        if (/^[0-9]+$/.test(String(key))) {
          const index = parseInt(key, 10);
          const childPath = path.concat('' + index);
          // TODO
          return true;
        } else {
          // TODO
          return false;
        }
      }).bind(this),
    });
  }

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
        return this._wrapCollection(path, value);
      } else {
        return this._wrapObject(path, value);
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
