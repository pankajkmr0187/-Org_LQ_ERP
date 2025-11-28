import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";

test("Login setup - generate session", async ({ page }) => {
  test.setTimeout(10000); // 10 seconds for login only
  
  const login = new LoginPage(page);

  await page.goto("https://lq-new.learnqoch.com");
  await login.login("superadmin@dev", "supe@160325$");

  await page.context().storageState({ path: "auth.json" });
  console.log("Auth session created successfully!");
});
