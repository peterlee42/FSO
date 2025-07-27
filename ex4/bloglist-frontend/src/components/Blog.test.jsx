import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';
import BlogInfo from './BlogInfo.jsx';
import BlogForm from './BlogForm.jsx';

test('renders title and author only', () => {
  const blog = {
    title: 'Test Blog',
    author: 'root',
    url: 'www.testblog.com',
    likes: 0,
  };

  render(<Blog blog={blog} />);

  const titleElement = screen.getByText('Test Blog');
  const authorElement = screen.getByText('root', { exact: false });
  const urlElement = screen.queryByText('www.testblog.com');
  const likesElement = screen.queryByText('0');

  expect(titleElement).toBeDefined();
  expect(authorElement).toBeDefined();
  expect(urlElement).toBeNull();
  expect(likesElement).toBeNull();
});

test('renders url and likes when show button is pressed', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'root',
    url: 'www.testblog.com',
    likes: 0,
    user: {
      id: 1
    },
  };

  const mockHandler = vi.fn();

  render(<Blog blog={blog} user={{ id: 1 }} />);

  const user = userEvent.setup();
  const button = screen.getByText('show');
  await user.click(button);

  const urlElement = screen.getByText('Test Blog', { exact: false });
  const likesElement = screen.getByText('likes: 0');

  expect(urlElement).toBeDefined();
  expect(likesElement).toBeDefined();
});

test('like button handler is run twice if button is presed twice', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'root',
    url: 'www.testblog.com',
    likes: 0,
    user: {
      id: 1
    },
  };

  const mockLikeHandler = vi.fn();

  render(<BlogInfo blog={blog} user={{ id: 1 }} addLikes={mockLikeHandler} />);

  const user = userEvent.setup();
  const button = screen.getByText('like');

  // Click like button twice
  await user.click(button);
  await user.click(button);

  expect(mockLikeHandler.mock.calls).toHaveLength(2);
});

test('form correctly receives props with correct details when creating a new blog', async () => {
  const createBlog = vi.fn();
  const user = userEvent.setup();

  const { container } = render(<BlogForm createBlog={createBlog} />);

  const titleInput = container.querySelector('#title-input');
  const authorInput = container.querySelector('#author-input');
  const urlInput = container.querySelector('#url-input');

  await user.type(titleInput, 'Test Blog');
  await user.type(authorInput, 'root');
  await user.type(urlInput, 'www.testblog.com');

  const submitButton = screen.getByText('create');

  await user.click(submitButton);

  expect(createBlog.mock.calls).toHaveLength(1);
  console.log(createBlog.mock.calls);

  const returnedBlog = createBlog.mock.calls[0][0];
  expect(returnedBlog.title).toBe('Test Blog');
  expect(returnedBlog.author).toBe('root');
  expect(returnedBlog.url).toBe('www.testblog.com');
});
