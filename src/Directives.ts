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


class ExpressionWatcher {
  public constructor(
      public readonly path: string[],
      public readonly handler: EventHandler) {}
}


class BindDirective implements DirectiveInterface {
  public static readonly NAME: string = 'bind';

  private readonly _watchers: ExpressionWatcher[] = [];

  public static matches(element: Element): boolean {
    return true;
  }

  public constructor(
      public readonly next: DirectiveChainer,
      private readonly _model: Model,
      public readonly element: Element)
  {
    const model = this._model;
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      if (!attribute.name.startsWith('mvc-')) {
        const expression = MVC.Expressions.interpolate(attribute.value);
        if (!expression.isAllStatic()) {
          const compiledExpression = MVC.Expressions.compileSafe(expression);
          attribute.value = compiledExpression.call(model.proxy);
          expression.getFreePaths().forEach(freePath => {
            const path = freePath.bind(model.proxy);
            const handler = (value: any): void => {
              attribute.value = compiledExpression.call(model.proxy);
            };
            this._watchers.push(new ExpressionWatcher(path, handler));
            this._model.on(path, handler);
          }, this);
        }
      }
    }
    this.next(model, element);
  }

  public destroy(): void {
    this._watchers.forEach(({path, handler}) => {
      this._model.off(path, handler);
    }, this);
    this._watchers.length = 0;
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
