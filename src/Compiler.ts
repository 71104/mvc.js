/// <reference path="Types.ts" />
/// <reference path="Model.ts" />
/// <reference path="Directives.ts" />


namespace MVC {


function buildDirectiveChain(index: number): DirectiveInterface {
  if (index < MVC.Directives.REGISTRY.length) {
    const DirectiveClass = MVC.Directives.REGISTRY[index];
    const next = buildDirectiveChain(index + 1);
    return new DirectiveClass((model, element) => {
      if (next.matches(element)) {
        return next.bind(model, element);
      } else {
        return [element];
      }
    });
  } else {
    return new RootDirective();
  }
}


export function compile(model: Model, element: Element, controller: () => void): Element[] {
  // TODO
  return [element];
}


export function bind(model: Dictionary, view: Element, controller: () => void): void {
  const parentNode = view.parentNode;
  if (!parentNode) {
    throw new Error('the specified Element is an orphan');
  }
  const nodeAfterLast = view.nextSibling;
  parentNode.removeChild(view);
  const newChildren = compile(new Model(model), view, controller);
  newChildren.forEach(child => parentNode.insertBefore(child, nodeAfterLast));
}


export function bindBody(model: Dictionary, controller: () => void): void {
  MVC.bind(model, document.body, controller);
}


}  // namespace MVC
