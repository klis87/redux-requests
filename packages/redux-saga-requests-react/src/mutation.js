import React from 'react';
import PropTypes from 'prop-types';

import { reactComponentPropType } from './propTypesValidators';

const Mutation = ({
  mutation,
  requestKey,
  children,
  component: Component,
  ...extraProps
}) => {
  const mutationObject = requestKey ? mutation[requestKey] : mutation;
  const loading = mutationObject ? mutationObject.pending > 0 : false;
  const error = mutationObject ? mutationObject.error : null;

  if (children) {
    return children({ loading, error, ...extraProps });
  }

  return <Component loading={loading} error={error} {...extraProps} />;
};

Mutation.propTypes = {
  children: PropTypes.func,
  component: reactComponentPropType('Mutation'),
  mutation: PropTypes.oneOfType([
    PropTypes.shape({
      error: PropTypes.any,
      pending: PropTypes.number.isRequired,
    }),
    PropTypes.objectOf(
      PropTypes.shape({
        error: PropTypes.any,
        pending: PropTypes.number.isRequired,
      }),
    ),
  ]).isRequired,
  requestKey: PropTypes.string,
};

export default Mutation;
