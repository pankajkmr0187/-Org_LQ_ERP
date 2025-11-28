// File: tests/Academics/College.spec.js

import { test, expect } from "../../base/baseTest.js";
import { CollegePage } from "../../pages/Academics/CollegePage.js";
import { collectValidationErrors } from "../../utils/validationHelper.js";

// Random Helpers
function random(prefix) {
  return `${prefix}_${Math.floor(100 + Math.random() * 900)}`;
}
function randomEmail() {
  return `auto_${Math.floor(1000 + Math.random() * 9000)}@mail.com`;
}

test.describe("College Suite", () => {

  // ----------------------------------
  // TC01: COMMENTED
  // ----------------------------------
  
  test("TC01: Open Add New College Form", async ({ page }) => {});
  

  // ----------------------------------
  // TC02: COMMENTED
  // ----------------------------------
  
  test("TC02: Validate Required Fields on Empty Submit", async ({ page }) => {});
  

  // ----------------------------------
  // TC03: Add New College with Random Data
  // ----------------------------------
  test("TC03: Add New College with Random Data", async ({ page }) => {
    
    const collegePage = new CollegePage(page);

    try {

      await page.goto("https://lq-new.learnqoch.com/dashboard");

      await collegePage.openCollegePage();
      await collegePage.openAddCollegeForm();

      // Generate random data
      const collegeName = random("College");
      const collegeCode = random("Code");
      const address = random("Address");
      const email = randomEmail();
      const course1 = random("Course");
      const course2 = random("Course");

      // Fill form
      await collegePage.collegeName.fill(collegeName);
      await collegePage.collegeCode.fill(collegeCode);

      // Dropdown random select
      const options = ["Affiliated", "Autonomous", "Private", "Govt."];
      const selected = options[Math.floor(Math.random() * options.length)];

      await collegePage.collegeType.selectOption({ label: selected });

      await collegePage.collegeAddress.fill(address);
      await collegePage.collegeEmail.fill(email);

      // Fill courses
      await collegePage.coursesAffiliated.fill(course1);
      await page.keyboard.press("Enter");

      await collegePage.coursesAffiliated.fill(course2);
      await page.keyboard.press("Enter");

      await collegePage.submitBtn.click();

      // allow validation messages to appear then collect them
      await page.waitForTimeout(500);
      const validationErrors = await collectValidationErrors(page);
      if (validationErrors && validationErrors.length) {
        const msgs = validationErrors.map(e => `${e.related || e.selector}: ${e.message}`).join(' | ');
        // print to terminal and fail with a clear message so reporter captures it
        console.log('Field validation failed:', msgs);
        throw new Error(`FIELD_VALIDATION: ${msgs}`);
      }

      console.log("TC03 Passed");

    } catch (error) {
      console.log("❌ TC03 Failed");
      throw error;
    }

  });

});
