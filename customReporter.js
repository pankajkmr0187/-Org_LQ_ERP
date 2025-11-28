import fs from "fs";
import path from "path";

class CustomHTMLReporter {
  constructor(options) {
    this.outputFolder = options?.outputFolder || "reports";
    this.results = [];
  }

    // Simple HTML escaper for error messages/stacks
    escapeHtml(str) {
        if (!str) return "";
        // Remove ANSI color codes first
        const cleanStr = String(str).replace(/\u001b\[\d+m/g, '').replace(/\[\d+m/g, '');
        return cleanStr
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

  onTestEnd(test, result) {
    // Try to get full error details from various sources
    let fullError = null;
    if (result.error) {
        fullError = result.error.stack || result.error.message || JSON.stringify(result.error);
    }
    
    this.results.push({
      id: this.extractTestId(test.title),
      title: test.title,
      status: result.status,
      duration: result.duration,
                        errorMessage: result.error?.message || null,
                        errorStack: result.error?.stack || null,
                        attachments: result.attachments || [],
            // Prefer Playwright project name, fall back to suite title or file name
            projectName: (result.project && result.project.name) || test.parent?.title || (test.location && test.location.file) || "(no project)",
            shortError: this.summarizeError(fullError)
    });
  }

  extractTestId(title) {
    const match = title.match(/TC\d+/);
    return match ? match[0] : "N/A";
  }

    // Produce a short, human-friendly error summary
    summarizeError(errorMsg) {
        if (!errorMsg) return null;
        // Remove ANSI color codes
        const msg = String(errorMsg).replace(/\u001b\[\d+m/g, '').replace(/\[\d+m/g, '');
        
        // locator strict mode
        if (msg.includes('strict mode violation')) {
            const locatorMatch = msg.match(/locator\(([^)]+)\)/);
            const locator = locatorMatch ? locatorMatch[1].replace(/['"\s]+/g, '').slice(0, 80) : 'locator';
            return `Element matched multiple times: ${locator}`;
        }
        
        // Extract method and location from Error: locator.method: Test timeout
        if (msg.includes('Error: locator.')) {
            const methodMatch = msg.match(/Error: locator\.([a-z]+):/i);
            const atMatch = msg.match(/at .+\\([^\\]+\.js):(\d+)/);
            
            let result = 'Test timeout - ';
            if (methodMatch) {
                result += `trying to ${methodMatch[1]} element`;
            } else {
                result += 'element not responding';
            }
            
            if (atMatch) {
                result += ` (at ${atMatch[1]}:${atMatch[2]})`;
            }
            return result;
        }
        
        // Test timeout - generic
        if (msg.includes('Test timeout') || msg.includes('Timeout')) {
            // Try to find file location
            const atMatch = msg.match(/at .+\\([^\\]+\.js):(\d+)/);
            if (atMatch) {
                return `Test timeout - check element at ${atMatch[1]}:${atMatch[2]}`;
            }
            return 'Test timeout - element not found or action failed';
        }
        
        // Extract actual error from "waiting for locator" timeout messages
        if (msg.includes('waiting for locator')) {
            const locatorMatch = msg.match(/waiting for locator\(['"]([^'"]+)['"]/i);
            if (locatorMatch) {
                return `Element not found: ${locatorMatch[1]}`;
            }
        }
        
        // Generic waiting for
        if (msg.includes('waiting for')) {
            const lines = msg.split('\n');
            for (let line of lines) {
                if (line.includes('waiting for')) {
                    return line.trim();
                }
            }
        }
        
        // default: first line only
        return msg.split('\n')[0];
    }

    // Parse locator-related errors and extract a short message and possible field name
    parseLocatorError(errorMsg) {
        if (!errorMsg) return { short: null, field: null };
        const msg = String(errorMsg);
        // strict-mode or locator issues
        if (msg.includes('strict mode violation') || msg.includes('locator(') || msg.includes('waiting for selector') || msg.includes('waiting for locator')) {
            const locatorMatch = msg.match(/locator\(([^)]+)\)/) || msg.match(/waiting for selector "([^"]+)"/);
            let locator = locatorMatch ? locatorMatch[1] : null;
            if (locator) locator = locator.replace(/["'\s]+/g, '').trim();
            const short = locator ? `Locator not found: ${locator}` : `Locator not found`;

            // try to infer a field name from the locator
            let field = null;
            if (locator) {
                const nameMatch = locator.match(/name\s*=\s*([^\]]+)/i);
                if (nameMatch) field = nameMatch[1].replace(/['"\]]/g, '');
                else {
                    const textMatch = locator.match(/text\(\)\s*=\s*"([^"]+)"/) || locator.match(/text\(\)\s*=\s*'([^']+)'/);
                    if (textMatch) field = textMatch[1] || textMatch[2];
                }
            }
            return { short, field };
        }

        // test timeout messages often mean a locator wait timed out
        if (msg.includes('Test timeout') || msg.includes('Timeout')) {
            return { short: 'Locator not found', field: null };
        }

        return { short: msg.split('\n')[0], field: null };
    }

  async onEnd() {
    if (!fs.existsSync(this.outputFolder)) {
      fs.mkdirSync(this.outputFolder, { recursive: true });
    }

    const stats = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === "passed").length,
      failed: this.results.filter(r => r.status === "failed").length,
      skipped: this.results.filter(r => r.status === "skipped").length
    };

    const html = this.generateHTML(stats);
    fs.writeFileSync(path.join(this.outputFolder, "report.html"), html);
    console.log(`\nâœ… Custom HTML Report generated at: ${path.join(this.outputFolder, "report.html")}`);
  }

  generateHTML(stats) {
    const passPercentage = ((stats.passed / stats.total) * 100).toFixed(2);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - LearnQoch ERP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }

        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #667eea;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-card.passed {
            border-left-color: #10b981;
        }

        .stat-card.failed {
            border-left-color: #ef4444;
        }

        .stat-card.skipped {
            border-left-color: #f59e0b;
        }

        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }

        .stat-card.passed .stat-number {
            color: #10b981;
        }

        .stat-card.failed .stat-number {
            color: #ef4444;
        }

        .stat-card.skipped .stat-number {
            color: #f59e0b;
        }

        .stat-label {
            font-size: 0.9em;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .progress-section {
            padding: 30px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
        }

        .progress-label {
            font-weight: 600;
            margin-bottom: 10px;
            color: #374151;
        }

        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            display: flex;
        }

        .progress-fill-passed {
            background: linear-gradient(90deg, #10b981, #059669);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.85em;
        }

        .table-section {
            padding: 30px;
        }

        .table-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 20px;
            color: #1f2937;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        th {
            padding: 18px;
            text-align: left;
            font-weight: 600;
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 18px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 0.95em;
        }

        tbody tr:hover {
            background: #f9fafb;
            transition: background 0.2s ease;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-passed {
            background: #d1fae5;
            color: #065f46;
        }

        .status-failed {
            background: #fee2e2;
            color: #7f1d1d;
        }

        .status-skipped {
            background: #fef3c7;
            color: #92400e;
        }

        .duration {
            color: #6b7280;
            font-weight: 500;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            font-size: 0.9em;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }

            .stats-container {
                grid-template-columns: 1fr;
            }

            table {
                font-size: 0.85em;
            }

            th, td {
                padding: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Execution Report</h1>
            <p>LearnQoch ERP - Automation Test Suite</p>
        </div>

        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-label">Total Tests</div>
                <div class="stat-number">${stats.total}</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-label">✅ Passed</div>
                <div class="stat-number">${stats.passed}</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-label">❌ Failed</div>
                <div class="stat-number">${stats.failed}</div>
            </div>
            <div class="stat-card skipped">
                <div class="stat-label">⏭️ Skipped</div>
                <div class="stat-number">${stats.skipped}</div>
            </div>
        </div>

        <div class="progress-section">
            <div class="progress-label">Overall Pass Rate: ${passPercentage}%</div>
            <div class="progress-bar">
                <div class="progress-fill-passed" style="width: ${passPercentage}%">
                    ${passPercentage}%
                </div>
            </div>
        </div>

        <div class="table-section">
            <div class="table-title">📋 Test Cases Details</div>
            <table>
                <thead>
                    <tr>
                        <th>TC ID</th>
                        <th>Test Description</th>
                        <th>Status</th>
                        <th>Duration (ms)</th>
                        <th>Project</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.results.map(result => `
                    <tr>
                        <td><strong>${result.id}</strong></td>
                        <td>${result.title}</td>
                        <td>
                            <span class="status-badge status-${result.status}">
                                ${result.status === "passed" ? "✅" : result.status === "failed" ? "❌" : "⏭️"} ${result.status}
                            </span>
                        </td>
                        <td><span class="duration">${result.duration}ms</span></td>
                        <td>${result.projectName}</td>
                        <td>
                          ${result.shortError ? `<div style="max-width:320px; color:#7f1d1d; font-weight:600">${this.escapeHtml(result.shortError)}</div>
                          <details style="margin-top:6px;"><summary style="cursor:pointer">View stack</summary><pre style="white-space:pre-wrap; color:#374151">${this.escapeHtml(result.errorStack || '')}</pre></details>
                                                    ${result.attachments && result.attachments.length ? `<div style="margin-top:6px">Attachments:<ul>` + result.attachments.map(a => `<li><a href="${a.path || a.name}" target="_blank">${a.name || a.path}</a></li>`).join('') + `</ul></div>` : ''}` : ''}
                        </td>
                    </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default CustomHTMLReporter;

