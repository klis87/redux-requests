import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import OperationContainer from './operation-container';

const ConnectedOperationContainer = connect(
  (state, { operation, requestSelector, operationType, operationCreator }) => ({
    operation:
      operation ||
      (requestSelector
        ? requestSelector(state).operations[
            operationType || operationCreator.toString()
          ]
        : state.network.mutations[
            operationType || operationCreator.toString()
          ] || {}),
  }),
  (dispatch, ownProps) => ({
    sendOperation: ownProps.operationCreator
      ? bindActionCreators(ownProps.operationCreator, dispatch)
      : null,
  }),
  (
    stateProps,
    dispatchProps,
    { requestSelector, operationType, operationCreator, ...ownProps },
  ) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  }),
)(OperationContainer);

ConnectedOperationContainer.propTypes /* remove-proptypes */ = {
  ...OperationContainer.propTypes,
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
  ]),
  requestSelector: PropTypes.func,
  operationType: PropTypes.string,
  operationCreator: PropTypes.func,
};

export default ConnectedOperationContainer;
