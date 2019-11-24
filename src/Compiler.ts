/// <reference path="Common.ts" />
/// <reference path="Model.ts" />
/// <reference path="Directives.ts" />


namespace MVC {


export function bind(model: Dictionary, view: Element, controller: () => void): void {
  // TODO
}


export function bindBody(model: Dictionary, controller: () => void): void {
  MVC.bind(model, document.body, controller);
}


}  // namespace MVC
