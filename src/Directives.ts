/// <reference path="Model.ts" />
/// <reference path="Parser.ts" />


type DirectiveInterface = MVC.Directives.DirectiveInterface;
type DirectiveChainer = MVC.Directives.DirectiveChainer;


class RootDirective implements DirectiveInterface {
  public static readonly NAME: string = 'root';

  public matches(element: Element): boolean {
    return true;
  }

  public bind(model: Model, element: Element): Element[] {
    return [element];
  }

  public unbind(element: Element): void {}
}


class BindDirective implements DirectiveInterface {
  public static readonly NAME: string = 'bind';

  public constructor(private readonly _next: DirectiveChainer) {}

  public matches(element: Element): boolean {
    return true;
  }

  public bind(model: Model, element: Element): Element[] {
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      if (!attribute.name.startsWith('mvc-')) {
        const expression = MVC.Expressions.interpolate(attribute.value);
        const freePaths = expression.getFreePaths();
        if (freePaths.length) {
          // TODO
        } else {
          const compiledExpression = MVC.Expressions.compile(expression);
          attribute.value = String(compiledExpression.call(model.proxy));
        }
      }
    }
    return this._next(model, element);
  }

  public unbind(element: Element): void {
    // TODO
  }
};


namespace MVC {
export namespace Directives {


export interface DirectiveInterface {
  matches(element: Element): boolean;
  bind(model: Model, element: Element): Element[];
  unbind(element: Element): void;
}


export type DirectiveChainer = (model: Model, element: Element) => Element[];


export interface DirectiveConstructorInterface {
  new (next: DirectiveChainer): DirectiveInterface;
  NAME: string;
}


export const REGISTRY: MVC.Directives.DirectiveConstructorInterface[] = [
  BindDirective,
];


}  // namespace Directives
}  // namespace MVC
