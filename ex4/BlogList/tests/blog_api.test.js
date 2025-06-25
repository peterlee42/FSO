const assert = require('node:assert');
const { test, after, beforeEach, describe } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

describe('when there are some blogs saved', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});

		const blogObjects = helper.initialBlogs.map((blog) => {
			const newBlogObj = new Blog(blog);
			return newBlogObj.save();
		});

		await Promise.all(blogObjects);
	});

	test('correct number of blog posts', async () => {
		const response = await api.get('/api/blogs');
		assert.strictEqual(response.body.length, helper.initialBlogs.length);
	});

	test('unique identifier property is named id', async () => {
		const response = await api.get('/api/blogs');
		assert(
			response.body.every((blog) => {
				return Object.hasOwn(blog, 'id');
			})
		);
	});

	describe('adding new blog post', () => {
		test('successfully creates new blog post', async () => {
			const newBlog = {
				title: 'Type wars',
				author: 'Robert C. Martin',
				url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
				likes: 2,
			};

			await api
				.post('/api/blogs')
				.send(newBlog)
				.expect(201)
				.expect('Content-Type', /application\/json/);

			const newBlogsList = await helper.blogsInDb();
			assert.strictEqual(newBlogsList.length, helper.initialBlogs.length + 1);

			const blogContent = newBlogsList.map((b) => b.title);
			assert(blogContent.includes(newBlog.title));
		});

		test('likes property defaults to zero if it is missing', async () => {
			const newBlog = {
				title: 'Type wars',
				author: 'Robert C. Martin',
				url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
			};

			const response = await api
				.post('/api/blogs')
				.send(newBlog)
				.expect(201)
				.expect('Content-Type', /application\/json/);

			assert.strictEqual(response.body.likes, 0);
		});

		test('responds with status 400 if data is invalid', async () => {
			const newBlog = {
				author: 'Robert C. Martin',
				url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
				likes: 2,
			};

			await api.post('/api/blogs').send(newBlog).expect(400);
		});
	});

	describe('deleting a blog post', () => {
		test('successfully deletes a blog post', async () => {
			const blogsAtStart = await helper.blogsInDb();
			const blogToDelete = blogsAtStart[0];

			await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

			const blogsAtEnd = await helper.blogsInDb();

			const titles = blogsAtEnd.map((blog) => blog.title);
			assert(!titles.includes(blogToDelete.title));

			assert.strictEqual(blogsAtStart.length, blogsAtEnd.length + 1);
		});
	});

	describe('updating the information of a blog post', () => {
		test('successfully updates likes in blog post', async () => {
			const blogsAtStart = await helper.blogsInDb();
			const blogToUpdate = blogsAtStart[0];

			const updatedLikes = blogToUpdate.likes + 10;

			const updatedBlog = {
				author: blogToUpdate.author,
				title: blogToUpdate.title,
				url: blogToUpdate.url,
				likes: updatedLikes,
			};

			const response = await api
				.put(`/api/blogs/${blogToUpdate.id}`)
				.send(updatedBlog)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			assert.strictEqual(response.body.likes, updatedLikes);
		});

		test('id of original and updated blog posts are the same', async () => {
			const blogsAtStart = await helper.blogsInDb();
			const blogToUpdate = blogsAtStart[0];

			const updatedLikes = blogToUpdate.likes + 10;

			const updatedBlog = {
				author: blogToUpdate.author,
				title: blogToUpdate.title,
				url: blogToUpdate.url,
				likes: updatedLikes,
			};

			const response = await api
				.put(`/api/blogs/${blogToUpdate.id}`)
				.send(updatedBlog)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			assert.strictEqual(blogToUpdate.id, response.body.id);
		});

		test('likes property defaults to zero if it is missing', async () => {
			const blogsAtStart = await helper.blogsInDb();
			const blogToUpdate = blogsAtStart[0];

			const updatedBlog = {
				author: 'John Doe',
				title: blogToUpdate.title,
				url: blogToUpdate.url,
			};

			const response = await api
				.put(`/api/blogs/${blogToUpdate.id}`)
				.send(updatedBlog)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			assert.strictEqual(response.body.likes, 0);
			assert.strictEqual(response.body.author, 'John Doe');
		});
	});

	test('responds with status 400 if data is invalid', async () => {
		const blogsAtStart = await helper.blogsInDb();
		const blogToUpdate = blogsAtStart[0];

		const updatedBlog = {
			author: blogToUpdate.author,
			url: blogToUpdate.url,
			likes: blogToUpdate.likes,
		};

		await api.post('/api/blogs').send(updatedBlog).expect(400);
	});
});

after(() => {
	mongoose.connection.close();
});
