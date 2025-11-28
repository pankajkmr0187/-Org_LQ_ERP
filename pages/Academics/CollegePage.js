// File: pages/Academics/CollegePage.js

export class CollegePage {

  constructor(page) {
    this.page = page;

    // Sidebar
    this.academicsMenu = page.locator('//span[text()="Academics"]');
    this.collegeTab = page.getByRole("link", { name: "College" });

    // Form fields (correct locators from HTML)
    this.collegeName = page.locator('input[name="name"]');
    this.collegeCode = page.locator('input[name="ccode"]');
    this.collegeType = page.locator('select[name="type"]');
    this.collegeAddress = page.locator('textarea[name="address"]');
    this.collegeEmail = page.locator('input[name="email"]');
    this.coursesAffiliated = page.locator('input[placeholder="Type course & press Enter"]');

    this.submitBtn = page.getByRole("button", { name: "Save College" });
    this.addNewCollegeBtn = page.getByRole("button", { name: "Add New College" });
    this.addNewCollegeHeading = page.getByRole("heading", { name: "Add New College" });
  }

  async openCollegePage() {
    await this.academicsMenu.click();
    await this.collegeTab.click();
    console.log("Navigated to College Page.");
  }

  async openAddCollegeForm() {
    await this.addNewCollegeBtn.click();
    await this.addNewCollegeHeading.waitFor({ timeout: 5000 });
    console.log("Add New College form opened.");
  }
}
