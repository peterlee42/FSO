import { useState, useImperativeHandle } from 'react';

import blogService from '../services/blogs';

const BlogForm = ({ handleCreate, ref }) => {
	const [title, setTitle] = useState('');
	const [author, setAuthor] = useState('');
	const [url, setUrl] = useState('');

	const addBlog = async () => {
		const newBlog = {
			author,
			title,
			url,
		};

		const savedBlog = await blogService.create(newBlog);
		setAuthor('');
		setTitle('');
		setUrl('');

		return savedBlog;
	};

	useImperativeHandle(ref, () => {
		return { addBlog };
	});

	return (
		<form onSubmit={handleCreate}>
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
	);
};

export default BlogForm;
