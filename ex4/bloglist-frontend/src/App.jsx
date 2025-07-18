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

	useEffect(() => {
		const savedUser = JSON.parse(window.localStorage.getItem('blogAppUser'));

		if (!savedUser) {
			return;
		} else if (savedUser && blogService.verifyToken(savedUser.token)) {
			setUser(savedUser);
			blogService.setToken(savedUser.token);
		} else {
			window.localStorage.removeItem('blogAppUser');
			window.location.reload();
		}
	}, []);

	useEffect(() => {
		blogService.getAll().then((blogs) => setBlogs(blogs));
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

		setTimeout(() => {
			setMessage('');
			setMessageType('');
		}, 5000);
	};

	const handleLogout = () => {
		setMessage('');
		setMessageType('');

		window.localStorage.removeItem('blogAppUser');
		setUser(null);
	};

	const addBlog = async (e) => {
		e.preventDefault();

		blogFormToggleRef.current.toggleVisible();
		try {
			const savedBlog = await blogFormRef.current.addBlog();
			setBlogs(blogs.concat(savedBlog));
			setMessage(`${savedBlog.title} by ${savedBlog.author} has been added`);
			setMessageType('success');
		} catch (err) {
			setMessage('could not create a new blog');
			setMessageType('error');
		}

		setTimeout(() => {
			setMessage('');
			setMessageType('');
		}, 5000);
	};
	const addLikes = async (e) => {
		const updatedBlog = { ...blog, likes: blog.likes + 1 };
		const response = await blogService.update(updatedBlog);
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

	const blogsList = () => (
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
				<Togglable ref={blogFormToggleRef}>
					<BlogForm handleCreate={addBlog} ref={blogFormRef} />
				</Togglable>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '5px',
					}}
				>
					{blogs.map((blog) => (
						<Blog key={blog.id} blog={blog} />
					))}
				</div>
			</div>
		</div>
	);

	return <div>{user === null ? loginForm() : blogsList()}</div>;
};

export default App;
