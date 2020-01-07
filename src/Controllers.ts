/// <reference path="Common.ts" />


namespace MVC {
export namespace Controllers {


export interface ControllerInterface {
  $destroy?(): void;
}


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


type ControllerInterface = MVC.Controllers.ControllerInterface;
type ControllerConstructor = MVC.Controllers.ControllerConstructor;
