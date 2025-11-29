
import sqlite3
import json
import os
import re

# Path to your tweets.js file
tweets_js_path = 'tweets/twitter-2025-11-27/data/tweets.js'

# Path to the output SQLite database
db_path = 'tweets/tweets.db'

# --- 1. Read and clean the JavaScript file ---
with open(tweets_js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Remove the initial JavaScript assignment part ("window.YTD.tweets.part0 = ")
json_str = re.sub(r'^window\.YTD\.tweets\.part\d+\s*=\s*', '', js_content)

# --- 2. Parse the JSON data ---
try:
    tweets_data = json.loads(json_str)
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
    # Add some debugging to see the problematic content
    print("\nContent snippet that failed to parse:")
    start = max(0, e.pos - 50)
    end = min(len(json_str), e.pos + 50)
    print(json_str[start:end])
    exit()

# --- 3. Connect to SQLite and create the table ---
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS tweets (
    id INTEGER PRIMARY KEY,
    full_text TEXT,
    favorite_count INTEGER,
    created_at TIMESTAMP,
    retweet_count INTEGER,
    in_reply_to_screen_name TEXT,
    in_reply_to_status_id INTEGER,
    len INTEGER
)
''')

# --- 4. Insert data into the table ---
for item in tweets_data:
    tweet = item.get('tweet', {}) # The actual tweet data is nested
    
    # Extract data, providing defaults for missing fields
    tweet_id = int(tweet.get('id', 0))
    full_text = tweet.get('full_text', '')
    
    # Skip retweets
    if full_text.startswith('RT '):
        continue

    favorite_count = int(tweet.get('favorite_count', 0))
    retweet_count = int(tweet.get('retweet_count', 0))
    in_reply_to_screen_name = tweet.get('in_reply_to_screen_name') # Can be None
    in_reply_to_status_id = tweet.get('in_reply_to_status_id')
    if in_reply_to_status_id:
        in_reply_to_status_id = int(in_reply_to_status_id)
    text_len = len(full_text)


    # Convert created_at to a string in 'YYYY-MM-DD HH:MM:SS' format
    created_at_str = tweet.get('created_at')
    created_at_iso = None
    if created_at_str:
        from datetime import datetime
        # Format: "Mon Sep 01 12:34:56 +0000 2025"
        dt_object = datetime.strptime(created_at_str, '%a %b %d %H:%M:%S %z %Y')
        created_at_iso = dt_object.strftime('%Y-%m-%d %H:%M:%S')

    # Insert a row of data
    c.execute('''
    INSERT INTO tweets (id, full_text, favorite_count, created_at, retweet_count, in_reply_to_screen_name, in_reply_to_status_id, len)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (tweet_id, full_text, favorite_count, created_at_iso, retweet_count, in_reply_to_screen_name, in_reply_to_status_id, text_len))


# --- 5. Commit changes and close the connection ---
conn.commit()
conn.close()

print(f"Successfully created and populated {db_path} with {len(tweets_data)} tweets.")
