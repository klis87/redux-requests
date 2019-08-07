import React from 'react';
import PropTypes from 'prop-types';

import { reactComponentPropType } from './propTypesValidators';

const Query = ({
  query,
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
  const dataEmpty = isDataEmpty(query);

  if (query.pending > 0 && (showLoaderDuringRefetch || dataEmpty)) {
    return LoadingComponent ? (
      <LoadingComponent {...loadingComponentProps} />
    ) : null;
  }

  if (query.error) {
    return ErrorComponent ? (
      <ErrorComponent error={query.error} {...errorComponentProps} />
    ) : null;
  }

  if (dataEmpty) {
    return noDataMessage;
  }

  if (children) {
    return typeof children === 'function' ? children(query) : children;
  }

  return <Component query={query} {...extraProps} />;
};

Query.defaultProps = {
  isDataEmpty: query =>
    Array.isArray(query.data) ? query.data.length === 0 : !query.data,
  showLoaderDuringRefetch: true,
  noDataMessage: null,
};

Query.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  component: reactComponentPropType('Query'),
  query: PropTypes.shape({
    data: PropTypes.any,
    error: PropTypes.any,
    pending: PropTypes.number.isRequired,
  }).isRequired,
  isDataEmpty: PropTypes.func,
  showLoaderDuringRefetch: PropTypes.bool,
  noDataMessage: PropTypes.node,
  errorComponent: reactComponentPropType('Query'),
  errorComponentProps: PropTypes.objectOf(PropTypes.any),
  loadingComponent: reactComponentPropType('Query'),
  loadingComponentProps: PropTypes.objectOf(PropTypes.any),
};

export default Query;
