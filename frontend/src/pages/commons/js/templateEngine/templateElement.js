import { BindedAttr, EffectiveElement } from './effectiveElement.js';
class TemplateElement {
  templatePath;
  tagName;
  script;
  effectiveElements;

  // prettier-ignore
  constructor(templatePath, tagName, script = undefined, effectiveElements = []) {
    this.templatePath = templatePath;
    this.tagName = tagName;
    this.script = script;
    this.effectiveElements = effectiveElements;
  }

  // prettier-ignore
  addEffectiveElement(element){
    const el = new EffectiveElement(element)
    this.effectiveElements.push(el)
    return el
  }

  findBindedElement(element) {
    if (!this.effectiveElements) return;
    for (const ee of this.effectiveElements) {
      if (!ee.BindedAttrList) return;
      for (ba of ee.BindedAttrList) {
        if (ba.elementsBinded.includes(element)) return true;
      }
    }
    return false;
  }
}

export default TemplateElement;
