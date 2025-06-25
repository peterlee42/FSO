const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { checkBlogAttributes } = require('../utils/middleware');

blogsRouter.get('/', async (req, res, next) => {
	const blogsList = await Blog.find({});

	try {
		res.json(blogsList);
	} catch (err) {
		next(err);
	}
});

blogsRouter.delete('/:id', async (req, res, next) => {
	const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
	res.status(204).end();
});

blogsRouter.use(checkBlogAttributes);

blogsRouter.post('/', async (req, res, next) => {
	try {
		const blog = new Blog(req.body);
		const result = await blog.save();
		res.status(201).json(result);
	} catch (err) {
		next(err);
	}
});

blogsRouter.put('/:id', async (req, res, next) => {
	const { author, title, url, likes } = req.body;
	const originalBlog = await Blog.findById(req.params.id);
	if (!originalBlog) {
		return res.status(404).json({ error: 'blog not found' });
	}

	originalBlog.author = author;
	originalBlog.title = title;
	originalBlog.url = url;
	originalBlog.likes = likes;

	const updatedBlog = await originalBlog.save();
	res.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
