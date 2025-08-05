// Utility to suppress specific console errors during development
// This is especially useful for third-party libraries that throw non-critical errors

// Original console.error function
const originalConsoleError = console.error;

// Override console.error to filter out specific errors
console.error = function(...args: any[]) {
  // Check if this is the message channel error from YouTube or other iframes
  const errorMessage = args[0]?.toString() || '';
  
  if (
    errorMessage.includes('message channel closed') ||
    errorMessage.includes('asynchronous response') ||
    // Add other error patterns to ignore here
    false
  ) {
    // Ignore these specific errors
    return;
  }
  
  // Pass through all other errors to the original console.error
  originalConsoleError.apply(console, args);
};

export {};
