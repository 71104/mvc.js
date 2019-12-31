namespace MVC {
export namespace Templates {


const _REGISTRY: {[name: string]: DocumentFragment} = Object.create(null);


export function register(name: string, fragment: DocumentFragment): void {
  if (name in _REGISTRY) {
    throw new Error(`double registration for template "${name}"`);
  } else {
    _REGISTRY[name] = fragment;
  }
}


export function registerFromString(name: string, content: string): void {
  if (name in _REGISTRY) {
    throw new Error(`double registration for template "${name}"`);
  } else {
    const template = document.createElement('template');
    template.innerHTML = content;
    _REGISTRY[name] = template.content;
  }
}


export function registerTrimmedString(name: string, content: string): void {
  registerFromString(name, content.trim());
}


export function lookup(name: string): DocumentFragment {
  if (name in _REGISTRY) {
    return _REGISTRY[name];
  } else {
    throw new Error(`invalid template name: "${name}"`);
  }
}


}  // namespace Templates
}  // namespace MVC
