/**
 * Session & Action Tracking
 * Frontend Integration Example
 */

class AnalyticsTracker {
  constructor(apiBaseUrl = 'http://localhost:4000') {
    this.apiBaseUrl = apiBaseUrl;
    this.sessionId = this.getStoredSessionId();
    this.pageLoadTime = Date.now();
  }

  /**
   * Get session ID from sessionStorage or null if not exists
   */
  getStoredSessionId() {
    return sessionStorage.getItem('analytics_session_id');
  }

  /**
   * Store session ID in sessionStorage
   */
  storeSessionId(sessionId) {
    sessionStorage.setItem('analytics_session_id', sessionId);
    this.sessionId = sessionId;
  }

  /**
   * Initialize tracking by recording a visit
   */
  async initializeSession() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/hit`, {
        method: 'GET',
        headers: {
          'User-Agent': navigator.userAgent,
        },
      });

      const data = await response.json();

      if (data.success && data.sessionId) {
        this.storeSessionId(data.sessionId);
        console.log('🚀 Analytics session initialized:', data.sessionId);
        return data.sessionId;
      }
    } catch (error) {
      console.error('❌ Failed to initialize analytics session:', error);
    }
    return null;
  }

  /**
   * Track user action with enterprise-level precision
   */
  async trackAction({
    name,
    type = 'click',
    elementId,
    elementClass = '',
    additionalData = {},
  }) {
    const timeToAction = Date.now() - this.pageLoadTime;
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    const actionData = {
      name,
      type,
      timeToAction,
      elementId,
      elementClass,
      scrollPosition,
      sessionId: this.sessionId, // Use existing session or let server generate
      url: window.location.href,
      ...additionalData,
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });

      const data = await response.json();

      if (data.success) {
        // Update sessionId if server provided a new one
        if (data.sessionId && data.sessionId !== this.sessionId) {
          this.storeSessionId(data.sessionId);
        }

        console.log('📊 Action tracked:', {
          action: name,
          sessionId: data.sessionId,
          timeToAction: `${timeToAction}ms`,
        });

        return data;
      }
    } catch (error) {
      console.error('❌ Failed to track action:', error);
    }
    return null;
  }

  /**
   * Auto-track clicks on elements with data-track attribute
   */
  setupAutoTracking() {
    document.addEventListener('click', (event) => {
      const element = event.target.closest('[data-track]');
      if (element) {
        const trackingData = {
          name: element.dataset.track,
          type: 'click',
          elementId: element.id || 'unknown',
          elementClass: element.className || 'unknown',
        };

        // Add any additional data attributes
        Object.keys(element.dataset).forEach((key) => {
          if (key.startsWith('track') && key !== 'track') {
            const dataKey = key.replace(/^track/, '').toLowerCase();
            trackingData[dataKey] = element.dataset[key];
          }
        });

        this.trackAction(trackingData);
      }
    });

    console.log('🎯 Auto-tracking enabled for [data-track] elements');
  }

  /**
   * Get analytics stats (for admin/debugging)
   */
  async getStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/action/stats`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get analytics stats:', error);
      return null;
    }
  }
}

// Usage Example:
async function initializeAnalytics() {
  const tracker = new AnalyticsTracker();

  // Initialize session on page load
  await tracker.initializeSession();

  // Setup automatic tracking
  tracker.setupAutoTracking();

  // Manual tracking examples
  document.getElementById('newsletter-btn')?.addEventListener('click', () => {
    tracker.trackAction({
      name: 'newsletter_signup',
      type: 'click',
      elementId: 'newsletter-btn',
      elementClass: 'btn btn-primary',
      email: document.getElementById('email-input')?.value,
    });
  });

  return tracker;
}

// HTML Usage Examples:
/*
<!-- Auto-tracked elements -->
<button data-track="cta_click" data-track-campaign="summer_sale" id="main-cta" class="btn btn-lg">
  Get Started
</button>

<a data-track="download_click" data-track-file="whitepaper.pdf" href="/download">
  Download
</a>

<form data-track="contact_form" id="contact-form">
  <button type="submit">Submit</button>
</form>

<!-- Manual tracking -->
<button id="newsletter-btn" class="btn btn-primary">
  Subscribe
</button>
*/

// Initialize on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeAnalytics);
}

export { AnalyticsTracker };
