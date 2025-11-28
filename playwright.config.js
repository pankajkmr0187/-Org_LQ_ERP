import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  
  // Timeout configuration
  timeout: 5000, // 5 seconds per test
  expect: {
    timeout: 5000 // 5 seconds for assertions
  },
  
  // Screenshots & Videos configuration
  screenshot: "only-on-failure", // "on", "off", "only-on-failure"
  video: "retain-on-failure",    // "on", "off", "retain-on-failure"
  
  // Reporter configuration with custom HTML report
  reporter: [
    ["./customReporter.js", { outputFolder: "reports" }],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["list"]
  ],

  projects: [

    // 1) Setup login project
    {
      name: "setup",
      testMatch: ["**/auth.setup.spec.js"],
      use: {
        storageState: undefined,
        headless: false,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        launchOptions: process.env.SLOW_MO ? { slowMo: Number(process.env.SLOW_MO) } : undefined
      }
    },

    // 2) Main tests
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        headless: false,
        storageState: "auth.json",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        launchOptions: process.env.SLOW_MO ? { slowMo: Number(process.env.SLOW_MO) } : undefined
      },
      dependencies: ["setup"],
      testIgnore: ["**/auth.setup.spec.js"]
    }
  ]
});
