import React from 'react';
import PropTypes from 'prop-types';

import { reactComponentPropType } from './propTypesValidators';

const OperationContainer = ({
  operation,
  requestKey,
  children,
  component: Component,
  ...extraProps
}) => {
  const operationObject = requestKey ? operation[requestKey] : operation;
  const loading = operationObject ? operationObject.pending > 0 : false;
  const error = operationObject ? operationObject.error : null;

  if (children) {
    return children({ loading, error, ...extraProps });
  }

  return <Component loading={loading} error={error} {...extraProps} />;
};

OperationContainer.propTypes = {
  children: PropTypes.func,
  component: reactComponentPropType('OperationContainer'),
  operation: PropTypes.oneOfType([
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

export default OperationContainer;
