import { useState } from 'react';

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');

  const addBlog = async (e) => {
    e.preventDefault();
    const newBlog = {
      author,
      title,
      url,
    };

    createBlog(newBlog);

    setAuthor('');
    setTitle('');
    setUrl('');
  };

  return (
    <form onSubmit={addBlog}>
      <div>
        title:
        <input
          type='text'
          data-testid='title'
          name='Title'
          value={title}
          onChange={({ target }) => setTitle(target.value)}
          id='title-input'
        />
      </div>
      <div>
        author:
        <input
          type='text'
          data-testid='author'
          name='Author'
          value={author}
          onChange={({ target }) => setAuthor(target.value)}
          id='author-input'
        />
      </div>
      <div>
        url:
        <input
          type='text'
          data-testid='url'
          name='Url'
          value={url}
          onChange={({ target }) => setUrl(target.value)}
          id='url-input'
        />
      </div>
      <button type='submit'>create</button>
    </form>
  );
};

export default BlogForm;
