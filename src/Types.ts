type Dictionary = {[key: string]: any};

type PrimitiveValue = null | boolean | number | string;
type ArrayValue = PrimitiveValue[];
type DictionaryValue = {[key: string]: LiteralValue};
type LiteralValue = PrimitiveValue | ArrayValue | DictionaryValue;
