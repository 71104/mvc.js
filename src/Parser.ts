/// <reference path="Lexer.ts" />
/// <reference path="AST.ts" />


namespace MVC {
export namespace Expressions {


export class Parser {
  private readonly _lexer: Lexer;

  private static readonly _BINARY_OPERATOR_PRECEDENCE_TABLE = [
    ['**'],
    ['*', '/', '%'],
    ['+', '-'],
    ['<<', '>>', '>>>'],
    ['<', '<=', '>', '>=', 'in'],
  ];

  public constructor(public readonly input: string) {
    this._lexer = new Lexer(input);
    this._lexer.next();  // the first token is always "begin"
  }

  private _parseStringLiteral(label: string): string {
    // TODO: parse escape sequences
    return label
        .replace(/^["']/, '')
        .replace(/["']$/, '')
        .replace(/\\(.)/g, '$1');
  }

  private _parseReference(): NodeInterface {
    if ('name' !== this._lexer.token) {
      throw new MVC.SyntaxError(this.input);
    }
    const components = [new FieldComponent(this._lexer.label)];
    this._lexer.next();
    // TODO
    return new ReferenceNode(components);
  }

  private _parseValue(): NodeInterface {
    switch (this._lexer.next()) {
    case 'undefined':
      return new LiteralNode(void 0);
    case 'true':
      return new LiteralNode(true);
    case 'false':
      return new LiteralNode(false);
    case 'number':
      return new LiteralNode(parseFloat(this._lexer.label));
    case 'string':
      return new LiteralNode(this._parseStringLiteral(this._lexer.label));
    case 'left':
      const node = this._parseRoot();
      this._lexer.expect('right');
      return node;
    default:
      return this._parseReference();
    }
  }

  private _parseUnaryNode(): NodeInterface {
    if ('operator' !== this._lexer.token) {
      return this._parseValue();
    } else {
      const operator = this._lexer.label;
      if (['+', '-', '!'].includes(operator)) {
        this._lexer.next();
        return new UnaryNode(operator, this._parseUnaryNode());
      } else {
        throw new MVC.SyntaxError(this.input);
      }
    }
  }

  private _parseBinaryNode(precedenceIndex: number): NodeInterface {
    if (precedenceIndex < Parser._BINARY_OPERATOR_PRECEDENCE_TABLE.length) {
      const left = this._parseBinaryNode(precedenceIndex + 1);
      const operators = Parser._BINARY_OPERATOR_PRECEDENCE_TABLE[precedenceIndex];
      if ('operator' !== this._lexer.token || !operators.includes(this._lexer.label)) {
        return left;
      } else {
        return new BinaryNode(this._lexer.label, left, this._parseBinaryNode(precedenceIndex));
      }
    } else {
      return this._parseUnaryNode();
    }
  }

  public _parseRoot(): NodeInterface {
    return this._parseBinaryNode(0);
  }

  public parse(): NodeInterface {
    const node = this._parseRoot();
    if (this._lexer.end) {
      return node;
    } else {
      throw new MVC.SyntaxError(this.input);
    }
  }
}


export function compile(expression: string): Function {
  const parser = new Parser(expression);
  const node = parser.parse();
  return new Function(`return(${node.compile()});`);
}


}  // namespace Expressions
}  // namespace MVC
