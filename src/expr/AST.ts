/// <reference path="../Common.ts" />


namespace MVC {
export namespace Expressions {


export interface PathComponentInterface {
  equals(other: PathComponentInterface): boolean;
  getFreePaths(): FreePath[];
  compile(): string;
  evaluate(data: Dictionary): any;
}


export class FreePath {
  public constructor(public readonly components: PathComponentInterface[]) {}

  public equals(other: FreePath): boolean {
    return this.components.every((component, index) => {
      return component.equals(other.components[index]);
    });
  }

  public bind(data: Dictionary): string[] {
    return this.components.map(component => String(component.evaluate(data)));
  }
}


export interface NodeInterface {
  getFreePaths(): FreePath[];
  compile(): string;
}


}  // namespace Expressions
}  // namespace MVC


type PathComponentInterface = MVC.Expressions.PathComponentInterface;
type FreePath = MVC.Expressions.FreePath;
type NodeInterface = MVC.Expressions.NodeInterface;


function flatUniquePaths(...elements: (FreePath | FreePath[])[]): FreePath[] {
  const array = flatten<FreePath>(...elements);
  const result: FreePath[] = [];
  array.forEach(path => {
    if (!result.some(other => path.equals(other))) {
      result.push(path);
    }
  });
  return result;
}


class LiteralNode implements NodeInterface {
  private readonly _value: string;

  public constructor(value: any) {
    this._value = JSON.stringify(value);
  }

  public getFreePaths(): FreePath[] {
    return [];
  }

  public compile(): string {
    return this._value;
  }
}


class FieldComponent implements PathComponentInterface {
  public constructor(public readonly name: string) {}

  public equals(other: PathComponentInterface): boolean {
    if (other instanceof FieldComponent) {
      return this.name === other.name;
    } else {
      return false;
    }
  }

  public getFreePaths(): FreePath[] {
    return [];
  }

  public compile(): string {
    return `.${this.name}`;
  }

  public evaluate(data: Dictionary): any {
    return this.name;
  }
}


class SubscriptComponent implements PathComponentInterface {
  public constructor(public readonly index: NodeInterface) {}

  public equals(other: PathComponentInterface): boolean {
    return false;
  }

  public getFreePaths(): FreePath[] {
    return this.index.getFreePaths();
  }

  public compile(): string {
    return `[${this.index.compile()}]`;
  }

  public evaluate(data: Dictionary): any {
    return MVC.Expressions.compile(this.index).call(data);
  }
}


class ReferenceNode implements NodeInterface {
  public constructor(public readonly components: PathComponentInterface[]) {}

  public getFreePaths(): FreePath[] {
    return [new MVC.Expressions.FreePath(this.components)];
  }

  public compile(): string {
    return `this${this.components.map(component => {
      return component.compile();
    }).join()}`;
  }
}


class UnaryNode implements NodeInterface {
  public constructor(
    public readonly operator: string,
    public readonly inner: NodeInterface) {}

  public getFreePaths(): FreePath[] {
    return this.inner.getFreePaths();
  }

  public compile(): string {
    return `${this.operator}(${this.inner.compile()})`;
  }
}


class BinaryNode implements NodeInterface {
  public constructor(
    public readonly operator: string,
    public readonly left: NodeInterface,
    public readonly right: NodeInterface) {}

  public getFreePaths(): FreePath[] {
    return flatUniquePaths(this.left.getFreePaths(), this.right.getFreePaths());
  }

  public compile(): string {
    return `(${this.left.compile()})${this.operator}(${this.right.compile()})`;
  }
}


class BindNode implements NodeInterface {
  public constructor(
    public readonly name: string,
    public readonly parameters: NodeInterface[]) {}

  public getFreePaths(): FreePath[] {
    return flatUniquePaths(
        new MVC.Expressions.FreePath([new FieldComponent(this.name)]),
        ...this.parameters.map(parameter => parameter.getFreePaths()));
  }

  public compile(): string {
    return `${this.name}(${this.parameters.map(parameter => {
      return parameter.compile();
    }).join(',')})`;
  }
}


class PipeNode implements NodeInterface {
  public constructor(
    public readonly left: NodeInterface,
    public readonly right: NodeInterface) {}

  public getFreePaths(): FreePath[] {
    return flatUniquePaths(this.left.getFreePaths(), this.right.getFreePaths());
  }

  public compile(): string {
    return `(${this.right.compile()})(${this.left.compile()})`;
  }
}


class StaticFragmentNode implements NodeInterface {
  public constructor(public readonly text: string) {}

  public getFreePaths(): FreePath[] {
    return [];
  }

  public compile(): string {
    return JSON.stringify(this.text);
  }
}


class InterpolatedNode implements NodeInterface {
  public constructor(public readonly fragments: NodeInterface[]) {}

  public isAllStatic(): boolean {
    return this.fragments.every(fragment => fragment instanceof StaticFragmentNode);
  }

  public getFreePaths(): FreePath[] {
    return flatUniquePaths(...this.fragments.map(fragment => fragment.getFreePaths()));
  }

  public compile(): string {
    return `(${this.fragments.map(fragment => fragment.compile()).join(')+(')})`;
  }
}


class CollectionIterationNode {
  public constructor(
      public readonly elementName: string,
      public readonly collection: NodeInterface) {}
}


class DictionaryIterationNode {
  public constructor(
      public readonly keyName: string,
      public readonly valueName: string,
      public readonly dictionary: NodeInterface) {}
}
