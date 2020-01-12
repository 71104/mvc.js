/// <reference path="Common.ts" />


namespace MVC {
export namespace Controllers {


export interface ControllerInterface {
  $destroy?(): void;
}


export type ControllerHandler = (event: Event) => void;
export type ControllerHandlers = {[name: string]: ControllerHandler};


export interface ControllerConstructor {
  new (model: Dictionary): ControllerInterface;
}


const _REGISTRY: {[name: string]: ControllerConstructor} = Object.create(null);


export function register(
    nameOrController: string | ControllerConstructor,
    maybeController?: ControllerConstructor): void
{
  const [name, controller] = (function (): [string, ControllerConstructor] {
    if (typeof nameOrController !== 'string') {
      return [nameOrController.name, nameOrController];
    } else {
      return [nameOrController, maybeController!];
    }
  }());
  if (name in _REGISTRY) {
    throw new Error(`controller "${name}" has already been registered`);
  } else {
    _REGISTRY[name] = controller;
  }
}


export function lookup(name: string): ControllerConstructor {
  if (name in _REGISTRY) {
    return _REGISTRY[name];
  } else {
    throw new Error(`controller "${name}" doesn't exist`);
  }
}


export function unregister(nameOrController: string | ControllerConstructor): ControllerConstructor {
  const name = typeof nameOrController !== 'string' ? nameOrController.name : nameOrController;
  if (name in _REGISTRY) {
    const controllerConstructor = _REGISTRY[name];
    delete _REGISTRY[name];
    return controllerConstructor;
  } else {
    throw new Error(`controller "${name}" doesn't exist`);
  }
}


}  // namespace Controllers
}  // namespace MVC


type ControllerHandler = MVC.Controllers.ControllerHandler;
type ControllerHandlers = MVC.Controllers.ControllerHandlers;
type ControllerInterface = MVC.Controllers.ControllerInterface;
type ControllerConstructor = MVC.Controllers.ControllerConstructor;


class NullController implements ControllerInterface {
  public static readonly INSTANCE: NullController = new NullController();
}


class ControllerFrame {
  public constructor(
      private readonly _parent: ControllerFrame | null,
      private readonly _controller: ControllerInterface) {}

  public static create(): ControllerFrame {
    return new ControllerFrame(null, NullController.INSTANCE);
  }

  public push(controller: ControllerInterface): ControllerFrame {
    return new ControllerFrame(this, controller);
  }

  public lookup(handlerName: string): ControllerHandler | null {
    const handler = (<ControllerHandlers>this._controller)[handlerName];
    if (handler) {
      return handler;
    } else if (this._parent) {
      return this._parent.lookup(handlerName);
    } else {
      return null;
    }
  }
}
