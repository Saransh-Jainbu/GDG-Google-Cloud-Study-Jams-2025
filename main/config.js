// Configuration for different environments
const CONFIG = {
  // Automatically detect environment and set appropriate backend URL
  getBackendUrl: function() {
    // If we're on localhost, use local development server
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    
    // For production, use your actual Render backend URL
    return 'https://gdg-tracker-backend.onrender.com';
    
    // Alternative: if you deploy frontend and backend together, you can use relative URLs
    // return ''; // This would use the same domain
  }
};

// Export for use in other scripts
window.CONFIG = CONFIG;