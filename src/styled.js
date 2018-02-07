import React from 'react';
import PropTypes from 'prop-types';
import {injectStylePrefixed} from 'styletron-utils';

const STYLETRON_KEY = '__STYLETRON';
const toCamelCase = str => str.replace(/-([a-z])/g, ([, x]) => x.toUpperCase());
const omit$Props = source => Object
  .keys(source)
  .filter(([s]) => s !== '$')
  .reduce((res, k) => { res[k] = source[k]; return res; }, {});

function assign(target, source) {
  for (const key in source) {
    const val = source[key];
    if (typeof val === 'object') {
      target[key] = target[key] || {};
      target[key] = Object.assign(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

function assignProps(styletron, styleResult, ownProps) {
  let {className} = ownProps;
  const styleFromClassName = {};
  if (className) {
    const classNames = [];
    className.split(' ').forEach(cn => {
      const dec = styletron.getDeclarationFromClassName(cn);
      if (dec) {
        const {block, media, pseudo} = dec;
        const propName = media ? `@media ${media}` : pseudo;
        const [prop, val] = block.split(':');
        const node = {[toCamelCase(prop)]: val};
        assign(styleFromClassName, propName ? {[propName]: node} : node);
      } else {
        classNames.push(cn);
      }
    });
    className = classNames.join(' ');
  }
  const styletronClassName = injectStylePrefixed(
    styletron,
    assign(styleResult, styleFromClassName),
  );

  if (ownProps.styleProps) {
    delete ownProps.styleProps;
  }

  ownProps.className = className
    ? `${className} ${styletronClassName}`
    : styletronClassName;
  return ownProps;
}

function createStyledElementComponent(base, stylesArray) {
  function StyledElement(props, context) {
    const ownProps = Object.assign({}, props);
    delete ownProps.innerRef;

    const styleResult = {};
    StyledElement[STYLETRON_KEY].styles.forEach(style => {
      if (typeof style === 'function') {
        assign(styleResult, style(ownProps, context));
      } else if (typeof style === 'object') {
        assign(styleResult, style);
      }
    });

    let elementProps = assignProps(context.styletron, styleResult, ownProps);

    elementProps = omit$Props(elementProps);

    if (props.innerRef) {
      elementProps.ref = props.innerRef;
    }

    return React.createElement(StyledElement[STYLETRON_KEY].tag, elementProps);
  }

  StyledElement[STYLETRON_KEY] = {
    tag: base,
    styles: stylesArray,
  };

  StyledElement.contextTypes = Object.assign({}, base.contextTypes);
  StyledElement.contextTypes.styletron = PropTypes.object;

  if (process.env.NODE_ENV !== 'production') {
    const name = base.displayName
      ? base.displayName
      : typeof base === 'function' ? base.name : base;
    StyledElement.displayName = `Styled${name ? `(${name})` : ''}`;
  }

  return StyledElement;
}

function core(style, base) {
  if (typeof base === 'function' && base[STYLETRON_KEY]) {
    const {tag, styles} = base[STYLETRON_KEY];
    return createStyledElementComponent(tag, styles.concat(style));
  }
  if (typeof base === 'string' || typeof base === 'function') {
    return createStyledElementComponent(base, [style]);
  }
  throw new Error('`styled` takes either a DOM element name or a component');
}

export default (...params) => params.length === 2
  ? core(...params)
  : base => core(params[0], base);
