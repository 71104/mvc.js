/// <reference path="Compiler.ts" />


namespace MVC {


function _bindDefault() {
  window.removeEventListener('DOMContentLoaded', _bindDefault, false);
  const elements = document.querySelectorAll('[mvc-app]');
  if (elements.length > 1) {
    throw new Error(`${elements.length} elements tagged with 'mvc-app' have been detected (there can be only 1)`);
  } else if (elements.length > 0) {
    MVC.bind({}, elements[0]);
  }
}

window.addEventListener('DOMContentLoaded', _bindDefault, false);


}  // namespace MVC
