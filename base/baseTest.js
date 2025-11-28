//base/baseTest.js
import { test as base, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

export const test = base;

// Global afterEach hook: capture screenshot on failure with TC ID in filename
test.afterEach(async ({ page }, testInfo) => {
if (testInfo.status !== "passed") {
try {
const match = testInfo.title.match(/(TC\d+)/i);
const tcId = match ? match[1] : "N_A";
const safeTitle = testInfo.title.replace(/[^a-z0-9_-]/gi, "_");
const dir = path.join(process.cwd(), "test-results", "screenshots");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const filename = `${tcId}_${safeTitle}_${Date.now()}.png`;
const filepath = path.join(dir, filename);
await page.screenshot({ path: filepath, fullPage: true });
console.log(`📸 Failure screenshot saved: ${filepath}`);

// Print short, human-friendly failure summary to terminal
const errMsg = testInfo.error?.message || '';
let shortReason = '';

// Test timeout - extract locator/field info
if (errMsg.includes('Test timeout') || errMsg.includes('Timeout')) {
const locatorMatch = errMsg.match(/locator\(([^)]+)\)/) || errMsg.match(/waiting for selector "([^"]+)"/) || errMsg.match(/waiting for locator '([^']+)'/);
if (locatorMatch) {
const locator = locatorMatch[1].replace(/["'\\]/g, '').trim().slice(0, 100);
const fieldMatch = locator.match(/name="([^"]+)"/) || locator.match(/text\(\)="([^"]+)"/);
if (fieldMatch) {
shortReason = `Field '${fieldMatch[1]}' not found (locator: ${locator})`;
} else {
shortReason = `Locator not found: ${locator}`;
}
} else {
shortReason = 'Element not found (timeout)';
}
}
// strict mode violation
else if (errMsg.includes('strict mode violation')) {
const m = errMsg.match(/locator\(([^)]+)\)/);
const locator = m ? m[1].replace(/["'\\]/g, '').trim().slice(0, 100) : 'locator';
const fieldMatch = locator.match(/name="([^"]+)"/) || locator.match(/text\(\)="([^"]+)"/);
if (fieldMatch) {
shortReason = `Field '${fieldMatch[1]}' matched multiple elements`;
} else {
shortReason = `Locator ${locator} matched multiple elements`;
}
}
// Field validation errors
else if (errMsg.startsWith('FIELD_VALIDATION:')) {
shortReason = errMsg.replace('FIELD_VALIDATION:', '').trim();
}
// Default
else {
shortReason = errMsg.split('\n')[0];
}

if (shortReason) console.log('🔍 Short failure reason:', shortReason);
} catch (err) {
console.log("Error saving failure screenshot:", err);
}
}
});

export { expect };
