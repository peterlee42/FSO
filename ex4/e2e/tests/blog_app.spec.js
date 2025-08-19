const { test, expect } = require('@playwright/test');
const { loginWith, createBlog } = require('./helper');

test.describe('Blog App', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users/', {
      data: {
        name: 'John Doe',
        username: 'testinguser',
        password: 'password123',
      },
    });

    await request.post('/api/users/', {
      data: {
        name: 'Jane Smith',
        username: 'anotheruser',
        password: 'password456',
      },
    });

    page.goto('/');
  });

  test('login page can be opened', async ({ page }) => {
    const locator = page.getByText('log in to application');
    await expect(locator).toBeVisible();
  });

  test('login form opens home page', async ({ page }) => {
    await loginWith(page, 'testinguser', 'password123');
    await expect(page.getByText('John Doe is logged in')).toBeVisible();
  });

  test('login fails with wrong password', async ({ page }) => {
    loginWith(page, 'testinguser', 'wrongpassword');

    const errorDiv = page.locator('.error');
    await expect(errorDiv).toContainText('wrong username or password');
    await expect(errorDiv).toHaveCSS('border-style', 'solid');

    // color test
    // await expect(errorDiv).toHaveCSS('color', 'rgb(239,1,226)');

    await expect(page.getByText('John Doe is logged in')).not.toBeVisible();
  });

  test.describe('when logged in', () => {
    test.beforeEach(async ({ page }) => {
      await loginWith(page, 'testinguser', 'password123');
    });

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'test blog 1',
        author: 'playwright',
        url: 'www.playwright.dev',
      });

      const blogs = page.getByTestId('blog-item');
      await expect(blogs.filter({ hasText: 'test blog 1' })).toHaveCount(1);
    });

    test.describe('a blog exists', () => {
      test.beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: 'another test blog',
          author: 'playwright',
          url: 'www.playwright.dev',
        });
      });

      test('shows more information about blog', async ({ page }) => {
        await page.getByRole('button', { name: 'show' }).click();
        await expect(page.getByText('hide')).toBeVisible();
        await expect(
          page.getByText('www.playwright.dev', { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByText('playwright', { exact: true }),
        ).toBeVisible();
      });

      test('blog can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'show' }).click();
        await page.getByRole('button', { name: 'like' }).click();
        await expect(page.getByText('likes: 1')).toBeVisible();
      });

      test('blog can be deleted', async ({ page }) => {
        const secondBlogElement = page
          .getByTestId('blog-item')
          .filter({ hasText: 'another test blog' });

        await secondBlogElement.getByRole('button', { name: 'show' }).click();

        page.on('dialog', async (dialog) => await dialog.accept());
        await secondBlogElement.getByRole('button', { name: 'remove' }).click();

        await expect(
          page
            .getByTestId('blog-item')
            .filter({ hasText: 'another test blog' }),
        ).toHaveCount(0);
      });
    });

    test.describe('several blogs exist', () => {
      test.beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: 'first blog',
          author: 'playwright',
          url: 'www.playwright.dev',
          likes: 1,
        });
        await createBlog(page, {
          title: 'second blog',
          author: 'playwright',
          url: 'www.playwright.dev',
          likes: 3,
        });
        await createBlog(page, {
          title: 'third blog',
          author: 'playwright',
          url: 'www.playwright.dev',
          likes: 5,
        });
      });

      test('shows more information about one blog', async ({ page }) => {
        const secondBlogText = page.getByText('second blog');
        const secondBlogElement = secondBlogText.locator('../..');

        await secondBlogElement.getByRole('button', { name: 'show' }).click();
        await expect(
          secondBlogElement.getByRole('button', { name: 'hide' }),
        ).toBeVisible();
      });

      test('blog can be liked', async ({ page }) => {
        const secondBlogText = page.getByText('second blog');
        const secondBlogElement = secondBlogText.locator('../..');

        secondBlogElement.getByRole('button', { name: 'show' }).click();
        secondBlogElement.getByRole('button', { name: 'like' }).click();

        await expect(page.getByText('likes: 4')).toBeVisible();
      });

      test('a blog can be deleted', async ({ page }) => {
        const secondBlogElement = page
          .getByTestId('blog-item')
          .filter({ hasText: 'second blog' });

        await secondBlogElement.getByRole('button', { name: 'show' }).click();

        page.on('dialog', async (dialog) => await dialog.accept());
        await secondBlogElement.getByRole('button', { name: 'remove' }).click();

        await expect(
          page.getByTestId('blog-item').filter({ hasText: 'second blog' }),
        ).toHaveCount(0);
      });

      test('blogs are in the correct order', async ({ page }) => {
        // get all blogs and click show
        const blog_elements = await page.getByTestId('blog-item').all();
        for (const blog of blog_elements) {
          await blog.getByRole('button', { name: 'show' }).click();
        }

        // blogs are sorted in non-increasing order of likes
        const likes = await Promise.all(
          blog_elements.map(async (blog) => {
            const text = await blog.getByTestId('likes-count').innerText();
            return Number(text);
          }),
        );

        const is_sorted = likes.every((curr, i, arr) => {
          i === 0 || curr <= arr[i - 1];
        });

        expect(is_sorted).toBe(true);
      });
    });

    test.describe('exists multiple post from different users', () => {
      test.beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'logout' }).click();
        await loginWith(page, 'anotheruser', 'password456');
        await createBlog(page, {
          title: `another user's post`,
          author: 'Jane Smith',
          url: 'www.example.com',
        });

        await page.getByRole('button', { name: 'logout' }).click();
        await loginWith(page, 'testinguser', 'password123');
      });

      test('user can only remove their own posts', async ({ page }) => {
        const otherUserBlogText = page.getByText(`another user's post`);
        const otherUserBlogElement = otherUserBlogText.locator('../..');

        await expect(
          otherUserBlogElement.getByRole('button', { name: 'remove' }),
        ).toHaveCount(0);
      });
    });
  });
});
