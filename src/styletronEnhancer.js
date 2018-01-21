export default StyletronClass => class Styletron extends StyletronClass {
  constructor(...args) {
    super(...args);
    this.declarations = {};
  }

  injectRawDeclaration(decl) {
    const cn = super.injectRawDeclaration(decl);
    this.declarations[cn] = decl;
    return cn;
  }

  getDeclarationFromClassName(cn) {
    return this.declarations[cn];
  }
};
