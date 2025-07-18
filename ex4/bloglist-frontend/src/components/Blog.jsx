import { useState } from 'react';

import blogService from '../services/blogs';

const Blog = ({ blog }) => {
	const { title, author, url } = blog;
	const [visible, setVisible] = useState(false);
	const [likes, setLikes] = useState(blog.likes);

	const blogStyle = {
		padding: '10px 6px 10px 6px',
		border: 'solid',
		borderWidth: 1,
		marginBottom: 5,
	};

	const changeVisibility = () => {
		setVisible(!visible);
	};

	const handleLikes = async () => {
		const newLikes = likes + 1;
		setLikes(newLikes);

		try {
			await blogService.update({
				...blog,
				likes: newLikes,
			});
		} catch (err) {
			setLikes(likes);
			console.log(err);
		}
	};

	const blogInfo = () => {
		return (
			<div>
				<div>{url}</div>
				<div>
					likes: {likes} <button onClick={handleLikes}>like</button>
				</div>
				<div>{author}</div>
			</div>
		);
	};

	return (
		<div style={blogStyle}>
			<div style={{ display: 'flex', gap: '5px' }}>
				<div style={{ fontWeight: 'bold' }}>{title}</div> by {blog.author}{' '}
				<button onClick={changeVisibility}>{visible ? 'hide' : 'show'}</button>
			</div>
			{visible && blogInfo()}
		</div>
	);
};

export default Blog;
