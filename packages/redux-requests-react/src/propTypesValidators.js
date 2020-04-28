import { isValidElementType } from 'react-is';

export const reactComponentPropType = componentName => (props, propName) => {
  if (props[propName] && !isValidElementType(props[propName])) {
    return new Error(
      `Invalid prop '${propName}' supplied to '${componentName}': the prop is not a valid React component`,
    );
  }

  return null;
};
