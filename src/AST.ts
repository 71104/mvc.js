namespace MVC {
namespace Expressions {
namespace AST {


export interface NodeInterface {
  free(): string[];
  compile(): string;
}


function unique(...elements: (string | string[])[]): string[] {
  let array: string[] = [];
  return [...new Set<string>(array.concat(...elements))];
}


type PrimitiveValue = null | boolean | number | string;
type ArrayValue = PrimitiveValue[];
type DictionaryValue = {[key: string]: LiteralValue};
type LiteralValue = PrimitiveValue | ArrayValue | DictionaryValue;


export class LiteralNode implements NodeInterface {
  private readonly _value: string;

  public constructor(value: LiteralValue) {
    this._value = JSON.stringify(value);
  }

  public free(): string[] {
    return [];
  }

  public compile(): string {
    return `${this._value}`;
  }
}


export class VariableNode implements NodeInterface {
  public constructor(public readonly name: string) {}

  public free(): string[] {
    return [this.name];
  }

  public compile(): string {
    return `${this.name}`;
  }
}


export class UnaryNode implements NodeInterface {
  public constructor(
    public readonly operator: string,
    public readonly inner: NodeInterface) {}

  public free(): string[] {
    return this.inner.free();
  }

  public compile(): string {
    return `${this.operator}(${this.inner.compile()})`;
  }
}


export class BinaryNode implements NodeInterface {
  public constructor(
    public readonly operator: string,
    public readonly left: NodeInterface,
    public readonly right: NodeInterface) {}

  public free(): string[] {
    return unique(this.left.free(), this.right.free());
  }

  public compile(): string {
    return `(${this.left.compile()})${this.operator}(${this.right.compile()})`;
  }
}


export class BindNode implements NodeInterface {
  public constructor(
    public readonly name: string,
    public readonly parameters: NodeInterface[]) {}

  public free(): string[] {
    return unique(this.name, ...this.parameters.map(parameter => parameter.free()));
  }

  public compile(): string {
    return `${this.name}(${this.parameters.map(parameter => parameter.compile()).join(',')})`;
  }
}


export class PipeNode implements NodeInterface {
  public constructor(
    public readonly left: NodeInterface,
    public readonly right: NodeInterface) {}

  public free(): string[] {
    return unique(this.left.free(), this.right.free());
  }

  public compile(): string {
    return `(${this.right.compile()})(${this.left.compile()})`;
  }
}


}  // namespace AST
}  // namespace Expressions
}  // namespace MVC
