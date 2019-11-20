/// <reference path="EventEmitter.ts" />
/// <reference path="Types.ts" />


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
      set: ((obj: Dictionary, key: any, value: any): boolean => {
        if (key in this._data) {
          if (typeof this._data[key] !== typeof value) {
            throw new Error(`cannot change type of property "${key}" from ${typeof this._data[key]} to ${typeof value}: changing the structure of a model is forbidden`);
          } else {
            this._data[key] = value;
            return true;
          }
        } else {
          throw new Error(`cannot add property "${key}": changing the structure of a model is forbidden`);
        }
      }).bind(this),
      deleteProperty: (obj: Dictionary, key: any): boolean => {
        throw new Error(`cannot delete property "${key}": changing the structure of a model is forbidden`);
      },
    });
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
  private readonly _handlers: EventEmitter = new EventEmitter();

  public constructor(data: any[]) {
    // TODO
  }
}
