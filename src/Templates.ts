namespace MVC {
export namespace Templates {


const _REGISTRY: {[name: string]: DocumentFragment} = Object.create(null);


export type Options = {
  fragment?: DocumentFragment,
  content?: string,
  trim?: boolean,
};


export function register(name: string, options: Options): void {
  if (name in _REGISTRY) {
    throw new Error(
        `double registration for template ${JSON.stringify(name)}`);
  } else if (options.fragment) {
    if (options.content) {
      console.warn(
          `fragment specified for template ${JSON.stringify(name)}, ignoring content ${JSON.stringify(options.content)}.`);
    }
    _REGISTRY[name] = options.fragment;
  } else if (options.content) {
    const template = document.createElement('template');
    if (false !== options.trim) {
      template.innerHTML = options.content.trim();
    } else {
      template.innerHTML = options.content;
    }
    _REGISTRY[name] = template.content;
  } else {
    throw new Error(
        `no content specified for template ${JSON.stringify(name)}`);
  }
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
