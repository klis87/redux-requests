import React from 'react';
import { CssBaseline, Container, Box } from '@material-ui/core';

import Header from './header';
import Books from './books';
import Posts from './posts';
import Groups from './groups';

const App = () => {
  return (
    <div>
      <CssBaseline />
      <Header />
      <Container style={{ paddingTop: 16 }}>
        <Books />
        <Box mb={4} mt={4} />
        <Posts />
        <Box mb={4} mt={4} />
        <Groups />
      </Container>
    </div>
  );
};

export default App;
