/// <reference path="Model.ts" />
/// <reference path="dir/Bind.ts" />
/// <reference path="dir/If.ts" />


type DirectiveInterface = MVC.Directives.DirectiveInterface;
type DirectiveChainer = MVC.Directives.DirectiveChainer;
type DirectiveConstructorInterface = MVC.Directives.DirectiveConstructorInterface;


class RootDirective implements DirectiveInterface {
  public static readonly NAME: string = 'root';

  public static matches(node: Node): boolean {
    return true;
  }

  public constructor() {}

  public destroy(): void {}
}


namespace MVC {
export namespace Directives {


export interface DirectiveInterface {
  destroy(): void;
}


export type DirectiveChainer = (model: Model, node: Node) => DirectiveInterface;


export interface DirectiveConstructorInterface {
  NAME: string;
  matches(node: Node): boolean;
  new (next: MVC.Directives.DirectiveChainer, model: Model, node: Node): MVC.Directives.DirectiveInterface;
}


export const REGISTRY: MVC.Directives.DirectiveConstructorInterface[] = [
  IfDirective,
  BindDirective,
];


}  // namespace Directives
}  // namespace MVC
