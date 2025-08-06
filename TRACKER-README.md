 # 📊 Bare Count Tracker

> Minimalist GDPR-safe JavaScript tracker for visits and actions without cookies. It just works.

## 🚀 Quick Start (for people in a hurry)

### 1. Upload the file
Copy `tracker.js` somewhere your browser can reach (CDN, static files, whatever).

### 2. Add to HTML
```html
<script
  src="https://yourdomain.com/tracker.js"
  data-endpoint="https://your-api-endpoint.com/"
></script>
```

### 3. Profit! 💰
The tracker will automatically start tracking:
- ✅ Page visits (only once per session)
- ✅ Clicks on buttons and links
- ✅ Elements with `data-track="true"`

---

## 📖 Basic Information

### What does it do?
- **Tracks visits** - who came, from where, what device
- **Tracks actions** - what user clicked, where, when
- **Respects privacy** - no cookies, only sessionStorage
- **Is fast** - under 6kB, zero dependencies

### What it DOESN'T do?
- ❌ Doesn't store cookies
- ❌ Doesn't track across sessions (GDPR-safe)
- ❌ Doesn't need user consent
- ❌ Doesn't send PII data

---

## 🔧 Configuration (Need to Know)

### Basic setup
```html
<script
  src="/path/to/tracker.js"
  data-endpoint="https://api.example.com/"
></script>
```

### Development setup (with debug mode)
```html
<script
  src="/path/to/tracker.js"
  data-endpoint="https://api.example.com/"
  data-debug="true"
></script>
```

**⚠️ Important:** 
- `data-endpoint` MUST end with slash `/` (tracker adds it automatically, but better do it yourself)
- API must have endpoints `/hit` (GET) and `/action` (POST)
- `data-debug="true"` enables console logging for all tracking events (use only in development)

### What gets tracked automatically?

#### 🎯 Visits (once per session)
```javascript
// Automatically on page load
GET /hit?screen=1920x1080
```

#### 🎯 Clicks
```javascript
// On these elements automatically:
<button>Click me</button>           // ✅ tracks
<a href="/somewhere">Link</a>       // ✅ tracks  
<div data-track="true">Custom</div> // ✅ tracks
<div>Regular div</div>              // ❌ doesn't track
```

---

## 🎛️ Advanced Settings

### Custom tracking
```html
<!-- Basic custom tracking -->
<div data-track="true">Track me!</div>

<!-- With custom action name -->
<div data-track="true" data-track-name="special_click">
  Premium button
</div>
```

### How does sessionStorage work?
```javascript
// Tracker stores:
sessionStorage.bc_uuid = "1m2n3o4p-5q6r7s8t"    // Session ID
sessionStorage.bc_visit_sent = "true"             // Already sent visit?
```

**🔄 Refresh behavior:**
- First load → sends visit + tracks clicks
- Page refresh → does NOT send visit + tracks clicks  
- New tab → sends visit + tracks clicks
- Close/open browser → sends visit + tracks clicks

---

## 📊 What Data Gets Sent

### 📈 Visit Data (GET /hit)
```javascript
// Query params:
?screen=1920x1080

// Server automatically detects from headers:
{
  "sessionId": "1m2n3o4p-5q6r7s8t",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "country": "US",           // from IP
  "browser": "Chrome",       // from User-Agent
  "os": "macOS",            // from User-Agent  
  "deviceType": "desktop",   // from User-Agent
  "language": "en-US",      // from Accept-Language
  "referrer": "https://google.com",
  "screen": "1920x1080"
}
```

### 🎯 Action Data (POST /action)
```javascript
{
  "sessionId": "1m2n3o4p-5q6r7s8t",
  "name": "button_click",           // or "link_click", "custom_action"
  "type": "button",                 // HTML tag name
  "timeToAction": 2500,             // ms from page load
  "elementId": "submit-btn",        // element.id
  "elementClass": "btn btn-primary", // element.className
  "scrollPosition": 1250            // pixels from page top
}
```

---

## 🚨 Troubleshooting (when things break)

### Tracker doesn't work at all
```javascript
// Check in Developer Tools > Console:
console.log(sessionStorage.bc_uuid);  // should be something like "1m2n3o4p-5q6r7s8t"

// Check Network tab - there should be requests to:
GET  /hit?screen=1920x1080
POST /action
```

### Data doesn't reach the server
1. **Check endpoint URL** - must be absolute with protocol
2. **CORS policy** - server must accept requests from your domain
3. **Content-Type** - server must accept `application/json` for POST

### Everything tracks weirdly
```html
<!-- WRONG - double tracking -->
<button onclick="track()" data-track="true">Button</button>

<!-- RIGHT - only one method -->
<button data-track="true">Button</button>
```

---

## 🏗️ For Developers (Advanced Stuff)

