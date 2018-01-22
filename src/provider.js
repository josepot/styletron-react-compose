import React from 'react';
import PropTypes from 'prop-types';

const extendStyletron = styletron => {
  styletron.declarations = {};

  const originalInjectRawDeclaration =
    styletron.injectRawDeclaration.bind(styletron);

  function injectRawDeclaration(decl) {
    const cn = originalInjectRawDeclaration(decl);
    this.declarations[cn] = decl;
    return cn;
  }

  function getDeclarationFromClassName(cn) {
    return this.declarations[cn];
  }

  styletron.injectRawDeclaration = injectRawDeclaration.bind(styletron);
  styletron.getDeclarationFromClassName =
    getDeclarationFromClassName.bind(styletron);

  return styletron;
}

class StyletronProvider extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.styletron = extendStyletron(props.styletron);
  }
  getChildContext() {
    return {styletron: this.styletron};
  }
  render() {
    return React.Children.only(this.props.children);
  }
}

StyletronProvider.propTypes = {
  styletron: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
};

StyletronProvider.childContextTypes = {
  styletron: PropTypes.object.isRequired,
};

export default StyletronProvider;
