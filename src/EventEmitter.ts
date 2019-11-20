type EventHandler = (key: string, ...parameters: any[]) => void;


class EventEmitter {
  private readonly _handlers: {[key: string]: EventHandler[]} = Object.create(null);

  private _getQueue(key: string): EventHandler[] {
    if (key in this._handlers) {
      return this._handlers[key];
    } else {
      return this._handlers[key] = [];
    }
  }

  public on(key: string, handler: EventHandler): EventEmitter {
    this._getQueue(key).push(handler);
    return this;
  }

  public off(key: string, handler: EventHandler): EventEmitter {
    if (key in this._handlers) {
      const queue = this._handlers[key]
      const index = queue.indexOf(handler);
      if (index >= 0) {
        queue.splice(index, 1);
      }
    }
    return this;
  }

  public fire(key: string, ...parameters: any[]): EventEmitter {
    if (key in this._handlers) {
      const queue = this._handlers[key];
      for (var i = 0; i < queue.length; i++) {
        queue[i](key, ...parameters);
      }
    }
    return this;
  }
}
