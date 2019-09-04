import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getMutation } from 'redux-saga-requests';

import { reactComponentPropType } from './propTypesValidators';

const Mutation = ({
  type,
  selector,
  requestKey,
  children,
  component: Component,
  ...extraProps
}) => {
  const mutationSelector = useMemo(
    () => selector || getMutation({ type, requestKey }),
    [selector, type, requestKey],
  );

  const mutation = useSelector(mutationSelector);

  if (children) {
    return children(mutation);
  }

  return <Component mutation={mutation} {...extraProps} />;
};

Mutation.propTypes = {
  selector: PropTypes.func,
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  requestKey: PropTypes.string,
  children: PropTypes.func,
  component: reactComponentPropType('Mutation'),
};

export default Mutation;
