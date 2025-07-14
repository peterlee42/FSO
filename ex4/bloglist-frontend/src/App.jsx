import { useState, useEffect } from 'react';
import Blog from './components/Blog';
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
		} catch (err) {
			console.log(err);
		}
	};

	const handleLogout = () => {
		window.localStorage.removeItem('blogAppUser');
		setUser(null);
	};

	const handleCreate = async (e) => {
		e.preventDefault();

		const newBlog = {
			author,
			title,
			url,
		};

		const savedBlog = await blogService.create(newBlog);
		setBlogs(blogs.concat(savedBlog));
		console.log(savedBlog);
	};

	const loginForm = () => {
		return (
			<form method='post' onSubmit={handleLogin}>
				<h2>log in to application</h2>
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
		);
	};

	const blogsList = () => {
		return (
			<div>
				<h2>blogs</h2>
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
	};

	return <div>{user === null ? loginForm() : blogsList()}</div>;
};

export default App;
