const router = require('express').Router();

/** @type {import('mongoose').Model<any>} */
const Blog = require('../models/blog.js');
/** @type {import('mongoose').Model<any>} */
const User = require('../models/user.js');

router.post('/reset', async (req, res) => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  res.status(204).end();
});

module.exports = router;
