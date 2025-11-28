# LearnQoch ERP - Playwright Test Automation

## 📋 Overview
Automated testing framework for LearnQoch ERP using Playwright with custom HTML reporting.

## ✨ Features
- ✅ Custom HTML Report with beautiful UI
- ✅ Playwright Built-in HTML Report
- ✅ JUnit XML Report
- ✅ GitHub Actions CI/CD Integration
- ✅ Email Report Delivery
- ✅ Screenshot & Video on Failure
- ✅ Session-based Authentication

## 🚀 Setup

### Prerequisites
- Node.js (LTS version)
- npm or yarn

### Installation
```bash
npm install
npx playwright install --with-deps
```

## 🧪 Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test tests/Academics/College.spec.js
```

### Run Specific Test Case
```bash
npx playwright test tests/Academics/College.spec.js:34
```

### Run in Headed Mode
```bash
npx playwright test --headed
```

### View Reports
```bash
# View Playwright HTML Report
npx playwright show-report

# Open Custom HTML Report
start reports/report.html
```

## 📊 Reports

### Custom HTML Report
- Location: `reports/report.html`
- Beautiful gradient UI with emojis
- Clear error messages
- Test case details with TC IDs
- Screenshots, videos, and error context links

### Playwright HTML Report
- Location: `playwright-report/index.html`
- Detailed test traces
- Step-by-step execution logs

### JUnit XML Report
- Location: `test-results/junit.xml`
- For CI/CD integration

## 🔧 Configuration

### Timeout Settings
- Global test timeout: **5 seconds**
- Assertion timeout: **5 seconds**
- Login test timeout: **10 seconds**

### Browser Configuration
- Browser: Chromium
- Mode: Headed (visible browser)
- Screenshot: On failure only
- Video: Retain on failure

## 🔐 Authentication
Tests use session-based authentication stored in `auth.json`. The setup project runs first to generate the session.

## 📧 GitHub Actions & Email Reports

### GitHub Secrets Required
Set these in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **EMAIL_USERNAME** - Your Gmail address (e.g., `yourname@gmail.com`)
2. **EMAIL_PASSWORD** - Gmail App Password (not your regular password)
3. **EMAIL_TO** - Recipient email address(es)

### How to Generate Gmail App Password
1. Go to Google Account Settings
2. Security → 2-Step Verification (enable if not enabled)
3. Search for "App passwords"
4. Create new app password for "Mail"
5. Copy the 16-character password
6. Add to GitHub Secrets as `EMAIL_PASSWORD`

### Trigger GitHub Actions
```bash
# Push to main/master branch
git push origin main

# Or trigger manually from GitHub Actions tab
```

### What Gets Emailed
- Custom HTML Report (`reports/report.html`)
- Playwright HTML Report (`playwright-report/index.html`)
- Repository, branch, commit details
- Direct link to GitHub Actions run

## 📁 Project Structure
```
.
├── .github/
│   └── workflows/
│       └── playwright.yml        # GitHub Actions workflow
├── base/
│   ├── BasePage.js              # Base page class
│   └── baseTest.js              # Base test with hooks
├── pages/
│   ├── LoginPage.js
│   └── Academics/
│       └── CollegePage.js
├── tests/
│   ├── auth.setup.spec.js       # Login setup
│   └── Academics/
│       └── College.spec.js      # College tests
├── utils/
│   ├── screenshotHelper.js
│   └── validationHelper.js
├── reports/                      # Custom HTML reports
├── playwright-report/            # Playwright HTML reports
├── test-results/                 # Screenshots, videos, JUnit XML
├── customReporter.js            # Custom HTML reporter
├── playwright.config.js         # Playwright configuration
└── package.json
```

## 🎯 Test Cases

### College Module
- **TC01**: Open Add New College Form
- **TC02**: Validate Required Fields on Empty Submit
- **TC03**: Add New College with Random Data

## 🐛 Troubleshooting

### Tests Timing Out
- Default timeout is 5 seconds
- Check if elements are loading slowly
- Adjust timeout in specific tests if needed

### Email Not Sending
- Verify GitHub Secrets are set correctly
- Ensure Gmail App Password (not regular password)
- Check spam folder for emails

### Reports Not Generated
- Ensure tests complete (pass or fail)
- Check `reports/` and `playwright-report/` folders
- Review GitHub Actions logs

## 🤝 Contributing
1. Create feature branch
2. Make changes
3. Run tests locally
4. Push and create PR

## 📝 License
Private repository - All rights reserved
