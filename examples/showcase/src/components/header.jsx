import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';

const Header = () => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography color="inherit" variant="h6">
          Redux-Requests
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
