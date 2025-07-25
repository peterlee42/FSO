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

blogsRouter.get('/:id', async (req, res) => {
	const blog = await Blog.findById(req.params.id).populate('user', {
		username: 1,
		name: 1,
	});
	res.json(blog);
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

			const returnedBlog = await savedBlog.populate('user', {
				username: 1,
				name: 1,
			});
			res.status(201).json(returnedBlog);
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

			const authorized =
				originalBlog.user.toString() !== req.user._id.toString();

			if (!authorized && originalBlog.likes !== likes) {
				originalBlog.likes = likes;
			} else if (!authorized) {
				return res
					.status(401)
					.json({ error: 'user does not have access to this resource' });
			} else {
				originalBlog.author = author;
				originalBlog.title = title;
				originalBlog.url = url;
				originalBlog.likes = likes;
				originalBlog.user = req.user._id;
			}

			const updatedBlog = await originalBlog.save();
			res.status(200).json(updatedBlog).end();
		} catch (err) {
			next(err);
		}
	}
);

module.exports = blogsRouter;
