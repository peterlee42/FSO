const assert = require('node:assert');
const { test, after, beforeEach, describe } = require('node:test');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

describe('when there are some blogs saved to one user', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('secret', 10);
		const user = new User({
			username: 'root',
			name: 'Bob',
			passwordHash,
		});

		const savedUser = await user.save();

		const blogPromises = helper.initialBlogs.map((blog) => {
			const blogWithUser = {
				...blog,
				user: savedUser._id,
			};
			return new Blog(blogWithUser).save();
		});

		const savedBlogs = await Promise.all(blogPromises);

		const blogIds = savedBlogs.map((blog) => blog._id);
		savedUser.blogs = blogIds;
		await savedUser.save();
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
		let token;

		beforeEach(async () => {
			const user = { username: 'root', password: 'secret' };
			const response = await api
				.post('/api/login')
				.send(user)
				.expect(200)
				.expect('Content-Type', /application\/json/);
			token = response.body.token;
		});

		test('successfully creates new blog post', async () => {
			const newBlog = {
				title: 'Type wars',
				author: 'Robert C. Martin',
				url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
				likes: 2,
			};

			await api
				.post('/api/blogs')
				.set('Authorization', `Bearer ${token}`)
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
				.set('Authorization', `Bearer ${token}`)
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

			await api
				.post('/api/blogs')
				.set('Authorization', `Bearer ${token}`)
				.send(newBlog)
				.expect(400);
		});
	});

	describe('deleting a blog post', () => {
		let token;

		beforeEach(async () => {
			const user = { username: 'root', password: 'secret' };
			const response = await api
				.post('/api/login')
				.send(user)
				.expect(200)
				.expect('Content-Type', /application\/json/);
			token = response.body.token;
		});

		test('successfully deletes a blog post', async () => {
			const blogsAtStart = await helper.blogsInDb();
			const blogToDelete = blogsAtStart[0];

			await api
				.delete(`/api/blogs/${blogToDelete.id}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(204);

			const blogsAtEnd = await helper.blogsInDb();

			const titles = blogsAtEnd.map((blog) => blog.title);
			assert(!titles.includes(blogToDelete.title));

			assert.strictEqual(blogsAtStart.length, blogsAtEnd.length + 1);
		});

		test('successfully responds with proper status code and message if blog post id does not exist in db', async () => {
			const response = await api
				.delete('/api/blogs/1')
				.set('Authorization', `Bearer ${token}`)
				.expect(400)
				.expect('Content-Type', /application\/json/);
			assert.strictEqual(response.body.error, 'malformatted id');
		});

		test('successfully response with proper status code and message if user does not have access to resource', async () => {
			const passwordHash = await bcrypt.hash('supersecretpassword', 10);
			const user = new User({
				username: 'newGuy',
				name: 'Guy',
				passwordHash,
				blogs: [],
			});
			const savedUser = await user.save();

			const blog = new Blog({
				title: 'Type wars',
				author: 'Robert C. Martin',
				url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
				user: savedUser._id,
			});

			const savedBlog = await blog.save();
			savedUser.blogs = savedUser.blogs.concat(savedBlog._id);
			await savedUser.save();

			const blogsAtStart = await helper.blogsInDb();

			const response = await api
				.delete(`/api/blogs/${savedBlog._id.toString()}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(401)
				.expect('Content-Type', /application\/json/);

			assert.strictEqual(
				response.body.error,
				'user does not have access to this resource'
			);

			const blogsAtEnd = await helper.blogsInDb();
			assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
		});
	});

	describe('updating the information of a blog post', () => {
		let token;

		beforeEach(async () => {
			const user = { username: 'root', password: 'secret' };
			const response = await api
				.post('/api/login')
				.send(user)
				.expect(200)
				.expect('Content-Type', /application\/json/);
			token = response.body.token;
		});

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
				.set('Authorization', `Bearer ${token}`)
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
				.set('Authorization', `Bearer ${token}`)
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
				.set('Authorization', `Bearer ${token}`)
				.send(updatedBlog)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			assert.strictEqual(response.body.likes, 0);
			assert.strictEqual(response.body.author, 'John Doe');
		});

		test('responds with status 400 if data is invalid', async () => {
			const blogsAtStart = await helper.blogsInDb();
			const blogToUpdate = blogsAtStart[0];

			const updatedLikes = blogToUpdate.likes + 10;

			const updatedBlog = {
				author: blogToUpdate.author,
				url: blogToUpdate.url,
				likes: updatedLikes,
			};

			await api
				.put(`/api/blogs/${blogToUpdate.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updatedBlog)
				.expect(400);
		});

		test('successfully response with proper status code and message if user does not have access to resource', async () => {
			const passwordHash = await bcrypt.hash('supersecretpassword', 10);
			const user = new User({
				username: 'newGuy',
				name: 'Guy',
				passwordHash,
				blogs: [],
			});
			const savedUser = await user.save();

			const blog = new Blog({
				title: 'Type wars',
				author: 'Robert C. Martin',
				url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
				user: savedUser._id,
			});

			const savedBlog = await blog.save();
			savedUser.blogs = savedUser.blogs.concat(savedBlog._id);
			await savedUser.save();

			const blogsAtStart = await helper.blogsInDb();

			const response = await api
				.put(`/api/blogs/${savedBlog._id.toString()}`)
				.set('Authorization', `Bearer ${token}`)
				.send({ ...blog, likes: blog.likes + 10 })
				.expect(401);
			assert.strictEqual(
				response.body.error,
				'user does not have access to this resource'
			);

			const blogsAtEnd = await helper.blogsInDb();
			assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
		});
	});
});

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('secret', 10);
		const user = new User({ username: 'root', name: 'Bob', passwordHash });

		await user.save();
	});

	test('creation succeeds with new username', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'peterlee42',
			name: 'Peter',
			password: 'superdifficultpassword',
		};

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

		const usernames = usersAtEnd.map((u) => u.username);
		assert(usernames.includes(newUser.username));
	});

	test('creation fails with proper status code and message if username already exists', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'root',
			name: 'Bob',
			password: 'somepassword',
		};

		const result = await api.post('/api/users').send(newUser).expect(400);

		assert.strictEqual(result.body.error, 'expected `username` to be unique');

		const usersAtEnd = await helper.usersInDb();
		assert.strictEqual(usersAtEnd.length, usersAtStart.length);
	});

	test('creation fails if username is less than three characters', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'A',
			name: 'Peter',
			password: 'superdifficultpassword',
		};

		const response = await api.post('/api/users').send(newUser).expect(400);
		assert.strictEqual(
			response.body.error,
			'expected `username` to be at least 3 characters long'
		);

		const usersAtEnd = await helper.usersInDb();
		assert.strictEqual(usersAtStart.length, usersAtEnd.length);
	});

	test('creation fails if password is not at least 3 characters long', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'supercooluser',
			name: 'Billy',
			password: 'a',
		};

		const response = await api.post('/api/users').send(newUser).expect(400);

		assert.strictEqual(
			response.body.error,
			'expected `password` to be at least 3 characters long'
		);

		const usersAtEnd = await helper.usersInDb();
		assert.strictEqual(usersAtStart.length, usersAtEnd.length);
	});
});

after(() => {
	mongoose.connection.close();
});
