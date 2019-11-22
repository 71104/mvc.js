/// <reference path="Types.ts" />


type Token = 'begin'
  | 'undefined'
  | 'true'
  | 'false'
  | 'name'
  | 'number'
  | 'string'
  | 'operator'
  | 'left'
  | 'right'
  | 'end';


class Lexer {
  private _input: string;
  private _token: Token = 'begin';
  private _label: string = '';

  public constructor(public readonly originalInput: string) {
    this._input = this.originalInput;
  }

  public get token(): Token {
    return this._token;
  }

  public get end(): boolean {
    return 'end' === this._token;
  }

  public get label(): string {
    return this._label;
  }

  private _match(token: Token, pattern: RegExp): boolean {
    const result = pattern.exec(this._input);
    if (result) {
      this._label = result[0];
      this._input = this._input.substr(this._label.length);
      this._token = token;
      return true;
    } else {
      return false;
    }
  }

  public next(): Token {
    switch (true) {
    case this._match('undefined', /^undefined/):
    case this._match('true', /^true/):
    case this._match('false', /^false/):
    case this._match('name', /^[A-Za-z_][A-Za-z0-9_]*/):
    case this._match('number', /^[0-9]+/):
      return this._token;
    default:
      throw new MVC.SyntaxError(this.originalInput);
    }
  }

  public expect(...tokens: Token[]): string {
    for (var i = 0; i < tokens.length; i++) {
      if (this._token === tokens[i]) {
        const label = this._label;
        this.next();
        return label;
      }
    }
    throw new MVC.SyntaxError(this.originalInput);
  }
}
