#!/usr/bin/env python3
"""
Test external APIs: HuggingFace, X (Twitter), YouTube, and News API
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv('backend/.env')

def test_huggingface():
    """Test HuggingFace Inference API"""
    print("\n🤗 Testing HuggingFace API...")
    
    api_key = os.getenv('HUGGINGFACE_API_KEY')
    if not api_key:
        print("❌ HUGGINGFACE_API_KEY not found in backend/.env")
        return False
    
    try:
        # Try the new router endpoint
        url = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "meta-llama/Llama-3.2-1B-Instruct",
            "messages": [{"role": "user", "content": "Hello, this is a test."}],
            "max_tokens": 10
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ HuggingFace API works! Response: {str(data)[:100]}...")
            return True
        else:
            print(f"❌ HuggingFace API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ HuggingFace API error: {str(e)}")
        return False


def test_x_twitter():
    """Test X (Twitter) API v2"""
    print("\n🐦 Testing X (Twitter) API...")
    
    bearer_token = os.getenv('X_BEARER_TOKEN') or os.getenv('TWITTER_BEARER_TOKEN')
    if not bearer_token:
        print("❌ X_BEARER_TOKEN or TWITTER_BEARER_TOKEN not found in backend/.env")
        return False
    
    try:
        # Use search endpoint which supports app-only auth
        url = "https://api.twitter.com/2/tweets/search/recent"
        headers = {"Authorization": f"Bearer {bearer_token}"}
        params = {"query": "test", "max_results": 10}
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            tweet_count = len(data.get('data', []))
            print(f"✅ X (Twitter) API works! Found {tweet_count} tweets")
            return True
        else:
            print(f"❌ X (Twitter) API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ X (Twitter) API error: {str(e)}")
        return False


def test_youtube():
    """Test YouTube Data API v3"""
    print("\n▶️  Testing YouTube API...")
    
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("❌ YOUTUBE_API_KEY not found in backend/.env")
        return False
    
    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': 'test',
            'maxResults': 1,
            'key': api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ YouTube API works! Found {data.get('pageInfo', {}).get('totalResults', 0)} results")
            return True
        else:
            print(f"❌ YouTube API failed: {response.status_code} - {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ YouTube API error: {str(e)}")
        return False


def test_news_api():
    """Test News API"""
    print("\n📰 Testing News API...")
    
    api_key = os.getenv('NEWSAPI_KEY')
    if not api_key:
        print("❌ NEWSAPI_KEY not found in backend/.env")
        return False
    
    try:
        url = "https://newsapi.org/v2/top-headlines"
        params = {
            'country': 'us',
            'pageSize': 1,
            'apiKey': api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ News API works! Status: {data.get('status')}, Total: {data.get('totalResults', 0)} articles")
            if data.get('articles'):
                print(f"   Sample headline: {data['articles'][0].get('title', 'N/A')}")
            return True
        else:
            print(f"❌ News API failed: {response.status_code} - {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ News API error: {str(e)}")
        return False


def test_reddit():
    """Test Reddit API"""
    print("\n🔴 Testing Reddit API...")
    
    client_id = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        print("❌ REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET not found in backend/.env")
        return False
    
    try:
        # Get access token
        auth_url = "https://www.reddit.com/api/v1/access_token"
        headers = {"User-Agent": "research-dashboard/1.0"}
        data = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret
        }
        
        auth_response = requests.post(auth_url, headers=headers, data=data, timeout=10)
        
        if auth_response.status_code != 200:
            print(f"❌ Reddit authentication failed: {auth_response.status_code}")
            return False
        
        token = auth_response.json().get('access_token')
        
        # Search for posts
        search_url = "https://oauth.reddit.com/r/Python/hot"
        headers = {
            "User-Agent": "research-dashboard/1.0",
            "Authorization": f"Bearer {token}"
        }
        params = {"limit": 5}
        
        response = requests.get(search_url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            posts = len(data.get('data', {}).get('children', []))
            print(f"✅ Reddit API works! Found {posts} posts")
            return True
        else:
            print(f"❌ Reddit API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Reddit API error: {str(e)}")
        return False


def test_hackernews():
    """Test Hacker News API (no auth needed) - filtered for AI/ML/DL"""
    print("\n📰 Testing Hacker News API (AI/ML/DL filtered)...")
    
    # Keywords to filter for AI/ML/DL content
    ai_keywords = ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'llm', 'gpt', 'transformer', 'nlp', 'computer vision', 'model', 'algorithm']
    
    try:
        # Get top stories
        url = "https://hacker-news.firebaseio.com/v0/topstories.json"
        response = requests.get(url, timeout=10, params={"limitToFirst": 30, "orderBy": "\"$key\""})
        
        if response.status_code == 200:
            stories = response.json()
            if stories:
                filtered_stories = []
                
                # Filter stories by AI/ML/DL keywords
                for story_id in stories[:30]:
                    story_url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
                    story_response = requests.get(story_url, timeout=10)
                    
                    if story_response.status_code == 200:
                        story = story_response.json()
                        title = story.get('title', '').lower()
                        
                        # Check if title contains any AI/ML/DL keywords
                        if any(keyword in title for keyword in ai_keywords):
                            filtered_stories.append(story)
                            if len(filtered_stories) >= 5:
                                break
                
                if filtered_stories:
                    print(f"✅ Hacker News API works! Found {len(filtered_stories)} AI/ML/DL stories")
                    for i, story in enumerate(filtered_stories, 1):
                        print(f"   {i}. {story.get('title', 'N/A')[:60]}...")
                    return True
                else:
                    print(f"❌ Hacker News API: No AI/ML/DL stories found in top 30")
                    return False
            
            print(f"❌ Hacker News API failed: No stories found")
            return False
        else:
            print(f"❌ Hacker News API failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Hacker News API error: {str(e)}")
        return False


def test_stackexchange():
    """Test Stack Exchange API (no auth needed) - filtered for AI/ML/DL"""
    print("\n📚 Testing Stack Exchange API (AI/ML/DL filtered)...")
    
    try:
        # Search for AI/ML/DL related questions on Stack Overflow
        # Using tags for machine-learning, deep-learning, neural-networks, artificial-intelligence
        url = "https://api.stackexchange.com/2.3/questions"
        params = {
            'order': 'desc',
            'sort': 'activity',
            'tagged': 'machine-learning;deep-learning;artificial-intelligence;neural-networks',
            'site': 'stackoverflow',
            'pagesize': 10
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            questions = data.get('items', [])
            quota_remaining = data.get('quota_remaining', 'N/A')
            
            if questions:
                print(f"✅ Stack Exchange API works! Found {len(questions)} AI/ML/DL questions")
                print(f"   Quota remaining: {quota_remaining}")
                for i, q in enumerate(questions[:5], 1):
                    print(f"   {i}. {q.get('title', 'N/A')[:60]}...")
                return True
            else:
                print(f"❌ Stack Exchange API failed: No AI/ML/DL questions found")
                return False
        else:
            print(f"❌ Stack Exchange API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Stack Exchange API error: {str(e)}")
        return False


def main():
    """Run all API tests"""
    print("=" * 60)
    print("🔍 Testing External APIs")
    print("=" * 60)
    
    results = {
        'HuggingFace': test_huggingface(),
        'X (Twitter)': test_x_twitter(),
        'YouTube': test_youtube(),
        'News API': test_news_api(),
        'Reddit': test_reddit(),
        'Hacker News': test_hackernews(),
        'Stack Exchange': test_stackexchange(),
    }
    
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    for api, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {api}: {'PASS' if status else 'FAIL'}")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\n📈 Results: {passed}/{total} APIs working")
    print("\n💡 Tip: Add your API keys to backend/.env file")
    print("   - HUGGINGFACE_API_KEY")
    print("   - X_BEARER_TOKEN or TWITTER_BEARER_TOKEN")
    print("   - YOUTUBE_API_KEY")
    print("   - NEWS_API_KEY")
    print("   - REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET")
    print("   (Hacker News & Stack Exchange: No authentication needed)")
    print("=" * 60)


if __name__ == '__main__':
    main()
