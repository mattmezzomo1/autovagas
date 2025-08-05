const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure coverage directory exists
const coverageDir = path.join(__dirname, '../coverage');
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
}

// Run tests with coverage
console.log('Running tests with coverage...');
try {
  execSync('jest --coverage', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running tests:', error.message);
  process.exit(1);
}

// Generate HTML report
console.log('Generating HTML coverage report...');
try {
  // Check if lcov.info exists
  const lcovPath = path.join(coverageDir, 'lcov.info');
  if (!fs.existsSync(lcovPath)) {
    console.error('lcov.info not found. Coverage data may be missing.');
    process.exit(1);
  }
  
  // Generate HTML report using lcov
  execSync('npx lcov-report -o coverage/html', { stdio: 'inherit' });
  
  console.log('HTML coverage report generated at coverage/html/index.html');
} catch (error) {
  console.error('Error generating HTML report:', error.message);
  process.exit(1);
}

// Print coverage summary
console.log('Coverage summary:');
try {
  const summary = JSON.parse(fs.readFileSync(path.join(coverageDir, 'coverage-summary.json'), 'utf8'));
  
  const totalCoverage = summary.total;
  
  console.log('Lines:      ', `${totalCoverage.lines.pct.toFixed(2)}%`, `(${totalCoverage.lines.covered}/${totalCoverage.lines.total})`);
  console.log('Statements: ', `${totalCoverage.statements.pct.toFixed(2)}%`, `(${totalCoverage.statements.covered}/${totalCoverage.statements.total})`);
  console.log('Functions:  ', `${totalCoverage.functions.pct.toFixed(2)}%`, `(${totalCoverage.functions.covered}/${totalCoverage.functions.total})`);
  console.log('Branches:   ', `${totalCoverage.branches.pct.toFixed(2)}%`, `(${totalCoverage.branches.covered}/${totalCoverage.branches.total})`);
} catch (error) {
  console.error('Error reading coverage summary:', error.message);
}

// Check if coverage meets thresholds
console.log('\nChecking coverage thresholds...');
try {
  const jestConfig = require('../jest.config');
  const thresholds = jestConfig.coverageThreshold.global;
  
  const summary = JSON.parse(fs.readFileSync(path.join(coverageDir, 'coverage-summary.json'), 'utf8'));
  const totalCoverage = summary.total;
  
  let thresholdsFailed = false;
  
  if (totalCoverage.lines.pct < thresholds.lines) {
    console.error(`❌ Lines coverage (${totalCoverage.lines.pct.toFixed(2)}%) is below threshold (${thresholds.lines}%)`);
    thresholdsFailed = true;
  }
  
  if (totalCoverage.statements.pct < thresholds.statements) {
    console.error(`❌ Statements coverage (${totalCoverage.statements.pct.toFixed(2)}%) is below threshold (${thresholds.statements}%)`);
    thresholdsFailed = true;
  }
  
  if (totalCoverage.functions.pct < thresholds.functions) {
    console.error(`❌ Functions coverage (${totalCoverage.functions.pct.toFixed(2)}%) is below threshold (${thresholds.functions}%)`);
    thresholdsFailed = true;
  }
  
  if (totalCoverage.branches.pct < thresholds.branches) {
    console.error(`❌ Branches coverage (${totalCoverage.branches.pct.toFixed(2)}%) is below threshold (${thresholds.branches}%)`);
    thresholdsFailed = true;
  }
  
  if (!thresholdsFailed) {
    console.log('✅ All coverage thresholds met!');
  } else {
    console.error('\nCoverage thresholds not met. Please add more tests to improve coverage.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error checking coverage thresholds:', error.message);
}
