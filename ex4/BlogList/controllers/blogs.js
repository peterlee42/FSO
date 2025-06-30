const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const { checkBlogAttributes } = require('../utils/middleware');

blogsRouter.get('/', async (req, res) => {
	const blogsList = await Blog.find({}).populate('user', {
		username: 1,
		name: 1,
	});
	res.json(blogsList);
});

blogsRouter.delete('/:id', async (req, res, next) => {
	try {
		await Blog.findByIdAndDelete(req.params.id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
});

blogsRouter.post('/', checkBlogAttributes, async (req, res) => {
	const body = req.body;
	const user = await User.findById(req.body.userId);
	if (!user) {
		return res.status(404).json({ error: 'userId missing or not valid' });
	}

	if (body.likes === undefined) {
		body.likes = 0;
	}

	const blog = new Blog({
		title: body.title,
		author: body.author,
		user: user._id,
		url: body.url,
		likes: body.likes,
	});

	const savedBlog = await blog.save();

	user.blogs = user.blogs.concat(savedBlog._id);
	await user.save();

	res.status(201).json(savedBlog);
});

blogsRouter.put('/:id', checkBlogAttributes, async (req, res) => {
	const { author, title, url, likes, userId } = req.body;
	const originalBlog = await Blog.findById(req.params.id);
	if (!originalBlog) {
		return res.status(404).json({ error: 'blog not found' });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).json({ error: 'userId missing or not valid' });
	}

	originalBlog.author = author;
	originalBlog.title = title;
	originalBlog.url = url;
	originalBlog.likes = likes;
	originalBlog.user = user._id;

	const updatedBlog = await originalBlog.save();
	res.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
