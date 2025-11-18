/**
 * Feature Flag System
 * Enables/disables features dynamically via environment variables
 */

// ============================================================================
// Feature Flag Definitions
// ============================================================================

const FEATURE_FLAGS = {
  // Enhanced AI scanning with Gemini 2.0
  WCAG_AI_ENHANCED: {
    key: 'FEATURE_WCAG_AI_ENHANCED',
    defaultValue: true,
    description: 'Enhanced WCAG scanning using Gemini 2.0 AI'
  },

  // Automatic rollback on errors
  AUTO_ROLLBACK: {
    key: 'FEATURE_AUTO_ROLLBACK',
    defaultValue: true,
    description: 'Automatic rollback when error thresholds exceeded'
  },

  // Email notifications
  EMAIL_NOTIFICATIONS: {
    key: 'FEATURE_EMAIL_NOTIFICATIONS',
    defaultValue: false,
    description: 'Send email notifications for scan completion'
  },

  // AAG badge generation
  BADGE_GENERATION: {
    key: 'FEATURE_BADGE_GENERATION',
    defaultValue: true,
    description: 'Generate AAG compliance badges'
  },

  // CEO outreach emails
  CEO_OUTREACH: {
    key: 'FEATURE_CEO_OUTREACH',
    defaultValue: false,
    description: 'Automated CEO outreach email generation'
  },

  // Lucy AI persona mode
  LUCY_MODE: {
    key: 'LUCY_MODE',
    defaultValue: false,
    description: 'Enable Lucy AI persona for enhanced UX'
  }
};

// ============================================================================
// Feature Flag Checker
// ============================================================================

function isFeatureEnabled(featureName) {
  const feature = FEATURE_FLAGS[featureName];

  if (!feature) {
    console.warn(`Unknown feature flag: ${featureName}`);
    return false;
  }

  const envValue = process.env[feature.key];

  // If not set, use default
  if (envValue === undefined) {
    return feature.defaultValue;
  }

  // Parse boolean from string
  return envValue === 'true' || envValue === '1';
}

// ============================================================================
// Feature Flag Middleware
// ============================================================================

function requireFeature(featureName, fallbackHandler) {
  return (req, res, next) => {
    if (isFeatureEnabled(featureName)) {
      next();
    } else {
      // Feature is disabled
      if (fallbackHandler) {
        fallbackHandler(req, res);
      } else {
        res.status(503).json({
          error: 'Feature unavailable',
          feature: featureName,
          message: `The ${featureName} feature is currently disabled`
        });
      }
    }
  };
}

// ============================================================================
// Get All Feature Flags (for admin dashboard)
// ============================================================================

function getAllFeatureFlags() {
  const flags = {};

  for (const [name, config] of Object.entries(FEATURE_FLAGS)) {
    flags[name] = {
      enabled: isFeatureEnabled(name),
      description: config.description,
      env_var: config.key
    };
  }

  return flags;
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// In routes:
const { isFeatureEnabled, requireFeature } = require('../middleware/feature-flags');

// Check feature inline
router.post('/api/scan', async (req, res) => {
  if (isFeatureEnabled('WCAG_AI_ENHANCED')) {
    // Use enhanced AI scanning
    result = await enhancedAIScan(url);
  } else {
    // Fallback to basic scanning
    result = await basicScan(url);
  }
});

// Require feature with middleware
router.post('/api/outreach/ceo',
  requireFeature('CEO_OUTREACH'),
  async (req, res) => {
    // This only runs if CEO_OUTREACH is enabled
  }
);

// Require feature with fallback
router.post('/api/email/notify',
  requireFeature('EMAIL_NOTIFICATIONS', (req, res) => {
    // Custom fallback
    res.status(200).json({
      message: 'Email notifications are disabled, scan completed'
    });
  }),
  async (req, res) => {
    // Send email
  }
);
*/

module.exports = {
  isFeatureEnabled,
  requireFeature,
  getAllFeatureFlags,
  FEATURE_FLAGS
};
