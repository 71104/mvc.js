/// <reference path="Templates.ts" />


namespace MVC {
export namespace Components {


const _REGISTRY: {[name: string]: string} = Object.create(null);


export function register(name: string, templateName: string): void {
  const canonicalName = name.toLowerCase();
  if (canonicalName in _REGISTRY) {
    throw new Error(`double registration for template "${canonicalName}"`);
  } else {
    _REGISTRY[canonicalName] = templateName;
  }
}


export function registerFromString(name: string, template: string): void {
  const canonicalName = name.toLowerCase();
  if (canonicalName in _REGISTRY) {
    throw new Error(`double registration for template "${canonicalName}"`);
  } else {
    MVC.Templates.registerFromString(canonicalName, template);
    _REGISTRY[canonicalName] = canonicalName;
  }
}


export function registerTrimmedString(name: string, template: string): void {
  const canonicalName = name.toLowerCase();
  if (canonicalName in _REGISTRY) {
    throw new Error(`double registration for template "${canonicalName}"`);
  } else {
    MVC.Templates.registerTrimmedString(canonicalName, template);
    _REGISTRY[canonicalName] = canonicalName;
  }
}


export function isValid(name: string): boolean {
  return name.toLowerCase() in _REGISTRY;
}


export function lookupTemplate(name: string): DocumentFragment {
  const canonicalName = name.toLowerCase();
  if (canonicalName in _REGISTRY) {
    return MVC.Templates.lookup(_REGISTRY[canonicalName]);
  } else {
    throw new Error(`invalid template name: "${canonicalName}"`);
  }
}


}  // namespace Components
}  // namespace MVC
