// Build script for AutoVagas Chrome Extension
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Configuration
const config = {
  sourceDir: __dirname,
  outputDir: path.join(__dirname, 'dist'),
  outputFile: 'autovagas-extension.zip',
  filesToInclude: [
    'manifest.json',
    'background.js',
    'popup.html',
    'popup.js',
    'utils.js',
    'README.md',
    'styles/**/*',
    'scrapers/**/*',
    'content-scripts/**/*',
    'icons/**/*'
  ],
  filesToExclude: [
    'build.js',
    'node_modules/**/*',
    'dist/**/*',
    '*.zip'
  ]
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(config.outputDir, config.outputFile));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Extension packaged successfully: ${archive.pointer()} total bytes`);
  console.log(`Output file: ${path.join(config.outputDir, config.outputFile)}`);
});

// Handle warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Function to recursively add files to the archive
function addFilesToArchive(dir, baseDir = '') {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relativePath = path.join(baseDir, file);
    
    // Check if file should be excluded
    if (config.filesToExclude.some(pattern => {
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        return new RegExp(regexPattern).test(relativePath);
      }
      return relativePath === pattern;
    })) {
      continue;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively add files from subdirectory
      addFilesToArchive(filePath, relativePath);
    } else {
      // Add file to archive
      archive.file(filePath, { name: relativePath });
      console.log(`Added: ${relativePath}`);
    }
  }
}

// Add files to the archive
for (const pattern of config.filesToInclude) {
  if (pattern.includes('*')) {
    // Handle glob patterns
    const baseDir = pattern.split('*')[0];
    if (fs.existsSync(path.join(config.sourceDir, baseDir))) {
      addFilesToArchive(path.join(config.sourceDir, baseDir), baseDir);
    }
  } else {
    // Handle specific files
    const filePath = path.join(config.sourceDir, pattern);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: pattern });
      console.log(`Added: ${pattern}`);
    } else {
      console.warn(`Warning: File not found: ${pattern}`);
    }
  }
}

// Finalize the archive
archive.finalize();
