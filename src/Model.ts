/// <reference path="EventEmitter.ts" />
/// <reference path="Types.ts" />


namespace MVC {

export class ModelChangeError extends Error {
  public constructor(message: string) {
    super(`${message}: changing the structure of a model is forbidden`);
  }
}

}  // namespace MVC


type ModelField = PrimitiveValue | Model | Collection;


class Model {
  private readonly _data: {[key: string]: ModelField} = Object.create(null);
  private readonly _proxy: typeof Proxy;
  private readonly _handlers: EventEmitter = new EventEmitter();

  public constructor(data: Dictionary) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        switch (typeof value){
        case 'undefined':
        case 'boolean':
        case 'number':
        case 'string':
          this._data[key] = <PrimitiveValue>value;
          break;
        case 'object':
          if (null === value) {
            this._data[key] = null;
          } else if (Array.isArray(value)) {
            this._data[key] = new Collection(value);
          } else {
            this._data[key] = new Model(value);
          }
          break;
        default:
          throw new TypeError(`illegal type "${typeof value}" for field "${key}" in model`);
        }
      }
    }
    // @ts-ignore
    this._proxy = new Proxy(this._data, {
      set: this._setTrap.bind(this),
      deleteProperty: this._deleteTrap.bind(this),
    });
  }

  private _setTrap(obj: Dictionary, key: any, value: any): boolean {
    if (key in this._data) {
      if (typeof this._data[key] !== typeof value) {
        throw new MVC.ModelChangeError(`cannot change type of property "${key}" from ${typeof this._data[key]} to ${typeof value}`);
      } else if ('object' === typeof this._data[key]) {
        throw new MVC.ModelChangeError(`cannot reassign object field "${key}"`);
      } else {
        const oldValue = this._data[key];
        this._data[key] = value;
        this._handlers.fire(key, value, oldValue);
        return true;
      }
    } else {
      throw new MVC.ModelChangeError(`cannot add property "${key}"`);
    }
  }

  private _deleteTrap(obj: Dictionary, key: any): boolean {
    throw new MVC.ModelChangeError(`cannot delete property "${key}"`);
  }

  public get proxy(): typeof Proxy {
    return this._proxy;
  }

  public on(field: string, handler: EventHandler): Model {
    if (field in this._data) {
      this._handlers.on(field, handler);
      return this;
    } else {
      throw new TypeError(`field "${name}" doesn't exist in this model`);
    }
  }

  public off(field: string, handler: EventHandler): Model {
    if (field in this._data) {
      this._handlers.off(field, handler);
      return this;
    } else {
      throw new TypeError(`field "${name}" doesn't exist in this model`);
    }
  }

  public getField(name: string): ModelField {
    if (name in this._data) {
      return this._data[name];
    } else {
      throw new TypeError(`field "${name}" doesn't exist in this model`);
    }
  }
}


class Collection {
  private readonly _data: ModelField[] = [];
  private readonly _proxy: typeof Proxy;
  private readonly _handlers: EventEmitter = new EventEmitter();

  public constructor(data: any[]) {
    for (var i = 0; i < data.length; i++) {
      // TODO
    }
  }

  public get proxy(): typeof Proxy {
    return this._proxy;
  }
}
