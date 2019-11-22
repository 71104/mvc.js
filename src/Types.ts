type Dictionary = {[key: string]: any};

type PrimitiveValue = null | boolean | number | string;
type ArrayValue = PrimitiveValue[];
type DictionaryValue = {[key: string]: LiteralValue};
type LiteralValue = PrimitiveValue | ArrayValue | DictionaryValue;


namespace MVC {

export class SyntaxError extends Error {
  public constructor(input: string) {
    super(`unrecognized syntax in expression "${input}"`);
  }
}

}  // namespace MVC
