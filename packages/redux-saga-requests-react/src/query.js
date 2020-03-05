import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getQuerySelector } from 'redux-saga-requests';

import { reactComponentPropType } from './propTypesValidators';

const Query = ({
  type,
  requestKey,
  selector,
  defaultData,
  multiple,
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
  const query = useSelector(
    selector || getQuerySelector({ type, requestKey, defaultData, multiple }),
  );

  const dataEmpty = isDataEmpty(query);

  if (query.loading && (showLoaderDuringRefetch || dataEmpty)) {
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
    return children(query);
  }

  return <Component query={query} {...extraProps} />;
};

Query.defaultProps = {
  isDataEmpty: query =>
    Array.isArray(query.data) ? query.data.length === 0 : !query.data,
  showLoaderDuringRefetch: true,
  noDataMessage: null,
  multiple: false,
};

Query.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  requestKey: PropTypes.string,
  selector: PropTypes.func,
  multiple: PropTypes.bool,
  defaultData: PropTypes.any,
  children: PropTypes.func,
  component: reactComponentPropType('Query'),
  isDataEmpty: PropTypes.func,
  showLoaderDuringRefetch: PropTypes.bool,
  noDataMessage: PropTypes.node,
  errorComponent: reactComponentPropType('Query'),
  errorComponentProps: PropTypes.objectOf(PropTypes.any),
  loadingComponent: reactComponentPropType('Query'),
  loadingComponentProps: PropTypes.objectOf(PropTypes.any),
};

export default Query;
