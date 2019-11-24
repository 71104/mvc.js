type EventHandler = (...parameters: any[]) => void;


class EventEmitter {
  private readonly _children: {[key: string]: EventEmitter} = Object.create(null);
  private readonly _handlers: {[key: string]: EventHandler[]} = Object.create(null);

  public on(path: string[], handler: EventHandler): EventEmitter {
    if (path.length > 1) {
      const key = path[0];
      if (!(key in this._children)) {
        this._children[key] = new EventEmitter();
      }
      this._children[key].on(path.slice(1), handler);
    } else if (path.length > 0) {
      const key = path[0];
      if (!(key in this._handlers)) {
        this._handlers[key] = [];
      }
      this._handlers[key].push(handler);
    }
    return this;
  }

  public off(path: string[], handler: EventHandler): EventEmitter {
    if (path.length > 1) {
      const key = path[0];
      if (key in this._children) {
        this._children[key].off(path.slice(1), handler);
      }
    } else if (path.length > 0) {
      const key = path[0];
      if (key in this._handlers) {
        const queue = this._handlers[key];
        const index = queue.indexOf(handler);
        if (index >= 0) {
          queue.splice(index, 1);
        }
      }
    }
    return this;
  }

  public fire(path: string[], ...parameters: any[]): EventEmitter {
    if (path.length > 1) {
      const key = path[0];
      if (key in this._children) {
        this._children[key].fire(path.slice(1), ...parameters);
      }
    } else if (path.length > 0) {
      const key = path[0];
      if (key in this._handlers) {
        const queue = this._handlers[key];
        for (var i = 0; i < queue.length; i++) {
          queue[i](...parameters);
        }
      }
    }
    return this;
  }

  public fireRecursive(path: string[], ...parameters: any[]): EventEmitter {
    this.fire(path, ...parameters);
    const childPath = path.slice(1);
    for (var key in this._children) {
      this._children[key].fireRecursive(childPath, ...parameters);
    }
    return this;
  }
}
