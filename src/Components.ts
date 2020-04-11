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
    throw new Error(
        `double registration for template ${JSON.stringify(canonicalName)}`);
  } else {
    return canonicalName;
  }
}


export type Options = {
  templateName?: string,
  template?: string,
  trim?: boolean,
  controller?: ControllerInterface,
};


export function register(name: string, options: Options): void {
  const canonicalName = _checkName(name);
  if (options.template) {
    if (options.templateName) {
      console.warn(
          `template content specified for component ${JSON.stringify(name)}, ignoring templateName ${JSON.stringify(options.templateName)}.`);
    }
    MVC.Templates.register(canonicalName, {
      content: options.template,
      trim: options.trim,
    });
    _REGISTRY[canonicalName] = canonicalName;
  } else if (options.templateName) {
    _REGISTRY[canonicalName] = options.templateName;
  } else {
    throw new Error(
        `no template specified for component ${JSON.stringify(name)}`);
  }
}


export function isValid(name: string): boolean {
  return name.toLowerCase() in _REGISTRY;
}


export function lookupTemplate(name: string): DocumentFragment {
  const canonicalName = _getCanonicalName(name);
  if (canonicalName in _REGISTRY) {
    return MVC.Templates.lookup(_REGISTRY[canonicalName]);
  } else {
    throw new Error(`invalid template name: ${JSON.stringify(canonicalName)}`);
  }
}


}  // namespace Components
}  // namespace MVC