### Browser Compatibility
- ✅ Chrome 40+
- ✅ Firefox 35+ 
- ✅ Safari 8+
- ✅ Edge 12+
- ✅ IE11+ (with fallbacks)

### Performance Notes
- **First Load**: ~2-3ms execution time
- **Click Tracking**: <1ms per click
- **Memory**: ~5kB footprint
- **Bundle Size**: ~4.8kB gzipped

### API Contract
```typescript
// Expected on server:
GET  /:endpoint/hit?screen=WIDTHxHEIGHT
POST /:endpoint/action
Content-Type: application/json
Body: ActionData

// Response format (optional):
{
  "success": true,
  "sessionId": "string", 
  "message": "string"
}
```

### Fallback Strategies
```javascript
// sendBeacon support
if (navigator.sendBeacon) {
  navigator.sendBeacon(url, data);
} else {
  // XHR fallback for older browsers
  xhr.send(data);
}
```

---

## 🔬 Debug Mode (for paranoids)

### Enable Debug Logging
```html
<script
  src="/tracker.js"
  data-endpoint="https://api.example.com/"
  data-debug="true"
></script>
```

**Debug mode shows:**
- ✅ Tracker initialization with configuration
- ✅ Visit tracking (sent/blocked with reasons)
- ✅ Action tracking with element details
- ✅ Network request methods (sendBeacon/XHR)
- ✅ Click detection on trackable/non-trackable elements
- ✅ Error messages and fallback usage

**Example debug output:**
```javascript
[Bare Count Tracker] Debug mode enabled. All tracking events will be logged to console.
[Bare Count Tracker] Initializing Bare Count Tracker {endpoint: "https://api.example.com/", debug: true, sessionId: "1m2n3o4p-5q6r7s8t", ...}
[Bare Count Tracker] Document ready, tracking visit immediately
[Bare Count Tracker] Tracking visit {url: "https://api.example.com/hit?screen=1920x1080", screen: "1920x1080", ...}
[Bare Count Tracker] Click detected on trackable element {element: "button", actionName: "button_click", ...}
[Bare Count Tracker] Action sent via sendBeacon {sessionId: "1m2n3o4p-5q6r7s8t", name: "button_click", ...}
```

### Manual testing
```javascript
// In browser console:

// Check session
console.log(sessionStorage.bc_uuid);
console.log(sessionStorage.bc_visit_sent);

// Manual trigger action (if needed)
document.querySelector('#my-button').click();

// Reset session (for testing)
sessionStorage.removeItem('bc_uuid');
sessionStorage.removeItem('bc_visit_sent');
location.reload();
```

### Network Monitoring
```bash
# Watch requests in curl
curl -X GET "https://api.example.com/hit?screen=1920x1080"

curl -X POST "https://api.example.com/action" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","name":"test_click","type":"button","timeToAction":1000,"elementId":"","elementClass":"","scrollPosition":0}'
```

---

## 🎨 Styling & UX Tips

### Loading Optimization
```html
<!-- Async loading (recommended) -->
<script
  src="/tracker.js"
  data-endpoint="https://api.example.com/"
  async
></script>

<!-- Critical loading (if you need immediate tracking) -->
<script
  src="/tracker.js"
  data-endpoint="https://api.example.com/"
></script>
```

### Custom Event Names
```html
<!-- Descriptive naming -->
<button data-track="true" data-track-name="newsletter_signup">
  Subscribe to newsletter
</button>

<a href="/pricing" data-track="true" data-track-name="pricing_page_visit">
  View pricing
</a>

<div data-track="true" data-track-name="hero_cta_click">
  Start for free
</div>
```

---

## 📜 License & Credits

- **Size**: 4.8kB gzipped
- **Dependencies**: 0
- **License**: MIT (probably)
- **Compatibility**: ES5+ 
- **Version**: v1

```javascript
// bare-count-tracker v1
```

---

## 🔥 FAQ (Frequently Asked Questions)

**Q: Do I need a GDPR consent banner?**  
A: No! The tracker doesn't store cookies or personal data across sessions.

**Q: Does it work with SPAs (React/Vue/Angular)?**  
A: Yes, but it only sends visit on first tab load. For route changes you need to call manually.

**Q: Can I track custom events?**  
A: Yes, add `data-track="true"` to any element.

**Q: What if user has JavaScript disabled?**  
A: Well, then it doesn't work. #JustSaying

**Q: Can I change the session ID format?**  
A: No, tracker uses `timestamp-random` format. But you can modify it in the code.

**Q: Does it track mobile devices?**  
A: Yes, automatically detects device type from User-Agent.

**Q: How do I debug tracking issues?**  
A: Add `data-debug="true"` to the script tag. All tracking events will be logged to browser console.

**Q: Can I use debug mode in production?**  
A: No, debug mode should only be used in development. It logs sensitive information to console.

---

*Made with ❤️ and lots of ☕ by developers who hate overengineered analytics*