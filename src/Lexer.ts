type Token = 'begin'
  | 'true'
  | 'false'
  | 'number'
  | 'string'
  | 'operator'
  | 'left'
  | 'right'
  | 'end';


class Lexer {
  private _offset: number = 0;
  private _token: Token = 'begin';
  private _label: string = '';

  public constructor(public readonly input: string) {}

  public get token(): Token {
    return this._token;
  }

  public get label(): string {
    return this._label;
  }
}
