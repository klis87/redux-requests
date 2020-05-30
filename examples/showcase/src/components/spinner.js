import React from 'react';
import { CircularProgress } from '@material-ui/core';

const Spinner = () => (
  <div style={{ textAlign: 'center' }}>
    <CircularProgress disableShrink />
  </div>
);

export default Spinner;
