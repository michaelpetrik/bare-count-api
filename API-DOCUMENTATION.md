# 🚀 Enterprise Action Tracking API

Kompletní dokumentace pro action tracking API s enterprise-level session managementem.

## 📋 API Endpoints

### 1. Initialize Visit Session
**Endpoint:** `GET /hit`

Inicializuje novou session a zaznamenává visit.

**Response:**
```json
{
  "success": true,
  "sessionId": "session_f0c86f50-032f-4151-9600-fb54dc74fe22",
  "message": "Visit recorded successfully"
}
```

**Co se automaticky zaznamenává:**
- Enterprise UUID session ID
- Timestamp
- Country (z IP)
- Browser info
- OS info
- Device type
- Language
- Referrer
- Screen resolution (pokud poslána)

---

### 2. Track User Action
**Endpoint:** `POST /action`

Zaznamenává user akci s detailním trackingem.

**Required Parameters:**
- `name` (string) - Název akce
- `type` (string) - Typ akce (click, submit, scroll, view, hover, etc.)
- `timeToAction` (number) - Čas v ms od načtení stránky
- `elementId` (string) - ID elementu
- `elementClass` (string) - CSS třídy elementu
- `scrollPosition` (number) - Pozice scrollu v px

**Optional Parameters:**
- `sessionId` (string) - Existing session ID, nebo server vygeneruje nové
- `url` (string) - Current page URL
- Jakékoli další custom parametry

**Example Request:**
```bash
curl -X POST http://localhost:4000/action \
  -H "Content-Type: application/json" \
  -d '{
    "name": "newsletter_signup",
    "type": "click", 
    "timeToAction": 5000,
    "elementId": "signup-btn",
    "elementClass": "btn btn-primary",
    "scrollPosition": 250,
    "sessionId": "session_f0c86f50-032f-4151-9600-fb54dc74fe22",
    "campaign": "summer_sale",
    "value": "test@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_f0c86f50-032f-4151-9600-fb54dc74fe22",
  "message": "Action tracked successfully"
}
```

---

### 3. Get Action Statistics
**Endpoint:** `GET /action/stats`

Vrací kompletní analytics statistiky.

**Response:**
```json
{
  "total": 1247,
  "today": 89,
  "last7Days": 542,
  "byType": {
    "click": 890,
    "submit": 234,
    "scroll": 89,
    "view": 34
  },
  "byName": {
    "newsletter_signup": 234,
    "cta_click": 445,
    "download_button": 123
  },
  "averageTimeToAction": 12750
}
```

---

### 4. Get Filtered Actions
**Endpoint:** `GET /actions`

Vrací seznam akcí s možností filtrování.

**Query Parameters:**
- `type` - Filtr podle typu akce
- `name` - Filtr podle názvu akce
- `startDate` - Start date pro date range
- `endDate` - End date pro date range

**Examples:**
```bash
# Všechny akce
GET /actions

# Jen click akce
GET /actions?type=click

# Akce podle jména
GET /actions?name=newsletter_signup

# Date range
GET /actions?startDate=2025-08-01&endDate=2025-08-31
```

---

### 5. Get Visit Statistics
**Endpoint:** `GET /stats`

Vrací statistiky návštěv.

**Response:**
```json
{
  "total": 5420,
  "today": 145,
  "last7Days": 892
}
```

## 🎯 Frontend Integration

### Quick Start JavaScript

```javascript
// 1. Initialize session
const response = await fetch('/hit');
const { sessionId } = await response.json();
sessionStorage.setItem('analytics_session_id', sessionId);

// 2. Track action
async function trackAction(actionData) {
  const timeToAction = Date.now() - pageLoadTime;
  const scrollPosition = window.pageYOffset;
  
  await fetch('/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...actionData,
      timeToAction,
      scrollPosition,
      sessionId: sessionStorage.getItem('analytics_session_id')
    })
  });
}

// 3. Use it
document.getElementById('signup-btn').addEventListener('click', () => {
  trackAction({
    name: 'newsletter_signup',
    type: 'click',
    elementId: 'signup-btn',
    elementClass: 'btn btn-primary'
  });
});
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useAnalytics() {
  const [sessionId, setSessionId] = useState(null);
  const pageLoadTime = useRef(Date.now());

  useEffect(() => {
    // Initialize session
    fetch('/hit')
      .then(res => res.json())
      .then(data => {
        setSessionId(data.sessionId);
        sessionStorage.setItem('analytics_session_id', data.sessionId);
      });
  }, []);

  const trackAction = useCallback(async (actionData) => {
    const timeToAction = Date.now() - pageLoadTime.current;
    
    await fetch('/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...actionData,
        timeToAction,
        scrollPosition: window.pageYOffset,
        sessionId
      })
    });
  }, [sessionId]);

  return { sessionId, trackAction };
}

// Usage in component
function MyComponent() {
  const { trackAction } = useAnalytics();
  
  return (
    <button 
      onClick={() => trackAction({
        name: 'cta_click',
        type: 'click',
        elementId: 'main-cta',
        elementClass: 'btn-primary'
      })}
    >
      Click me
    </button>
  );
}
```

## 🔒 Enterprise Features

### UUID Session Management
- **Industry Standard**: UUID v4 pro unique identification
- **Scalable**: Podporuje miliony concurrent sessions
- **Secure**: Cryptographically secure randomness
- **Persistent**: Session persistence přes sessionStorage

### Auto-tracking Capabilities
- **Data Attributes**: Automatické tracking přes `data-track`
- **Event Delegation**: Efektivní event handling
- **Custom Metadata**: Flexible dodatečné parametry
- **Performance Optimized**: Minimální overhead

### Analytics & Insights
- **Real-time Stats**: Live analytics data
- **Flexible Filtering**: Type, name, date range filters
- **Time-to-Action Metrics**: User behavior insights
- **Session Correlation**: Cross-action session tracking

## 🛠️ Development

### Environment Setup
```bash
npm install
npm run build
npm start  # Production
npm run dev  # Development
```

### Testing
```bash
npm test  # Unit tests
npm run test:coverage  # Coverage report
```

### Production Deployment
```bash
NODE_ENV=production npm run start:prod
```

## 📊 Use Cases

1. **E-commerce**: Track product clicks, cart additions, checkout flow
2. **SaaS**: Monitor feature usage, onboarding completion
3. **Content Sites**: Article reads, engagement metrics
4. **Marketing**: Campaign performance, conversion tracking
5. **UX Research**: User behavior patterns, heat mapping data

## 🔧 Configuration

### Environment Variables
```bash
PORT=4000                    # Server port
NODE_ENV=production         # Environment
```

### Storage
- **Development**: JSON file storage
- **Production**: Připraveno pro databázi (PostgreSQL, MongoDB)

---

**Pro více informací kontaktuj development team! 🚀**