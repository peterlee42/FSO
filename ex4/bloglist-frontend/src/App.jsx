import { useState, useEffect } from 'react';
import Blog from './components/Blog';
import Notification from './components/Notification';
import blogService from './services/blogs';
import loginService from './services/login';

const App = () => {
	const [blogs, setBlogs] = useState([]);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [user, setUser] = useState(null);

	const [title, setTitle] = useState('');
	const [author, setAuthor] = useState('');
	const [url, setUrl] = useState('');

	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');

	useEffect(() => {
		const savedUser = JSON.parse(window.localStorage.getItem('blogAppUser'));
		if (savedUser) {
			setUser(savedUser);
			blogService.setToken(savedUser.token);
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

	const handleCreate = async (e) => {
		e.preventDefault();

		try {
			const newBlog = {
				author,
				title,
				url,
			};

			const savedBlog = await blogService.create(newBlog);
			setBlogs(blogs.concat(savedBlog));
			console.log(savedBlog);
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
			<h2>blogs</h2>
			<Notification message={message} messageType={messageType} />
			<div style={{ display: 'flex', gap: '5px' }}>
				<div>{user.name} is logged in</div>
				<button onClick={handleLogout}>logout</button>
			</div>
			<form
				onSubmit={handleCreate}
				style={{ marginTop: '20px', marginBottom: '20px' }}
			>
				<div>
					title:
					<input
						type='text'
						name='Title'
						value={title}
						onChange={({ target }) => setTitle(target.value)}
					/>
				</div>
				<div>
					author:
					<input
						type='text'
						name='Author'
						value={author}
						onChange={({ target }) => setAuthor(target.value)}
					/>
				</div>
				<div>
					url:
					<input
						type='text'
						name='Url'
						value={url}
						onChange={({ target }) => setUrl(target.value)}
					/>
				</div>
				<button type='submit'>create</button>
			</form>
			{blogs.map((blog) => (
				<Blog key={blog.id} blog={blog} />
			))}
		</div>
	);

	return <div>{user === null ? loginForm() : blogsList()}</div>;
};

export default App;
