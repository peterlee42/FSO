const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  await page.getByRole('button', { name: 'login' }).click();
};

const createBlog = async (page, content) => {
  const { title, author, url } = content;

  await page.getByRole('button', { name: 'new blog' }).click();

  await page.getByTestId('title').fill(title);
  await page.getByTestId('author').fill(author);
  await page.getByTestId('url').fill(url);

  await page.getByRole('button', { name: 'create' }).click();
  await page.getByTestId('blog-item').getByText(title).waitFor();
};

export { loginWith, createBlog };
