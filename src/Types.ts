namespace MVC {


export type Dictionary = {[key: string]: any};


export class SyntaxError extends Error {
  public constructor(input: string) {
    super(`unrecognized syntax in expression "${input}"`);
  }
}


}  // namespace MVC


type Dictionary = MVC.Dictionary;
