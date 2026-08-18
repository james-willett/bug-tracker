import { test, expect } from "@playwright/test";

test("Bug creation and deletion flow", async ({ page }) => {
  page.on("console", (msg) => {
    console.log(`Browser console [${msg.type()}]: ${msg.text()}`);
  });

  console.log("Starting test......");

  await page.goto("/");
  console.log("Navigated to homepage");

  console.log("Page content:", await page.content());

  await page.waitForLoadState("networkidle");
  console.log("Page loaded");

  await page.waitForSelector('button:text("Add New Bug")', { timeout: 60000 });
  console.log("Found Add New Bug button");

  await page.click('button:text("Add New Bug")');
  console.log("Clicked Add New Bug button");

  console.log("Waiting for modal...");
  await page.waitForSelector('[data-testid="add-bug-modal"]', {
    timeout: 60000,
  });
  console.log("Modal found");

  await page.waitForSelector('[data-testid="add-bug-form"]', {
    timeout: 60000,
  });
  console.log("Form found");

  const modalContent = await page
    .locator('[data-testid="add-bug-modal"]')
    .innerHTML();
  console.log("Modal content:", modalContent);

  const uniqueTitle = `Test Bug ${Date.now()}`;

  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="description"]', "This is a test bug");
  await page.selectOption('select[name="priority"]', "Medium");
  await page.click('button:text("Add Bug")');

  await expect(page.locator(`a:text("${uniqueTitle}")`).first()).toBeVisible();

  await page.locator(`a:text("${uniqueTitle}")`).first().click();

  await expect(page.locator(`h1:text('${uniqueTitle}')`)).toBeVisible();
  await expect(page.locator("text=This is a test bug")).toBeVisible();
  await expect(page.locator("text=Medium")).toBeVisible();

  await page.click("text=Delete Bug");
  await page.click("text=Confirm");

  await expect(page.locator(`a:text("${uniqueTitle}")`).first()).toBeHidden();
});

test("Adding a comment to a bug", async ({ page }) => {
  console.log("Starting comment test...");

  await page.goto("/");
  console.log("Navigated to homepage");

  await page.click('button:text("Add New Bug")');
  await page.waitForSelector('[data-testid="add-bug-form"]', {
    timeout: 60000,
  });

  const uniqueTitle = `Bug for Comment ${Date.now()}`;

  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="description"]', "This bug needs a comment");
  await page.selectOption('select[name="priority"]', "Medium");
  await page.click('button:text("Add Bug")');

  await expect(page.locator(`a:text("${uniqueTitle}")`).first()).toBeVisible();
  await page.locator(`a:text("${uniqueTitle}")`).first().click();

  await page.waitForSelector('[data-testid="comment-form"]', {
    timeout: 60000,
  });
  console.log("Comment form found");

  const timestamp = "test-comment-" + Math.random().toString(36).substring(7);
  await page.fill(
    '[data-testid="comment-content"]',
    `Test comment ${timestamp}`
  );
  await page.fill('[data-testid="comment-author"]', `Test User ${timestamp}`);
  await page.click('button:text("Add Comment")');

  await expect(page.locator(`p:text('Test comment ${timestamp}')`)).toBeVisible(
    { timeout: 10000 }
  );
});

test("Editing a bug", async ({ page }) => {
  console.log("Starting edit bug test...");

  await page.goto("/");
  await page.click('button:text("Add New Bug")');
  await page.waitForSelector('[data-testid="add-bug-form"]', {
    timeout: 60000,
  });

  const uniqueTitle = `Bug to Edit ${Date.now()}`;

  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="description"]', "This bug will be edited");
  await page.selectOption('select[name="priority"]', "Low");
  await page.click('button:text("Add Bug")');

  await page.locator(`a:text("${uniqueTitle}")`).first().click();

  await page.click('button:text("Edit Bug")');
  console.log("Clicked edit button");

  await page.waitForSelector('[data-testid="edit-bug-form"]', {
    timeout: 60000,
  });
  console.log("Edit form found");

  const formContent = await page
    .locator('[data-testid="edit-bug-form"]')
    .innerHTML();
  console.log("Edit form content:", formContent);

  const uniqueEditedTitle = `Edited Bug Title ${Date.now()}`;
  await page.fill('input[name="title"]', uniqueEditedTitle);
  await page.fill('textarea[name="description"]', "This bug has been edited");
  await page.selectOption('select[name="priority"]', "High");
  await page.click('button:text("Save Changes")');

  await expect(page.locator(`h1:text('${uniqueEditedTitle}')`)).toBeVisible();
  await expect(page.locator(`text=This bug has been edited`)).toBeVisible();
  await expect(page.locator(`text=High`)).toBeVisible();
});
