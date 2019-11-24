namespace MVC {


export type Dictionary = {[key: string]: any};


export class SyntaxError extends Error {
  public constructor(input: string) {
    super(`unrecognized syntax in expression "${input}"`);
  }
}


}  // namespace MVC


type Dictionary = MVC.Dictionary;


function flatten<ElementType>(...elements: (ElementType | ElementType[])[]): ElementType[] {
  const array: ElementType[] = [];
  return array.concat(...elements);
}
