class Model<Format extends {}> {
  public readonly proxy: typeof Proxy;

  private static _wrapObject(prefix: string, data: {[key: string]: any}) {
    const result = Object.create(null);
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        switch (typeof value) {
        case 'undefined':
        case 'boolean':
        case 'number':
        case 'string':
          result[key] = value;
          break;
        case 'object':
          const childPrefix = prefix ? `${prefix}.${key}` : key;
          if (Array.isArray(value)) {
            result[key] = Model._wrapArray(childPrefix, value);
          } else {
            result[key] = Model._wrapObject(childPrefix, value);
          }
          break;
        default:
          throw new Error(`unsupported data type: '${typeof value}'`);
        }
      }
    }
    return new Proxy(result, {
      set: (obj, key: string, value) => {
        if (typeof obj[key] !== typeof value || 'object' === typeof value) {
          throw new Error('changing model structure is forbidden');
        }
        return true;
      },
    });
  }

  private static _wrapArray(prefix: string, data: any[]) {
    var length = data.length;
    return new Proxy(data, {
      set: (obj, key: string, value) => {
        if (/^[0-9]+$/.test(key)) {
          const index = parseInt(key, 10);
          length = Math.max(length, index);
        }
        return true;
      },
      deleteProperty: (obj, key: string) => {
        if (/^[0-9]+$/.test(key)) {
          const index = parseInt(key, 10);
          if (length - 1 === index) {
            --length;
          }
        }
        return true;
      },
    });
  }

  public constructor(data: Format) {
    this.proxy = Model._wrapObject('', data);
  }
}
