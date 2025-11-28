// utils/screenshotHelper.js
// Helper to take screenshots at each test step

export class ScreenshotHelper {
  constructor(page, testName) {
    this.page = page;
    this.testName = testName;
    this.stepCounter = 0;
  }

  async captureStep(stepName) {
    this.stepCounter++;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${this.testName}_step_${this.stepCounter}_${stepName}_${timestamp}.png`;
    
    await this.page.screenshot({ 
      path: `test-results/screenshots/${filename}`,
      fullPage: true 
    });
    
    console.log(`📸 Screenshot saved: ${filename}`);
  }
}
