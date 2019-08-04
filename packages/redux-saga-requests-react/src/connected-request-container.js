import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import RequestContainer from './request-container';

const emptyRequest = {
  data: null,
  error: null,
  pending: 0,
};

const ConnectedRequestContainer = connect(
  (state, ownProps) => ({
    request: ownProps.requestSelector
      ? ownProps.requestSelector(state)
      : state.network.queries[ownProps.queryType] || emptyRequest,
  }),
  null,
  (stateProps, dispatchProps, { requestSelector, queryType, ...ownProps }) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  }),
)(RequestContainer);

const { request, ...commonRequestContainerProps } = RequestContainer.propTypes;

ConnectedRequestContainer.propTypes /* remove-proptypes */ = {
  ...commonRequestContainerProps,
  requestSelector: PropTypes.func,
  queryType: PropTypes.any,
};

export default ConnectedRequestContainer;
