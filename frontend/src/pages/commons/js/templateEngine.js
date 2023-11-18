'use strict';
const registeredElements = [];
let templateObserver = undefined;
const observerconfig = { childList: true, subtree: false };

const handleMutation = async function (mutationsList) {
  if (templateObserver) templateObserver.disconnect();

  if (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
      }
    }
  }
  if (templateObserver) templateObserver.observe(document, observerconfig);
};

/**
 * this function is used i js mutation Observer and search for
 * elements to load template
 */
const createElements = async function () {
  console.log('inizio registrazione');
  if (registeredElements.length > 0) {
    for (const registeredElement of registeredElements) {
      try {
        const findedEls = document.querySelectorAll(registeredElement.tagName);
        registeredElement.count = findedEls.length;
        // prettier-ignore
        console.log(`trovat ${registeredElement.count} elementi del tipo ${registeredElement.tagName}`)

        for (let [index, findedEl] of findedEls.entries()) {
          // if after change happens in the page if custom element are not preset also the script will be remved
          // prettier-ignore
          // if (!findedEl) {
          //   for (let script of registeredScripts) {
          //     if (script.tagName == registeredElement.tagName)  document.removeChild(script.script);
          //   }
          //   return;
          // }

          if (findedEl.innerHTML.trim() == '') {
            console.log(`il ${index} elemento è vuoto inizio la procedura`)
            const template = await fetch(registeredElement.templatePath);
            const text = await template.text();
            findedEl.innerHTML = text;

            /**
             * for security reasons whe an element is dinamically imported via innerHtml, all script contained in the element will not be activated
             * for security reason !
             *
             * in order to make the scripts work you have to unpack the scripts and put the script in a new script element, the put the new script inside your tag
             *
             * TODO per ragioni  di sicurezza verificare che uno script non provenga da fonti esterne
             */
          
            const script = findedEl.querySelector(`script`);
            findedEl.removeChild(script);


    
    
    
            if (index == findedEls.length - 1 && !registeredElement.scriptLoaded) {
              console.log('registro', index , findedEls.length)
              const newScript = document.createElement('script');
              console.log('nuovo script creato ', newScript)
              newScript.innerHTML = script.innerHTML;
              document.querySelector('body').appendChild(newScript);
              console.log('appendo lo script al body', document.querySelector('body'))
              registeredElement.scriptLoaded = true;
              registeredElement.script = newScript;
            }
          }
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }
  }
};

// ON PAGE CHANGE OBSERVER
export const startTemplateEngine = async function () {
  await createElements();
  templateObserver = new MutationObserver(handleMutation);
  templateObserver.observe(document, observerconfig);
};

// prettier-ignore
export const registerTemplateElement = function (tagName, templatePath) {
  const el = { templatePath: templatePath, tagName: tagName, scriptLoaded : false , script : undefined, count : 0};
  registeredElements.push(el);
};
