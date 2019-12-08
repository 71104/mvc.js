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


function _bind(directiveIndex: number, model: Model, node: Node): DirectiveInterface {
  const registry = MVC.Directives.REGISTRY;
  const DirectiveConstructor = registry[directiveIndex % registry.length];
  return new DirectiveConstructor((model, node) => {
    return _bind(directiveIndex + 1, model, node);
  }, model, node);
}


export function bind(model: Dictionary, view: Element, controller: () => void): void {
  _bind(0, Model.create(model), view);
}


export function bindBody(model: Dictionary, controller: () => void): void {
  MVC.bind(model, document.body, controller);
}


}  // namespace MVC
