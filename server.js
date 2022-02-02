require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dns = require('dns');
const URL = require('url').URL;
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use('/public', express.static(`${process.cwd()}/public`));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('db connected'))
  .catch(e => console.log(e));

const URLSchema = new mongoose.Schema({
  original_url: String,
  short_url: {
    type: Number,
    unique: true,
  },
});

const Model = mongoose.model('URL', URLSchema);
app.get('/', async function (req, res) {
  const n = Math.floor(Math.random() * 1000);
  const oldUrl = await Model.findOne({ short_url: n });
  console.log(oldUrl);
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  console.log(req.body);
  let { url } = req.body;
  const result = url.replace(/(^\w+:|^)\/\//, '');
  try {
    const URLobj = new URL(url);
    console.log(URLobj);
    dns.lookup(URLobj.hostname, async (err, address, family) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        const n = Math.floor(Math.random() * 100);
        const oldUrl = await Model.findOne({ short_url: n });
        if (oldUrl) {
          oldUrl.original_url = url;
          oldUrl.save((err, doc) => {
            return res.json({
              original_url: doc.original_url,
              short_url: doc.short_url,
            });
          });
        } else {
          const url_object = await Model.create({
            original_url: url,
            short_url: n,
          });
          return res.json({
            original_url: url_object.original_url,
            short_url: url_object.short_url,
          });
        }
      }
    });
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }
});
app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;
  try {
    const url = await Model.findOne({ short_url });
    // console.log(url);
    if (!url) {
      return res.json({ error: 'invalid url' });
    }
    console.log(url.original_url);
    // res.json(url);
    res.redirect(url.original_url);
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
