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
    });

    test.describe('several blogs exist', () => {
      test.beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: 'first blog',
          author: 'playwright',
          url: 'www.playwright.dev',
        });
        await createBlog(page, {
          title: 'second blog',
          author: 'playwright',
          url: 'www.playwright.dev',
        });
        await createBlog(page, {
          title: 'third blog',
          author: 'playwright',
          url: 'www.playwright.dev',
        });
      });

      test('shows more information about one blog', async ({ page }) => {
        const otherBlogText = page.getByText('second blog');
        const otherBlogElement = otherBlogText.locator('../..');

        await otherBlogElement.getByRole('button', { name: 'show' }).click();
        await expect(otherBlogElement.getByText('hide')).toBeVisible();
      });
    });
  });
});
