import React from 'react';
import PropTypes from 'prop-types';

import { reactComponentPropType } from './propTypesValidators';

const RequestContainer = ({
  request,
  children,
  component: Component,
  isDataEmpty,
  showLoaderDuringRefetch,
  noDataMessage,
  errorComponent: ErrorComponent,
  errorComponentProps,
  loadingComponent: LoadingComponent,
  loadingComponentProps,
  ...extraProps
}) => {
  const dataEmpty = isDataEmpty(request);

  if (request.pending > 0 && (showLoaderDuringRefetch || dataEmpty)) {
    return LoadingComponent ? (
      <LoadingComponent {...loadingComponentProps} />
    ) : null;
  }

  if (request.error) {
    return ErrorComponent ? (
      <ErrorComponent error={request.error} {...errorComponentProps} />
    ) : null;
  }

  if (dataEmpty) {
    return noDataMessage;
  }

  if (children) {
    return typeof children === 'function' ? children(request) : children;
  }

  return <Component request={request} {...extraProps} />;
};

RequestContainer.defaultProps = {
  isDataEmpty: request =>
    Array.isArray(request.data) ? request.data.length === 0 : !request.data,
  showLoaderDuringRefetch: true,
  noDataMessage: null,
};

RequestContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  component: reactComponentPropType('RequestContainer'),
  request: PropTypes.shape({
    data: PropTypes.any,
    error: PropTypes.any,
    pending: PropTypes.number.isRequired,
  }).isRequired,
  isDataEmpty: PropTypes.func,
  showLoaderDuringRefetch: PropTypes.bool,
  noDataMessage: PropTypes.node,
  errorComponent: reactComponentPropType('RequestContainer'),
  errorComponentProps: PropTypes.objectOf(PropTypes.any),
  loadingComponent: reactComponentPropType('RequestContainer'),
  loadingComponentProps: PropTypes.objectOf(PropTypes.any),
};

export default RequestContainer;
