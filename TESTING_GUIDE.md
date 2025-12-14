# Testing Guide - Research Dashboard

## ✅ Everything is Running!

### Backend Server
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Features**:
  - arXiv paper fetching (currently using mock data)
  - 7-day paper window
  - API endpoints functional

### Frontend Server
- **URL**: http://localhost:5174
- **Status**: ✅ Running
- **Features**:
  - Simple paper display
  - Refresh button
  - Shows: title, authors, abstract, PDF link

---

## 🧪 How to Test

### 1. Open the Frontend in Your Browser

Visit: **http://localhost:5174**

You should see:
- Dashboard title
- "Refresh Papers" button
- List of 5 mock papers with:
  - Paper number, category, date
  - Title
  - Authors
  - Abstract
  - "View PDF" link

### 2. Test the Refresh Button

Click "Refresh Papers" - it should:
- Show "Loading papers..."
- Fetch data from backend
- Display updated paper list
- Update "Last updated" timestamp

### 3. Test Backend API Directly

```bash
# Health check
curl http://localhost:3001/health

# Get papers
curl http://localhost:3001/api/papers/today | jq

# Check status
curl http://localhost:3001/api/papers/status
```

---

## 📊 Current Data Source

**Using Mock Data** (5 sample papers)

Reason: arXiv RSS feeds are currently slow/unavailable. Mock papers include:
1. Large Language Models as Few-Shot Learners in Medical Image Analysis
2. Vision Transformers for Real-Time Object Detection in Autonomous Systems
3. Efficient Fine-tuning of Language Models with LoRA and Quantization
4. Attention Mechanisms in Multimodal Learning: A Comprehensive Survey
5. Federated Learning with Differential Privacy for Medical Data

Each paper has:
- Realistic titles and abstracts
- Authors (3 names each)
- Categories (cs.LG or cs.CV)
- Published dates (2-6 days ago, within 7-day window)
- PDF URLs (pointing to arXiv)

---

## 🔧 To Switch to Real arXiv Data

Edit: `backend/src/services/arxiv/index.ts` line 22

Change:
```typescript
const mockMode = true  // Currently using mock
```

To:
```typescript
const mockMode = false  // Use real arXiv RSS
```

**Note**: Real arXiv RSS may be slow or return 0 papers depending on their feed status.

---

## 🎨 Frontend Features

The simple frontend shows:

```
┌─────────────────────────────────────────────┐
│  Research Signal Dashboard                  │
│  Deep Learning & Computer Vision Papers     │
│                                             │
│  [Refresh Papers] Last updated: 12/14/2025 │
│                                             │
│  Found 5 papers                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ #1 | cs.LG | 12/11/2025            │   │
│  │                                     │   │
│  │ Large Language Models as Few-Shot   │   │
│  │ Learners in Medical Image Analysis  │   │
│  │                                     │   │
│  │ Authors: Alice Chen, Bob Smith...   │   │
│  │                                     │   │
│  │ Abstract: We investigate the...     │   │
│  │                                     │   │
│  │ View PDF →                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [... 4 more papers ...]                   │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Known Issues

1. **Gemini API Not Working**
   - Papers have NO AI summaries yet
   - Model name error (tried multiple variations)
   - Need to fix model name or get new API key

2. **arXiv RSS Slow**
   - Real RSS feeds timeout or return 0 papers
   - Mock mode enabled as fallback

3. **Port Conflicts**
   - Backend: 3001 ✅
   - Frontend: 5174 ✅ (auto-selected by Vite)

---

## ✨ What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Backend API | ✅ | All endpoints working |
| Paper Fetching | ✅ | Mock data working |
| 7-Day Window | ✅ | Filtering correctly |
| Frontend UI | ✅ | Displaying papers |
| Refresh Button | ✅ | Re-fetches data |
| CORS | ✅ | Cross-origin working |
| Proxy | ✅ | Frontend → Backend |

---

## 🚀 Next Steps

1. **Fix Gemini API** - So papers get AI summaries
2. **Debug arXiv RSS** - To fetch real papers
3. **Add Proper UI** - Better styling, layout
4. **Add Paper Details Page** - Click to see full analysis
5. **Add Filtering** - By category, date range

---

## 📝 Quick Commands

### Start Both Servers

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Test the Flow

1. Open http://localhost:5174
2. Click "Refresh Papers"
3. Verify papers display
4. Check browser console for errors
5. Click "View PDF" to verify links

---

## 🎯 Success Criteria

You should see:
- ✅ Frontend loads without errors
- ✅ 5 papers displayed
- ✅ "Refresh Papers" button works
- ✅ Paper titles, authors, abstracts visible
- ✅ PDF links clickable
- ✅ "Last updated" timestamp shows

**If you see all of the above, the basic flow is working! 🎉**
