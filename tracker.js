/**
 * Bare Count Tracker - Minimalist GDPR-safe tracking solution
 * Tracks page visits and user interactions without cookies
 */
(function () {
  'use strict';

  // Mini UA Parser - inline implementation for ES5 compatibility
  function parseUserAgent() {
    var ua = navigator.userAgent || '';
    var browser = 'Unknown';
    var os = 'Unknown';

    // Browser detection
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1)
      browser = 'Chrome';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1)
      browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1)
      browser = 'Internet Explorer';

    // OS detection
    if (ua.indexOf('Windows NT') > -1) os = 'Windows';
    else if (ua.indexOf('Mac OS X') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iOS') > -1) os = 'iOS';

    return { browser: browser, os: os };
  }

  // Get configuration from script tag
  var config = (function getConfig() {
    var scripts = document.getElementsByTagName('script');
    var endpoint = '';
    var debug = false;

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      if (script.src && script.src.indexOf('tracker.js') > -1) {
        endpoint = script.getAttribute('data-endpoint') || '';
        debug = script.getAttribute('data-debug') === 'true';
        break;
      }
    }

    // Ensure trailing slash
    if (endpoint && endpoint.slice(-1) !== '/') {
      endpoint += '/';
    }

    return {
      endpoint: endpoint,
      debug: debug,
    };
  })();

  // Debug logging helper
  function debugLog(action, data) {
    if (config.debug) {
      console.log('[Bare Count Tracker]', action, data);
    }
  }

  // Generate unique session ID
  function generateUUID() {
    return (
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
    );
  }

  // Get or create session ID
  function getSessionId() {
    var sessionId = sessionStorage.getItem('bc_uuid');
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('bc_uuid', sessionId);
    }
    return sessionId;
  }

  // Check if visit was already sent this session
  function wasVisitSent() {
    return sessionStorage.getItem('bc_visit_sent') === 'true';
  }

  // Mark visit as sent
  function markVisitSent() {
    sessionStorage.setItem('bc_visit_sent', 'true');
  }

  // Track page visit (one-time per session)
  function trackVisit() {
    if (wasVisitSent()) {
      debugLog('Visit tracking blocked', 'Visit already sent this session');
      return; // Block repeated tracking on refresh
    }

    if (!config.endpoint) {
      console.warn('Bare Count Tracker: No endpoint specified');
      return;
    }

    var screen = window.innerWidth + 'x' + window.innerHeight;
    var url = config.endpoint + 'hit?screen=' + encodeURIComponent(screen);
    var sessionId = getSessionId();

    debugLog('Tracking visit', {
      url: url,
      screen: screen,
      sessionId: sessionId,
      referrer: document.referrer || 'Direct',
      timestamp: new Date().toISOString(),
    });

    // Send beacon and mark as sent
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      // Fallback for older browsers
      var img = new Image();
      img.src = url;
    }

    markVisitSent();
    debugLog('Visit tracked successfully', 'Marked as sent for this session');
  }

  // Track user action
  function trackAction(element, actionName) {
    if (!config.endpoint) {
      debugLog('Action tracking failed', 'No endpoint specified');
      return;
    }

    var sessionId = getSessionId();
    var startTime = window.bc_start || 0;
    var timeToAction = Math.round(performance.now() - startTime);

    // Get element details
    var elementId = element.id || '';
    var elementClass = element.className || '';
    var tagName = element.tagName.toLowerCase();

    // Get scroll position
    var scrollPosition = Math.round(
      window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
    );

    var actionData = {
      sessionId: sessionId,
      name: actionName,
      type: tagName,
      timeToAction: timeToAction,
      elementId: elementId,
      elementClass: elementClass,
      scrollPosition: scrollPosition,
    };

    debugLog('Tracking action', {
      element: element,
      actionName: actionName,
      data: actionData,
      url: config.endpoint + 'action',
    });

    var url = config.endpoint + 'action';
    var data = JSON.stringify(actionData);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, data);
      debugLog('Action sent via sendBeacon', actionData);
    } else {
      // Fallback for older browsers
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(data);
        debugLog('Action sent via XHR fallback', actionData);
      } catch (e) {
        debugLog('Action tracking failed', {
          error: e.message,
          data: actionData,
        });
      }
    }
  }

  // Delegated click handler
  function handleClick(event) {
    var target = event.target;
    if (!target) return;

    var shouldTrack = false;
    var actionName = '';

    // Check tracking conditions
    if (target.getAttribute('data-track') === 'true') {
      shouldTrack = true;
      actionName = target.getAttribute('data-track-name') || 'custom_action';
    } else if (target.tagName.toLowerCase() === 'a') {
      shouldTrack = true;
      actionName = 'link_click';
    } else if (target.tagName.toLowerCase() === 'button') {
      shouldTrack = true;
      actionName = 'button_click';
    }

    if (shouldTrack) {
      debugLog('Click detected on trackable element', {
        element: target.tagName.toLowerCase(),
        id: target.id || '(no id)',
        className: target.className || '(no class)',
        actionName: actionName,
        hasDataTrack: target.getAttribute('data-track') === 'true',
      });
      trackAction(target, actionName);
    } else {
      // Only log non-trackable clicks in debug mode for verbose debugging
      if (config.debug) {
        console.log(
          '[Bare Count Tracker] Click ignored on:',
          target.tagName.toLowerCase(),
          target
        );
      }
    }
  }

  // Initialize tracker
  function init() {
    // Store start time for performance calculations
    window.bc_start = performance.now();

    debugLog('Initializing Bare Count Tracker', {
      endpoint: config.endpoint,
      debug: config.debug,
      sessionId: getSessionId(),
      visitSent: wasVisitSent(),
      userAgent: navigator.userAgent,
      screen: window.innerWidth + 'x' + window.innerHeight,
    });

    // Track visit on first load
    if (document.readyState === 'loading') {
      debugLog('Document loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', trackVisit);
    } else {
      debugLog('Document ready, tracking visit immediately');
      trackVisit();
    }

    // Set up delegated click tracking
    document.addEventListener('click', handleClick, true);
    debugLog(
      'Click handler attached',
      'Ready to track button, link, and data-track clicks'
    );
  }

  // Start tracking when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Initial debug message
  if (config.debug) {
    console.log(
      '[Bare Count Tracker] Debug mode enabled. All tracking events will be logged to console.'
    );
  }
})();

// bare-count-tracker v1
