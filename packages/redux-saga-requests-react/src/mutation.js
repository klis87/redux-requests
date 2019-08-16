import React from 'react';
import PropTypes from 'prop-types';

import useMutation from './use-mutation';
import { reactComponentPropType } from './propTypesValidators';

const Mutation = ({
  requestSelector,
  type,
  requestKey,
  children,
  component: Component,
  ...extraProps
}) => {
  const mutation = useMutation({ requestSelector, type, requestKey });

  if (children) {
    return children(mutation);
  }

  return <Component mutation={mutation} {...extraProps} />;
};

Mutation.propTypes = {
  requestSelector: PropTypes.func,
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  requestKey: PropTypes.string,
  children: PropTypes.func,
  component: reactComponentPropType('Mutation'),
};

export default Mutation;
