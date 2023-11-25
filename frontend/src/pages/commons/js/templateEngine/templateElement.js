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

  findEffectiveElementByElementBinded(element, attrName) {
    if (!this.effectiveElements) return;
    for (const ee of this.effectiveElements) {
      if (ee.bindedAttrList.lenght <= 0) return;
      for (const ba of ee.bindedAttrList) {
        if (ba.elementsBinded.lenght <= 0) continue;
        if (ba.attrName != attrName) continue;
        for (const el of ba.elementsBinded) {
          if (el == element) return ee;
        }
      }
    }
  }
}

export default TemplateElement;
