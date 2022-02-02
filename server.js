require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dns = require('dns');
const URL = require('url').URL;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  const url = 'http://forum.freecodecamp.org/';
  const regex = /(^\w+:|^)\/\//;
  console.log(url.replace(regex, '').replace('/', ''));
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  let { url } = req.body;
  try {
    const originalUrl = new URL(url);
    dns.lookup(originalUrl.hostname, (err, address, family) => {
      if (err) {
        return res.json({ error: 'Invalid Hostname' });
      } else {
        return res.json({
          original_url: originalUrl.origin,
          short_url: family,
        });
      }
    });
  } catch (error) {
    return res.json({ error: 'Invalid URL' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
