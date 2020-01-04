/// <reference path="Compiler.ts" />


namespace MVC {


function _registerTemplates() {
  const elements = document.querySelectorAll('template');
  Array.from(elements).forEach(element => {
    try {
      MVC.Templates.register(element.id, element.content);
    } catch (e) {
      console.error(e);
    }
  });
}


function _bootstrap() {
  const elements = document.querySelectorAll('[mvc-app]');
  if (elements.length > 1) {
    throw new Error(`${elements.length} elements tagged with 'mvc-app' have been detected (there can be only 1)`);
  } else if (elements.length > 0) {
    const element = elements[0];
    MVC.bind({}, element);
    element.removeAttribute('mvc-cloak');
    element.className = element.className
        .split(' ')
        .filter(name => 'mvc-cloak' !== name)
        .join(' ');
  }
}


function _bindDefault() {
  window.removeEventListener('DOMContentLoaded', _bindDefault, false);
  _registerTemplates();
  _bootstrap();
}

window.addEventListener('DOMContentLoaded', _bindDefault, false);


}  // namespace MVC
