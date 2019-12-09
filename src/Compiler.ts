/// <reference path="Common.ts" />
/// <reference path="Model.ts" />
/// <reference path="Directives.ts" />
/// <reference path="Controllers.ts" />
/// <reference path="dir/Bind.ts" />
/// <reference path="dir/Controller.ts" />
/// <reference path="dir/For.ts" />
/// <reference path="dir/If.ts" />
/// <reference path="dir/On.ts" />
/// <reference path="dir/Root.ts" />
/// <reference path="dir/With.ts" />


namespace MVC {


export namespace Directives {


export const REGISTRY: DirectiveConstructorInterface[] = [
  WithDirective,
  ForDirective,
  IfDirective,
  BindDirective,
  ControllerDirective,
  RootDirective,
];


}  // namespace Directives


function _bind(directiveIndex: number, model: Model, node: Node): DirectiveInterface {
  const registry = MVC.Directives.REGISTRY;
  const DirectiveConstructor = registry[directiveIndex % registry.length];
  return new DirectiveConstructor((model, node) => {
    return _bind((directiveIndex + 1) % registry.length, model, node);
  }, model, node);
}


export function bind(model: Dictionary, view: Element): void {
  _bind(0, Model.create(model), view);
}


export function bindBody(model: Dictionary): void {
  MVC.bind(model, document.body);
}


}  // namespace MVC
