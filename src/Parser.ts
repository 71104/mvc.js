/// <reference path="Lexer.ts" />
/// <reference path="AST.ts" />


namespace MVC {
namespace Expressions {
namespace Parsing {


export class Parser {
  private readonly _lexer: Lexer;

  public constructor(public readonly input: string) {
    this._lexer = new Lexer(input);
  }
}


}  // namespace Parsing
}  // namespace Expressions
}  // namespace MVC
