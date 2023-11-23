export class EffectiveElement {
  element;
  bindedAttrList;
  constructor(element, bindedAttrList = []) {
    this.element = element;
    this.bindedAttrList = bindedAttrList;
  }

  addBindedAttr(elAttr, attrValue) {
    const bindedAttr = new BindedAttr(elAttr, attrValue);
    this.bindedAttrList.push(bindedAttr);
    return bindedAttr;
  }
}

export class BindedAttr {
  attrName;
  attrValue;
  elementsBinded;
  // prettier-ignore
  constructor(attrName , attrValue) {
    this.attrName = attrName;
    this.elementsBinded = [];
    this.attrValue = attrValue
  }
}
