/// <reference path="Templates.ts" />


namespace MVC {
export namespace Components {


const _REGISTRY: {[name: string]: string} = Object.create(null);


function _getCanonicalName(name: string): string {
  const canonicalName = name.toLowerCase();
  if (/^[a-z]([a-z-]*[a-z])?$/.test(canonicalName)) {
    return canonicalName;
  } else {
    throw new Error(`invalid component name: ${JSON.stringify(name)}`);
  }
}


function _checkName(name: string): string {
  const canonicalName = _getCanonicalName(name);
  if (canonicalName in _REGISTRY) {
    throw new Error(`double registration for template "${canonicalName}"`);
  } else {
    return canonicalName;
  }
}


export function register(name: string, templateName: string): void {
  _REGISTRY[_checkName(name)] = templateName;
}


export function registerFromString(name: string, template: string): void {
  const canonicalName = _checkName(name);
  MVC.Templates.registerFromString(canonicalName, template);
  _REGISTRY[canonicalName] = canonicalName;
}


export function registerTrimmedString(name: string, template: string): void {
  const canonicalName = _checkName(name);
  MVC.Templates.registerTrimmedString(canonicalName, template);
  _REGISTRY[canonicalName] = canonicalName;
}


export function isValid(name: string): boolean {
  return name.toLowerCase() in _REGISTRY;
}


export function lookupTemplate(name: string): DocumentFragment {
  const canonicalName = _getCanonicalName(name);
  if (canonicalName in _REGISTRY) {
    return MVC.Templates.lookup(_REGISTRY[canonicalName]);
  } else {
    throw new Error(`invalid template name: "${canonicalName}"`);
  }
}


}  // namespace Components
}  // namespace MVC
