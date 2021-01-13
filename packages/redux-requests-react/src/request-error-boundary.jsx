import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

import useQuery from './use-query';
import useMutation from './use-mutation';
import RequestsContext from './requests-context';

class InternalRequestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    const { type, requestKey, setActiveError } = this.props;

    if (type === error.type && requestKey === error.requestKey) {
      setActiveError(error);
    }
  }

  render() {
    const { children, type, requestKey, fallback } = this.props;

    if (
      this.state.error &&
      type === this.state.error.type &&
      requestKey === this.state.error.requestKey
    ) {
      return fallback(this.state.error);
    }

    return children;
  }
}

const RequestErrorBoundary = ({
  type,
  requestKey,
  autoReset,
  children,
  fallback,
}) => {
  const requestContext = useContext(RequestsContext);
  const [activeError, setActiveError] = useState(null);
  const [recoveryCounter, setRecoveryCounter] = useState(0);

  autoReset = autoReset === undefined ? requestContext.autoReset : autoReset;

  const query = useQuery({
    type,
    requestKey,
    autoReset,
    autoLoad: false,
    throwError: false,
    suspense: false,
    suspenseSsr: false,
  });

  const mutation = useMutation({
    type,
    requestKey,
    autoReset,
    throwError: false,
    suspense: false,
  });

  useEffect(() => {
    if (
      !query.error &&
      !query.loading &&
      !mutation.error &&
      !mutation.loading &&
      activeError
    ) {
      setActiveError(null);
      setRecoveryCounter(v => v + 1);
    }
  }, [
    query.error,
    query.loading,
    mutation.error,
    mutation.loading,
    activeError,
  ]);

  return (
    <InternalRequestErrorBoundary
      key={recoveryCounter}
      setActiveError={setActiveError}
      fallback={fallback}
      type={type}
      requestKey={requestKey}
    >
      {children}
    </InternalRequestErrorBoundary>
  );
};

RequestErrorBoundary.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  requestKey: PropTypes.string,
  children: PropTypes.element.isRequired,
  fallback: PropTypes.func.isRequired,
  autoReset: PropTypes.bool,
};

export default RequestErrorBoundary;
