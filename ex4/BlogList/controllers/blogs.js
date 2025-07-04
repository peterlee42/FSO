const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { setDefaultBlogFields, userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (req, res) => {
	const blogsList = await Blog.find({}).populate('user', {
		username: 1,
		name: 1,
	});
	res.json(blogsList);
});

blogsRouter.delete('/:id', userExtractor, async (req, res, next) => {
	try {
		const blog = await Blog.findById(req.params.id);

		if (blog.user.toString() !== req.user._id.toString()) {
			return res
				.status(401)
				.send({ error: 'user does not have access to this resource' });
		}

		await Blog.findByIdAndDelete(req.params.id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
});

blogsRouter.post(
	'/',
	setDefaultBlogFields,
	userExtractor,
	async (req, res, next) => {
		try {
			const body = req.body;
			const blog = new Blog({
				title: body.title,
				author: body.author,
				user: req.user._id,
				url: body.url,
				likes: body.likes,
			});

			const savedBlog = await blog.save();

			req.user.blogs = req.user.blogs.concat(savedBlog._id);
			await req.user.save();

			res.status(201).json(savedBlog);
		} catch (err) {
			next(err);
		}
	}
);

blogsRouter.put(
	'/:id',
	setDefaultBlogFields,
	userExtractor,
	async (req, res, next) => {
		try {
			const { author, title, url, likes } = req.body;
			const originalBlog = await Blog.findById(req.params.id);
			if (!originalBlog) {
				return res.status(404).json({ error: 'blog not found' });
			}

			if (originalBlog.user.toString() !== req.user._id.toString()) {
				return res
					.status(401)
					.json({ error: 'user does not have access to this resource' });
			}
			originalBlog.author = author;
			originalBlog.title = title;
			originalBlog.url = url;
			originalBlog.likes = likes;
			originalBlog.user = req.user._id;

			const updatedBlog = await originalBlog.save();
			res.status(200).json(updatedBlog);
		} catch (err) {
			next(err);
		}
	}
);

module.exports = blogsRouter;
