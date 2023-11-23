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
}

export default TemplateElement;
