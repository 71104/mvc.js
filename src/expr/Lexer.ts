/// <reference path="../Common.ts" />


type Token = 'begin'
  | 'undefined'
  | 'true'
  | 'false'
  | 'name'
  | 'dot'
  | 'number'
  | 'string'
  | 'operator'
  | 'left'
  | 'right'
  | 'left-square'
  | 'right-square'
  | 'pipe'
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

  private _read(pattern: RegExp): string | null {
    const result = pattern.exec(this._input);
    if (result) {
      const label = result[0];
      this._input = this._input.substr(label.length);
      return label;
    } else {
      return null;
    }
  }

  private _match(token: Token, pattern: RegExp): boolean {
    const label = this._read(pattern);
    if (null !== label) {
      this._label = label;
      this._token = token;
      return true;
    } else {
      return false;
    }
  }

  public next(): Token {
    if (!this._input.length) {
      this._label = '';
      return this._token = 'end';
    }
    if (null !== this._read(/^\s+/)) {
      return this.next();
    }
    switch (true) {
    case this._match('undefined', /^undefined/):
    case this._match('true', /^true/):
    case this._match('false', /^false/):
    case this._match('operator', /^in\b/):
    case this._match('name', /^[A-Za-z_][A-Za-z0-9_]*/):
    case this._match('dot', /^\./):
    case this._match('number', /^[0-9]+/):
    case this._match('string', /^"([^"](\\"))*"/):
    case this._match('string', /^'([^'](\\'))*'/):
    case this._match('operator', /^\>\>\>|\=\=\=|\!\=\=/):
    case this._match('operator', /^\*\*|\<\<|\>\>|\<\=|\>\=|\=\=|\!\=|\?\?|\&\&|\|\|/):
    case this._match('operator', /^\+|\-|\*|\/|\%|\<|\>|\!/):
    case this._match('left', /^\(/):
    case this._match('right', /^\)/):
    case this._match('left-square', /^\[/):
    case this._match('right-square', /^\]/):
    case this._match('pipe', /^\|/):
      return this._token;
    default:
      throw new MVC.SyntaxError(this.originalInput);
    }
  }

  public step(expected: Token): boolean {
    if (expected !== this._token) {
      return false;
    } else {
      this.next();
      return true;
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
