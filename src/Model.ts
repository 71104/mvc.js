/// <reference path="EventEmitter.ts" />
/// <reference path="Types.ts" />


class Model {
  private readonly _handlers: EventEmitter = new EventEmitter();
  private readonly _proxy: typeof Proxy;

  private _wrapObject(path: string[], value: Dictionary): Dictionary {
    const wrapped = Object.create(null);
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        wrapped[key] = this._wrap(path.concat(key), value[key]);
      }
    }
    return new Proxy(wrapped, {
      set: ((obj: Dictionary, key: any, value: any): boolean => {
        const oldValue = obj[key];
        const childPath = path.concat(String(key));
        obj[key] = this._wrap(childPath, value);
        this.fire(childPath, value, oldValue);
        return true;
      }).bind(this),
      deleteProperty: ((obj: Dictionary, key: any, value: any): boolean => {
        const oldValue = obj[key];
        const childPath = path.concat(String(key));
        obj[key] = this._wrap(childPath, value);
        this.fire(childPath, void 0, oldValue);
        return true;
      }).bind(this),
    });
  }

  private _wrapCollection(path: string[], value: any[]): any[] {
    let length = value.length;
    return new Proxy(value.map((item, index) => {
      return this._wrap(path.concat('' + index), item);
    }, this), {
      // TODO
    });
  }

  private _wrap(path: string[], value: any): any {
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
    this._proxy = this._wrap([], data);
  }

  public get proxy(): typeof Proxy {
    return this._proxy;
  }

  private _getEventKey(path: string[]): string {
    return path.map(component => {
      return component.replace('\\', '\\\\').replace('.', '\\.');
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
