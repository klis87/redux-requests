import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import RequestContainer from './request-container';

const ConnectedRequestContainer = connect(
  (state, ownProps) => ({
    request: ownProps.requestSelector(state),
  }),
  null,
  (stateProps, dispatchProps, { requestSelector, ...ownProps }) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  }),
)(RequestContainer);

const { request, ...commonRequestContainerProps } = RequestContainer.propTypes;

ConnectedRequestContainer.propTypes /* remove-proptypes */ = {
  ...commonRequestContainerProps,
  requestSelector: PropTypes.func.isRequired,
};

export default ConnectedRequestContainer;
