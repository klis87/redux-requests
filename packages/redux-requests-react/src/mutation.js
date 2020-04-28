import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getMutationSelector } from '@redux-requests/core';

import { reactComponentPropType } from './propTypesValidators';

const Mutation = ({
  type,
  selector,
  requestKey,
  children,
  component: Component,
  ...extraProps
}) => {
  const mutation = useSelector(
    selector || getMutationSelector({ type, requestKey }),
  );

  if (children) {
    return children(mutation);
  }

  return <Component mutation={mutation} {...extraProps} />;
};

Mutation.propTypes = {
  selector: PropTypes.func,
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  requestKey: PropTypes.string,
  children: PropTypes.func,
  component: reactComponentPropType('Mutation'),
};

export default Mutation;
