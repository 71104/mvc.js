/// <reference path="Common.ts" />
/// <reference path="Model.ts" />
/// <reference path="Directives.ts" />
/// <reference path="dir/Bind.ts" />
/// <reference path="dir/If.ts" />
/// <reference path="dir/For.ts" />
/// <reference path="dir/Root.ts" />


namespace MVC {


export namespace Directives {


export const REGISTRY: DirectiveConstructorInterface[] = [
  ForDirective,
  IfDirective,
  BindDirective,
  RootDirective,
];


}  // namespace Directives


export function bind(model: Dictionary, view: Element, controller: () => void): void {
  // TODO
}


export function bindBody(model: Dictionary, controller: () => void): void {
  MVC.bind(model, document.body, controller);
}


}  // namespace MVC
