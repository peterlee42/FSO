const BlogInfo = ({ blog, removeBlog, addLikes, user }) => {
  const { author, url, likes } = blog;

  const handleRemove = () => {
    removeBlog(blog);
  };

  const handleLikes = () => {
    addLikes(blog);
  };

  const authorized = user.id === blog.user.id;

  return (
    <div>
      <div>{url}</div>
      <div>
        likes: <div data-testid='likes-count'>{likes}</div>{' '}
        <button onClick={handleLikes}>like</button>
      </div>
      <div>{author}</div>
      {authorized && <button onClick={handleRemove}>remove</button>}
    </div>
  );
};

export default BlogInfo;
