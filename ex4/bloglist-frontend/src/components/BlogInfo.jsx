import { useState } from 'react';

import blogService from '../services/blogs';

const BlogInfo = ({ blog, removeBlog }) => {
	const { author, url } = blog;
	const [likes, setLikes] = useState(blog.likes);

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

	const handleRemove = async () => {
		await removeBlog(blog);
	};

	return (
		<div>
			<div>{url}</div>
			<div>
				likes: {likes} <button onClick={handleLikes}>like</button>
			</div>
			<div>{author}</div>
			<button onClick={handleRemove}>remove</button>
		</div>
	);
};

export default BlogInfo;
