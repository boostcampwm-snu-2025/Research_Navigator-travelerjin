# Gemini API Model Name Issue

## ❌ Current Problem

The Gemini API is failing with a 404 error:

```
Error: models/gemini-1.5-flash-latest is not found for API version v1beta
```

## 🔍 Root Cause

The model name `gemini-1.5-flash-latest` does not exist in the Gemini API.

## ✅ Solution Options

### Option 1: Update .env File (Recommended)

Add this line to `backend/.env`:

```bash
GEMINI_MODEL=gemini-1.5-flash
```

Valid model names:
- `gemini-1.5-flash` (recommended - fast and cheap)
- `gemini-1.5-pro` (more capable but slower)
- `gemini-pro` (older model)

### Option 2: Check Your API Key Permissions

Your API key might be restricted. Try generating a new key at:
https://aistudio.google.com/app/apikey

### Option 3: Test Available Models

Use the Google AI Studio to check which models your API key has access to.

## 🧪 How to Test

After updating `.env`:

1. The backend will auto-reload (tsx watch is running)
2. Wait 3-5 seconds for reload
3. Test with:
```bash
curl http://localhost:3001/api/papers/today | jq '.papers[0].summary'
```

If working, you should see:
```json
{
  "why": "...",
  "what": "...",
  "howItFits": "...",
  "motivation": "...",
  "keyContributions": [...],
  "relevanceScore": 0.85
}
```

## 📝 Current Setup

**Auto-reload**: ✅ YES
- Using `tsx watch` in `package.json`
- Backend automatically restarts when code changes
- No need to manually stop/restart

**API Key**: ✅ Configured
- Located in `backend/.env`
- Environment variable: `GEMINI_API_KEY`

**Model Name**: ❌ WRONG
- Current: `gemini-1.5-flash-latest` (doesn't exist)
- Need to set: `GEMINI_MODEL=gemini-1.5-flash`

## 🔧 Quick Fix

```bash
cd backend
echo "GEMINI_MODEL=gemini-1.5-flash" >> .env
# Wait 3 seconds for auto-reload
# Then test
curl http://localhost:3001/api/papers/today | jq '.papers[0] | {title, hasSummary: (.summary != null)}'
```

Expected output:
```json
{
  "title": "StereoSpace: Depth-Free Synthesis...",
  "hasSummary": true
}
```

## 🎯 What's Working Now

✅ arXiv API - fetching 30 real papers
✅ Backend auto-reload - tsx watch
✅ Frontend display - showing papers
✅ 7-day window - filtering correctly

❌ Gemini summaries - needs model name fix
