/**
 * Cotishama Frontend Application
 * Main entry point - Vanilla JS SPA
 *
 * Architecture:
 * - Core layer: API client, state, router, storage
 * - Modules: Feature-based organization
 * - Components: Reusable UI elements
 * - Utils: Helpers and formatters
 */

import { apiClient } from './core/api-client.js';
import { state } from './core/state.js';
import { router } from './core/router.js';
import { storage } from './core/storage.js';

/**
 * Initialize application
 */
const initializeApp = async () => {
  try {
    // Check authentication status
    const token = storage.get('auth_token');

    if (token) {
      // Validate token
      apiClient.setAuthToken(token);
      console.log('✓ User authenticated');
    } else {
      console.log('✓ User not authenticated');
    }

    // Initialize router
    router.initialize();

    // Navigate to home
    router.navigate('/');

    console.log('✓ Cotishama 2.0 initialized');
  } catch (error) {
    console.error('Initialization failed:', error);
    state.notify({
      type: 'error',
      message: 'Failed to initialize application',
    });
  }
};

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Handle graceful shutdown
window.addEventListener('beforeunload', () => {
  console.log('✓ Application closing');
});

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  state.notify({
    type: 'error',
    message: 'An unexpected error occurred',
  });
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  state.notify({
    type: 'error',
    message: 'An unexpected error occurred',
  });
});
