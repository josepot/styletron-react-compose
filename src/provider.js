import React from 'react';
import PropTypes from 'prop-types';

class StyletronProvider extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.styletron = props.styletron;
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
