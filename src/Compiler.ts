/// <reference path="Common.ts" />
/// <reference path="Model.ts" />
/// <reference path="Directives.ts" />
/// <reference path="Controllers.ts" />
/// <reference path="dir/Bind.ts" />
/// <reference path="dir/Controller.ts" />
/// <reference path="dir/For.ts" />
/// <reference path="dir/If.ts" />
/// <reference path="dir/Include.ts" />
/// <reference path="dir/On.ts" />
/// <reference path="dir/Root.ts" />
/// <reference path="dir/With.ts" />


namespace MVC {


export namespace Directives {


export const REGISTRY: DirectiveConstructorInterface[] = [
  WithDirective,
  ForDirective,
  IfDirective,
  ControllerDirective,
  IncludeDirective,
  OnDirective,
  BindDirective,
  RootDirective,
];


}  // namespace Directives


function _bind(directiveIndex: number, model: Model, node: Node, controllers: ControllerFrame): DirectiveInterface {
  const registry = MVC.Directives.REGISTRY;
  const DirectiveConstructor = registry[directiveIndex % registry.length];
  if (DirectiveConstructor.matches(node)) {
    return new DirectiveConstructor((model, node, controllers) => {
      return _bind(directiveIndex + 1, model, node, controllers);
    }, model, node, controllers);
  } else {
    return _bind(directiveIndex + 1, model, node, controllers);
  }
}


export function bind(model: Dictionary, view: Element): void {
  _bind(0, Model.create(model), view, ControllerFrame.create());
}


export function bindBody(model: Dictionary): void {
  MVC.bind(model, document.body);
}


}  // namespace MVC
