/// <reference path="Model.ts" />
/// <reference path="Parser.ts" />


type DirectiveInterface = MVC.Directives.DirectiveInterface;
type DirectiveChainer = MVC.Directives.DirectiveChainer;
type DirectiveConstructorInterface = MVC.Directives.DirectiveConstructorInterface;


class RootDirective implements DirectiveInterface {
  public static readonly NAME: string = 'root';

  public static matches(element: Element): boolean {
    return true;
  }

  public constructor() {}

  public destroy(): void {}
}


class BindDirective implements DirectiveInterface {
  public static readonly NAME: string = 'bind';

  public static matches(element: Element): boolean {
    return true;
  }

  public constructor(
      public readonly next: DirectiveChainer,
      public readonly model: Model,
      public readonly element: Element)
  {
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      if (!attribute.name.startsWith('mvc-')) {
        const expression = MVC.Expressions.interpolate(attribute.value);
        if (!expression.isAllStatic()) {
          const compiledExpression = MVC.Expressions.compileSafe(expression);
          attribute.value = compiledExpression.call(model.proxy);
          const freePaths = expression.getFreePaths();
          if (freePaths.length) {
            // TODO
          }
        }
      }
    }
    next(model, element);
  }

  public destroy(): void {
    // TODO
  }
};


namespace MVC {
export namespace Directives {


export interface DirectiveInterface {
  destroy(): void;
}


export type DirectiveChainer = (model: Model, element: Element) => void;


export interface DirectiveConstructorInterface {
  NAME: string;
  matches(element: Element): boolean;
  new (next: MVC.Directives.DirectiveChainer, model: Model, element: Element): MVC.Directives.DirectiveInterface;
}


export const REGISTRY: MVC.Directives.DirectiveConstructorInterface[] = [
  BindDirective,
];


}  // namespace Directives
}  // namespace MVC
