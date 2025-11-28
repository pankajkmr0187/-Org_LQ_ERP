//login.spec.skip.js

import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("Login Passed!!", async ({ page }) => {

    const login = new LoginPage(page);

    await login.login("superadmin@dev", "supe@160325$");

    await page.context().storageState({ path: "auth.json" });

    console.log("🔥 Login Successfully!!");
});