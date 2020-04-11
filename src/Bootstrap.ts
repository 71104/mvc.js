/// <reference path="Compiler.ts" />


namespace MVC {


function _registerTemplates() {
  const elements = document.querySelectorAll('template');
  Array.from(elements).forEach(element => {
    element.parentNode?.removeChild(element);
    try {
      MVC.Templates.register(element.id, {
        fragment: element.content,
      });
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
    MVC.bind({}, elements[0]);
  }
}


function _bindDefault() {
  window.removeEventListener('DOMContentLoaded', _bindDefault, false);
  _registerTemplates();
  _bootstrap();
}

window.addEventListener('DOMContentLoaded', _bindDefault, false);


}  // namespace MVC
