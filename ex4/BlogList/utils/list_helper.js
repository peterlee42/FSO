const dummy = (blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	const reducer = (sum, blog) => {
		return sum + blog.likes;
	};
	return blogs.reduce(reducer, 0);
};

const favouriteBlog = (blogs) => {
	if (blogs.length === 0) return null;

	const reducer = (fav, blog) => {
		if (fav) {
			return blog.likes > fav.likes ? blog : fav;
		}
	};
	return blogs.reduce(reducer);
};

const mostBlogs = (blogs) => {
	if (blogs.length === 0) {
		return null;
	}

	counts = {};

	for (const blog of blogs) {
		counts[blog.author] = (counts[blog.author] || 0) + 1;
	}

	let mostBloggedAuthor = {
		author: Object.keys(counts)[0],
		blogs: counts[Object.keys(counts)[0]],
	};

	for (const author in counts) {
		if (counts[author] > mostBloggedAuthor.blogs) {
			mostBloggedAuthor = { author, blogs: counts[author] };
		}
	}

	return mostBloggedAuthor;
};

const mostLikes = (blogs) => {
	if (blogs.length === 0) return null;

	const likes = {};

	for (const blog of blogs) {
		likes[blog.author] = (likes[blog.author] || 0) + blog.likes;
	}

	let mostLikedAuthor = {
		author: Object.keys(likes)[0],
		likes: likes[Object.keys(likes)[0]],
	};

	for (const author in likes) {
		if (likes[author] > mostLikedAuthor.likes) {
			mostLikedAuthor = { author, likes: likes[author] };
		}
	}
	return mostLikedAuthor;
};

module.exports = {
	dummy,
	totalLikes,
	favouriteBlog,
	mostBlogs,
	mostLikes,
};
