import { useState } from 'react';
import BlogInfo from './BlogInfo';

const Blog = ({ blog, removeBlog, addLikes, user }) => {
  const { title } = blog;
  const [visible, setVisible] = useState(false);

  const blogStyle = {
    padding: '10px 6px 10px 6px',
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  };

  const changeVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div data-testid='blog-item' style={blogStyle}>
      <div style={{ display: 'flex', gap: '5px' }}>
        <div style={{ fontWeight: 'bold' }}>{title}</div> by {blog.author}{' '}
        <button onClick={changeVisibility}>{visible ? 'hide' : 'show'}</button>
      </div>
      {visible && (
        <BlogInfo
          blog={blog}
          removeBlog={removeBlog}
          addLikes={addLikes}
          user={user}
        />
      )}
    </div>
  );
};

export default Blog;
