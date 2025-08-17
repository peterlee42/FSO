const { test, expect } = require('@playwright/test');

test.describe('Blog App', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset');
    await request.post('http://localhost:3003/api/users/', {
      data: {
        name: 'John Doe',
        username: 'testinguser',
        password: 'password123',
      },
    });

    page.goto('http://localhost:5173');
  });

  test('login page can be opened', async ({ page }) => {
    const locator = page.getByText('log in to application');
    await expect(locator).toBeVisible();
  });

  test('login form opens home page', async ({ page }) => {
    await page.getByTestId('username').fill('testinguser');
    await page.getByTestId('password').fill('password123');

    // const textboxes = await page.getByRole('textbox').all();
    // await textboxes[0].fill('root');
    // await textboxes[1].fill('password123');

    await page.getByRole('button', { name: 'login' }).click();

    await expect(page.getByText('Peter Lee is logged in')).toBeVisible();
  });

  test('login fails with wrong password', async ({ page }) => {
    await page.getByTestId('username').fill('testinguser');
    await page.getByTestId('password').fill('wrongpassword');

    await page.getByRole('button', { name: 'login' }).click();

    const errorDiv = page.locator('.error');
    await expect(errorDiv).toContainText('wrong username or password');
    await expect(errorDiv).toHaveCSS('border-style', 'solid');
    await expect(errorDiv).toHaveCSS('color', 'rgb(239,1,226)');
  });

  test.describe('when logged in', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173');
      await page.getByTestId('username').fill('testinguser');
      await page.getByTestId('password').fill('password123');
      await page.getByRole('button', { name: 'login' }).click();
    });

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click();

      await page.getByTestId('title').fill('test blog 1');
      await page.getByTestId('author').fill('playwright');
      await page.getByTestId('url').fill('www.playwright.dev');

      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByText('test blog')).toBeVisible();
    });

    test.describe('a note exists', () => {
      test.beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'new blog' }).click();

        await page.getByTestId('title').fill('test blog 2');
        await page.getByTestId('author').fill('playwright');
        await page.getByTestId('url').fill('www.playwright.dev');
      });

      // todo: check that show works
    });
  });
});
