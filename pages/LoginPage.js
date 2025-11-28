export class LoginPage {
    constructor(page) {
        this.page = page;

        this.username = "//input[@type='email']";
        this.password = "//input[@type='password']";
        this.loginBtn = "//button[contains(text(), 'Login')]";
        this.okBtn = "//a[contains(@class,'btn-confirm') and text()='OK']";
        this.dashboardHeader = "//p[contains(text(), 'Here')]";
    }

    async login(email, pass) {
        await this.page.fill(this.username, email);
        await this.page.fill(this.password, pass);
        await this.page.click(this.loginBtn);

        await this.page.waitForSelector(this.okBtn, { timeout: 5000 });
        await this.page.click(this.okBtn);

        await this.page.waitForLoadState("networkidle");
        console.log("Login Successful!");
    }
}
