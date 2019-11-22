/// <reference path="Types.ts" />


namespace MVC {
export namespace Expressions {


export interface NodeInterface {
  getFreePaths(): string[];
  compile(): string;
}


}  // namespace Expressions
}  // namespace MVC


type NodeInterface = MVC.Expressions.NodeInterface;


function unique(...elements: (string | string[])[]): string[] {
  let array: string[] = [];
  return [...new Set<string>(array.concat(...elements))];
}


class LiteralNode implements NodeInterface {
  private readonly _value: string;

  public constructor(value: LiteralValue) {
    this._value = JSON.stringify(value);
  }

  public getFreePaths(): string[] {
    return [];
  }

  public compile(): string {
    return `${this._value}`;
  }
}


class VariableNode implements NodeInterface {
  public constructor(public readonly name: string) {}

  public getFreePaths(): string[] {
    return [this.name];
  }

  public compile(): string {
    return `${this.name}`;
  }
}


class UnaryNode implements NodeInterface {
  public constructor(
    public readonly operator: string,
    public readonly inner: NodeInterface) {}

  public getFreePaths(): string[] {
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

  public getFreePaths(): string[] {
    return unique(this.left.getFreePaths(), this.right.getFreePaths());
  }

  public compile(): string {
    return `(${this.left.compile()})${this.operator}(${this.right.compile()})`;
  }
}


class BindNode implements NodeInterface {
  public constructor(
    public readonly name: string,
    public readonly parameters: NodeInterface[]) {}

  public getFreePaths(): string[] {
    return unique(this.name, ...this.parameters.map(parameter => parameter.getFreePaths()));
  }

  public compile(): string {
    return `${this.name}(${this.parameters.map(parameter => parameter.compile()).join(',')})`;
  }
}


class PipeNode implements NodeInterface {
  public constructor(
    public readonly left: NodeInterface,
    public readonly right: NodeInterface) {}

  public getFreePaths(): string[] {
    return unique(this.left.getFreePaths(), this.right.getFreePaths());
  }

  public compile(): string {
    return `(${this.right.compile()})(${this.left.compile()})`;
  }
}
