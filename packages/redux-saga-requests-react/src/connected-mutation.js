import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Mutation from './mutation';

const ConnectedMutation = connect(
  (state, { requestSelector, type }) => ({
    mutation: requestSelector
      ? requestSelector(state).mutations[type]
      : state.network.mutations[type] || {},
  }),
  null,
  (stateProps, dispatchProps, { requestSelector, type, ...ownProps }) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  }),
)(Mutation);

const { mutation, ...commonMutationProps } = Mutation.propTypes;

ConnectedMutation.propTypes /* remove-proptypes */ = {
  ...commonMutationProps,
  requestSelector: PropTypes.func,
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
};

export default ConnectedMutation;
