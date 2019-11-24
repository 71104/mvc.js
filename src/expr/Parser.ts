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
    ['==', '!=', '===', '!=='],
  ];

  public constructor(public readonly input: string) {
    this._lexer = new Lexer(input);
    this._lexer.next();  // the first token is always "begin"
  }

  private _parseStringLiteral(label: string): string {
    return JSON.parse(label);
  }

  private _parseReferenceComponents(components: PathComponentInterface[]): ReferenceNode {
    switch (this._lexer.token) {
    case 'dot':
      const label = this._lexer.expect('name');
      return this._parseReferenceComponents(components.concat(new FieldComponent(label)));
    case 'left-square':
      this._lexer.next();
      const index = this._parseRoot();
      this._lexer.expect('right-square');
      return this._parseReferenceComponents(components.concat(new SubscriptComponent(index)));
    default:
      return new ReferenceNode(components);
    }
  }

  private _parseReference(): ReferenceNode {
    const label = this._lexer.expect('name');
    return this._parseReferenceComponents([new FieldComponent(label)]);
  }

  private _parseValue(): NodeInterface {
    switch (this._lexer.next()) {
    case 'undefined':
      this._lexer.next();
      return new LiteralNode(void 0);
    case 'true':
      this._lexer.next();
      return new LiteralNode(true);
    case 'false':
      this._lexer.next();
      return new LiteralNode(false);
    case 'number':
      return new LiteralNode(parseFloat(this._lexer.step()));
    case 'string':
      return new LiteralNode(this._parseStringLiteral(this._lexer.step()));
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


export function interpolate(input: string): InterpolatedNode {
  const fragments: NodeInterface[] = [];
  let text = '';
  for (let i = 0; i < input.length; i++) {
    if ('{' !== input[i]) {
      text += input[i];
    } else if (++i < input.length && '{' === input[i]) {
      fragments.push(new StaticFragmentNode(text));
      fragments.push((function () {
        for (i++, text = ''; i < input.length; i++) {
          if ('}' !== input[i]) {
            text += input[i];
          } else if (++i < input.length && '}' === input[i]) {
            const parser = new Parser(text);
            return parser.parse();
          } else {
            text += '}' + input[i];
          }
        }
        throw new MVC.SyntaxError(input);
      }()));
      text = '';
    } else {
      text += '{' + input[i];
    }
  }
  fragments.push(new StaticFragmentNode(text));
  return new InterpolatedNode(fragments);
}


export function compile(expression: NodeInterface): Function {
  return new Function(`return(${expression.compile()});`);
}


export type ExpressionCoercer = ''
    | 'void'     // undefined
    | '!!'       // boolean
    | '~~'       // integer
    | '+'        // float
    | 'String';  // string


export function compileSafe(coercer: ExpressionCoercer, expression: NodeInterface): Function {
  return new Function(`
    try {
      return ${coercer}(${expression.compile()});
    } catch (e) {
      console.error(e);
      return'';
    }
  `);
}


}  // namespace Expressions
}  // namespace MVC
