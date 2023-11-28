('use strict');
import TemplateElement from './templateElement.js';
import { EffectiveElement, BindedAttr } from './effectiveElement.js';

const templateElements = [];
let templateObserver = undefined;
let pendingObserverElements = [];
const observerconfig = { childList: true, subtree: true, attributes: false };
const childObserverconfig = {
  childList: true,
  subtree: true,
  attributes: true,
};

const handleMutation = async function (mutationsList) {
  console.log('mutation');
  if (templateObserver) templateObserver.disconnect();
  if (mutationsList) {
    for (const mutation of mutationsList) {
      console.log(mutation);
      if (mutation.type === 'childList') {
        reset();
        const customTag = document.querySelector('custom-tag');
        console.log(customTag);
        // await createElements();
        // console.log(templateElements);
      }
    }
  }
  if (templateObserver) templateObserver.observe(document, observerconfig);
};

const reset = function () {
  templateObserver = undefined;
  pendingObserverElements = [];
  for (const templateElement of templateElements) {
    console.log(templateElement.effectiveElements);
    templateElement.removeEffectiveElements();
    console.log('----------------------------------------');
    console.log(templateElement.effectiveElements);
    console.log('****************************************');
  }
};

// ON PAGE CHANGE OBSERVER
export const startTemplateEngine = async function () {
  await createElements();
  // templateObserver.observe(document, observerconfig);
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
  reset();
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
const childMutationCallback = function (mutationsList, observer) {
  let element = undefined ;
  if (mutationsList.length <= 0) return;
  for (const mutation of mutationsList) {
    if (mutation.type == 'attributes') {
      element = mutation.target;
      observer.disconnect()
      const attrName = mutation.attributeName
      for (const templateElement of templateElements) {
        const effectiveElement = templateElement.findEffectiveElementByElementBinded(element, attrName);
        const attrValue = element.getAttribute(attrName)
        effectiveElement.element.setAttribute(attrName,attrValue)
      }
    }
  }
  if(element) observer.observe(element,childObserverconfig)
};

// prettier-ignore
const getCustomElementsBindedAttribute = async function (findedEl, effectiveEl, templateEl) {
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
        if(pendingObserverElements.includes(element)) return
        pendingObserverElements.push(element)
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

  for(const element of pendingObserverElements){
    const childObserver = new MutationObserver(childMutationCallback);
    childObserver.observe(element,childObserverconfig)
    const index = pendingObserverElements.indexOf(element);
    pendingObserverElements.splice(index, 1);
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
