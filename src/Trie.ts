class Trie<ValueType> {
  private readonly _children: {[key: string]: Trie<ValueType>} = Object.create(null);
  private _value: ValueType | null = null;

  public get empty(): boolean {
    if (this._value !== null) {
      return false;
    } else {
      for (var key in this._children) {
        return false;
      }
      return true;
    }
  }

  public insert(path: string[], value: ValueType): ValueType | null {
    if (path.length > 0) {
      const [head, ...tail] = path;
      if (!(head in this._children)) {
        this._children[head] = new Trie<ValueType>();
      }
      return this._children[head].insert(tail, value);
    } else {
      const previous = this._value;
      this._value = value;
      return previous;
    }
  }

  public contains(path: string[]): boolean {
    if (path.length > 0) {
      const [head, ...tail] = path;
      if (head in this._children) {
        return this._children[head].contains(tail);
      } else {
        return false;
      }
    } else {
      return this._value !== null;
    }
  }

  public lookup(path: string[]): ValueType | null {
    if (path.length > 0) {
      const [head, ...tail] = path;
      if (head in this._children) {
        return this._children[head].lookup(tail);
      } else {
        return null;
      }
    } else {
      return this._value;
    }
  }

  public erase(path: string[]): ValueType | null {
    if (path.length > 0) {
      const [head, ...tail] = path;
      if (head in this._children) {
        const child = this._children[head];
        const result = child.erase(tail);
        if (child.empty) {
          delete this._children[head];
        }
        return result;
      } else {
        return null;
      }
    } else {
      const value = this._value;
      this._value = null;
      return value;
    }
  }

  private _forEach(
      prefix: string[],
      callback: (path: string[], value: ValueType) => void,
      scope: any = null): void
  {
    if (this._value !== null) {
      callback.call(scope, prefix, this._value);
    }
    for (var key in this._children) {
      this._children[key]._forEach(prefix.concat(key), callback, scope);
    }
  }

  public forEach(
      callback: (path: string[], value: ValueType) => void,
      scope: any = null): void
  {
    this._forEach([], callback, scope);
  }

  public map<ResultType>(
      callback: (path: string[], value: ValueType) => ResultType,
      scope: any = null): Trie<ResultType>
  {
    const result = new Trie<ResultType>();
    this._forEach([], (path, value) => {
      result.insert(path, callback.call(scope, path, value));
    });
    return result;
  }
}
