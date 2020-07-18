const express = require('express');
const compression = require('compression');

const app = express();

// app.use('/', express.static('src/public'));
// app.use(
//   '/static',
//   compression(),
//   express.static('src/locales', {
//     etag: false,
//   }),
// );
app.use(
  '/redux-requests',
  compression(),
  express.static(
    'build',
    // { maxAge: '1y', etag: false }
  ),
);

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}!`);
});
