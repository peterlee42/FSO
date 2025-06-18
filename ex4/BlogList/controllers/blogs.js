const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/blogs', (req, res, next) => {
	Blog.find({}).then((blogs) => {
		res.json(blogs);
	});
});

blogsRouter.post('/blogs', (req, res) => {
	const blog = new Blog(req.body);

	blog.save().then((result) => {
		res.status(201).json(result);
	});
});

module.exports = blogsRouter;
