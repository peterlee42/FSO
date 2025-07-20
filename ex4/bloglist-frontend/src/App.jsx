import { useState, useEffect, useRef } from 'react';

import Blog from './components/Blog';
import Notification from './components/Notification';
import Togglable from './components/Togglable';
import BlogForm from './components/BlogForm';

import blogService from './services/blogs';
import loginService from './services/login';

// -----------------------------------------------------------------------

const App = () => {
	const [blogs, setBlogs] = useState([]);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [user, setUser] = useState(null);

	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');

	const blogFormRef = useRef();
	const blogFormToggleRef = useRef();

	const timeoutRef = useRef();

	useEffect(() => {
		const savedUser = JSON.parse(window.localStorage.getItem('blogAppUser'));

		if (savedUser) {
			setUser(savedUser);
			blogService.setToken(savedUser.token);
		}
	}, []);

	useEffect(() => {
		if (message) {
			clearTimeout(timeoutRef.current);

			timeoutRef.current = setTimeout(() => {
				setMessage('');
				setMessageType('');
				timeoutRef.current = null;
			}, 5000);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [message]);

	useEffect(() => {
		const getBlogs = async () => {
			const blogs = await blogService.getAll();
			setBlogs(blogs);
		};
		getBlogs();
	}, []);

	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			const user = await loginService.login({ username, password });
			window.localStorage.setItem('blogAppUser', JSON.stringify(user));

			blogService.setToken(user.token);
			setUser(user);
			setUsername('');
			setPassword('');
			setMessage('logged in');
			setMessageType('success');
		} catch (err) {
			console.log(err);
			setMessage('wrong username or password');
			setMessageType('error');
		}
	};

	const handleLogout = () => {
		setMessage('');
		setMessageType('');

		window.localStorage.removeItem('blogAppUser');
		setUser(null);
	};

	const addBlog = async (e) => {
		e.preventDefault();

		try {
			const savedBlog = await blogFormRef.current.addBlog();
			setBlogs(blogs.concat(savedBlog));
			setMessage(`${savedBlog.title} by ${savedBlog.author} has been added`);
			setMessageType('success');
			blogFormToggleRef.current.toggleVisible();
		} catch (err) {
			setMessage('could not create a new blog');
			setMessageType('error');
		}
	};

	const removeBlog = async (blogToRemove) => {
		let [message, messageType] = ['', ''];
		try {
			if (
				window.confirm(
					`Remove blog ${blogToRemove.title} by ${blogToRemove.author}`
				)
			) {
				await blogService.remove(blogToRemove.id);
				message = `removed ${blogToRemove.title} by ${blogToRemove.author}`;
				messageType = 'success';
				setBlogs(blogs.filter((blog) => blog.id !== blogToRemove.id));
			}
		} catch (err) {
			message = `could not remove blog`;
			messageType = 'error';
		}

		setMessage(message);
		setMessageType(messageType);
	};

	const addLikes = async (updatedBlog) => {
		const newLikes = updatedBlog.likes + 1;

		try {
			setBlogs(
				blogs.map((blog) => {
					if (blog.id === updatedBlog.id) {
						return { ...blog, likes: blog.likes + 1 };
					} else {
						return blog;
					}
				})
			);
			await blogService.update({
				...updatedBlog,
				likes: newLikes,
			});
		} catch (err) {
			setBlogs(blogs);
			console.log(err);
		}
	};

	const loginForm = () => (
		<div>
			<h2>log in to application</h2>
			<Notification message={message} messageType={messageType} />
			<form method='post' onSubmit={handleLogin}>
				<div>
					username
					<input
						type='text'
						value={username}
						name='Username'
						onChange={({ target }) => setUsername(target.value)}
					/>
				</div>
				<div>
					password
					<input
						type='password'
						value={password}
						name='Password'
						onChange={({ target }) => setPassword(target.value)}
					/>
				</div>
				<button type='submit'>login</button>
			</form>
		</div>
	);

	const blogsList = () => {
		const sortedBlogs = blogs.sort((blog1, blog2) => blog2.likes - blog1.likes);

		return (
			<div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<div>
						<h1 style={{ margin: '20px 0px 0px 0px' }}>blogs</h1>
						<Notification message={message} messageType={messageType} />
					</div>
					<div style={{ display: 'flex', gap: '5px' }}>
						<div>{user.name} is logged in</div>
						<button onClick={handleLogout}>logout</button>
					</div>
					<Togglable buttonLabel={'new blog'} ref={blogFormToggleRef}>
						<BlogForm handleCreate={addBlog} ref={blogFormRef} />
					</Togglable>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '5px',
						}}
					>
						{sortedBlogs.map((blog) => (
							<Blog
								key={blog.id}
								blog={blog}
								user={user}
								removeBlog={removeBlog}
								addLikes={addLikes}
							/>
						))}
					</div>
				</div>
			</div>
		);
	};

	return <div>{user === null ? loginForm() : blogsList()}</div>;
};

export default App;
