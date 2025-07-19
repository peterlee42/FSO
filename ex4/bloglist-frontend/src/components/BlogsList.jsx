import { useState, useEffect, useRef } from 'react';

import Blog from './Blog';
import Togglable from './Togglable';
import BlogForm from './BlogForm';

const BlogsList = ({ setMessage, setMessageType, setUser }) => {
	const [blogs, setBlogs] = useState([]);

	const blogFormRef = useRef();
	const blogFormToggleRef = useRef();

	useEffect(() => {
		const getBlogs = async () => {
			const blogs = await blogService.getAll();
			setBlogs(blogs);
		};
		getBlogs();
	}, []);

	const handleLogout = () => {
		setMessage('');
		setMessageType('');

		window.localStorage.removeItem('blogAppUser');
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
				setBlogs(blogs.filter((blog) => blog.id != blogToRemove.id));
			}
		} catch (err) {
			message = `could not remove blog`;
			messageType = 'error';
		}

		setMessage(message);
		setMessageType(messageType);
	};

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
					{sortedBlogs.map((blog) => (
						<Blog key={blog.id} blog={blog} removeBlog={removeBlog} />
					))}
				</div>
			</div>
		</div>
	);
};

export default BlogsList;
