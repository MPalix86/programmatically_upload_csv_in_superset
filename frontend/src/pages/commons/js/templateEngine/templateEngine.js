('use strict');
import TemplateElement from './templateElement.js';
import { EffectiveElement, BindedAttr } from './effectiveElement.js';

const templateElements = [];
let templateObserver = undefined;
const elObserverList = [];
const observerconfig = { childList: true, subtree: false, attributes: false };
const childObserverconfig = {
  childList: true,
  subtree: true,
  attributes: true,
};
const idAttrName = 'data-template-engine-id';
let id = 0;

const getId = function () {
  return ++id;
};

const handleMutation = async function (mutationsList) {
  if (templateObserver) templateObserver.disconnect();

  if (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        createElements();
        console.log('childListMutation');
      } else if (mutation.type === 'attributes') {
        console.log('attributes mutation');
      }
    }
  }
  if (templateObserver) templateObserver.observe(document, observerconfig);
};

// ON PAGE CHANGE OBSERVER
export const startTemplateEngine = async function () {
  await createElements();
  templateObserver = new MutationObserver(handleMutation);
  templateObserver.observe(document, observerconfig);
};

export const registerTemplateElement = function (tagName, templatePath) {
  const templateElement = new TemplateElement(templatePath, tagName);
  templateElements.push(templateElement);
};

/**
 * this function is used i js mutation Observer and search for
 * elements to load template
 */
const createElements = async function () {
  // prettier-ignore
  const verifyBindings = function () {
    for (const templateElement of templateElements) {
      if (templateElement.effectiveElements.length <= 0) return;
      for (const effectiveEl of templateElement.effectiveElements) {
        if (!effectiveEl.bindedAttrList) return;
        for (const bindedAttr of effectiveEl.bindedAttrList) {
          if (bindedAttr.elementsBinded.length <= 0)
            console.warn(`TEMPLATE_ENGINE WARNING attribute ${bindedAttr.attrName} from element ${effectiveEl.element.tagName} has no internal attribute binded`);
        }
      }
    }
  };

  if (templateElements.length > 0) {
    for (const templateElement of templateElements) {
      try {
        const findedEls = document.querySelectorAll(templateElement.tagName);
        templateElement.count = findedEls.length;
        // prettier-ignore

        for (let [index, findedEl] of findedEls.entries()) {
          if (findedEl.innerHTML.trim() == '') {
            const template = await fetch(templateElement.templatePath);
            const text = await template.text();
            findedEl.innerHTML = text;

            /**
             * for security reasons whe an element is dinamically imported via innerHtml, all script contained in the element will not be activated
             * for security reason !import { EffectiveElement } from './effectiveElement';

             *
             * in order to make the scripts work you have to unpack the scripts and put the script in a new script element, the put the new script inside your tag
             *
             * TODO per ragioni  di sicurezza verificare che uno script non provenga da fonti esterne
             */

            const script = findedEl.querySelector(`script`);
            findedEl.removeChild(script);

            // prettier-ignore
            if (index == findedEls.length - 1 && !templateElement.script ) {
              const newScript = document.createElement('script');
              newScript.innerHTML = script.innerHTML;
              document.querySelector('body').appendChild(newScript);
              templateElement.scriptLoaded = true;
              templateElement.script = newScript;
            }
            // prettier-ignore
            const effectiveEl = templateElement.addEffectiveElement(findedEl);
            // await manageChildrenAttributeBinding(templateElement, findedEl);
            // prettier-ignore
            await getCustomElementsBindedAttribute(findedEl, effectiveEl, templateElement);
  
            verifyBindings()
          }
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }
  }
};

// prettier-ignore
const getCustomElementsBindedAttribute = async function (findedEl, effectiveEl, templateEl) {

  const childMutationCallback = function(mutationsList, observer){
    if(mutationsList.length <=  0) return
    for(const mutation of mutationsList){
      console.log(mutation)
      console.log('callback')
    }

  }


  // prettier-ignore
  const getChildrenElementsBindedAttribute = async function (effectiveEl, element, bindedAttr) {
    const children = element.children
    if(!children)return

    for(const child of children ) {
      getChildrenElementsBindedAttribute(effectiveEl,child,bindedAttr)
    } 

    if(element == effectiveEl.element || !element.attributes) return
    for(const childAttr of element.attributes){
      const noBracketsAttr = identifySpecialAttribute(childAttr.name);
      if (!noBracketsAttr) continue;
      if(noBracketsAttr.realName == bindedAttr.attrName){
        element.removeAttribute(noBracketsAttr.bracketName)
        element.setAttribute(noBracketsAttr.realName ,bindedAttr.attrValue);
        bindedAttr.elementsBinded.push(element)
        console.log('idattrname' , element.dataset[idAttrName])
        
        let booleanValue = element.dataset.templateEngineHasObserver === 'true';
        if(booleanValue) return 
         element.setAttribute('data-template-engine-has-observer' ,true);
        
        
   

        // const childObserver = new MutationObserver(childMutationCallback);
        // console.log('osservo' , element)
        // childObserver.observe(element, childObserverconfig)
   
      }
    }

  

  };



  /** 
   * se non si copia l'array degli attributi e si usa nel ciclo findedEl.attributes ogni volta succede che
   * ogni volta che eliminiamo un attr dall'elelemnto findedEl.attributes stesso viene modificato e quindi una volta letto
   * al ciclo successivo non  è piu lo stesso di prima portando a comportamenti inaspettati
   */
  const attributes = [...findedEl.attributes]

  for (const attr of attributes) {
    const noBracketsAttr = identifySpecialAttribute(attr.name);
    if (!noBracketsAttr) continue;
    findedEl.removeAttribute(attr.name);
    findedEl.setAttribute(noBracketsAttr.realName ,attr.value);
    const bindedAttr = effectiveEl.addBindedAttr(noBracketsAttr.realName, attr.value);
    await getChildrenElementsBindedAttribute(effectiveEl,findedEl,bindedAttr)
  }  


};

const identifySpecialAttribute = function (inputString) {
  const regex = /\[([^\]]+)\]/g;

  const matches = inputString.match(regex);

  if (matches) {
    for (const match of matches) {
      return { bracketName: match, realName: match.slice(1, -1) };
    }
  } else return undefined;
};