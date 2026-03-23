const express = require('express');
const app = express();

const port = 3000;

app.get('/abc', (req, res) => {
  res.status(404).send('This page is not found');
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
