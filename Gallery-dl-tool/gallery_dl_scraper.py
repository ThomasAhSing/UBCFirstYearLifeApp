# import os
# import json
# import shutil
# import subprocess
# from datetime import datetime
# from collections import defaultdict
# import time
# import random

# # ===== CONFIGURATION =====
# usernames = ["ubcwsoccer", "ubctbirds", "ubcmswim"]
# numPostsToFetch = 2
# output_base = "ig_data"
# config_file = "gallerydl_configTest.json"


# def clean_up_directory(folder_path):
#     if os.path.exists(folder_path):
#         shutil.rmtree(folder_path)
#         print(f"🧹 Cleaned up {folder_path}")


# def scrape_instagram_posts(usernames, config_file, output_base, numPostsToFetch):
#     grouped_posts = {}

#     for username in usernames:
#         time.sleep(random.randint(10, 20))
#         print(f"🔎 Fetching @{username}...")
#         output_path = os.path.join(output_base, username)

#         try:
#             subprocess.run([
#                 "gallery-dl",
#                 f"https://www.instagram.com/{username}/",
#                 "--write-metadata",
#                 "-d", output_path,
#                 "-c", config_file
#             ], check=True)
#         except subprocess.CalledProcessError:
#             print(f"❌ Failed to download for {username}")
#             continue

#         # Remove media files (keep only JSON)
#         for root, _, files in os.walk(output_path):
#             for fname in files:
#                 if fname.endswith((".jpg", ".mp4", ".png", ".webp")):
#                     os.remove(os.path.join(root, fname))

#         # Group JSON files by post_shortcode
#         posts_by_shortcode = defaultdict(list)
#         for root, _, files in os.walk(output_path):
#             for file in files:
#                 if file.endswith(".json") and not file.startswith("gallery-dl"):
#                     path = os.path.join(root, file)
#                     try:
#                         with open(path, "r", encoding="utf-8") as f:
#                             data = json.load(f)
#                             shortcode = data.get("post_shortcode") or data.get("shortcode")
#                             if shortcode:
#                                 posts_by_shortcode[shortcode].append(data)
#                     except Exception as e:
#                         print(f"❌ Failed to load {file}: {e}")

#         # Enrich and sort posts
#         enriched_posts = []
#         for shortcode, items in posts_by_shortcode.items():
#             sorted_items = sorted(items, key=lambda x: x.get("num", 0))
#             media_entries = []

#             for item in sorted_items:
#                 is_video = bool(item.get("video_url"))
#                 media_entries.append({
#                     "type": "video" if is_video else "image",
#                     "image_url": item.get("display_url"),
#                     "video_url": item.get("video_url") if is_video else None
#                 })

#             first_item = sorted_items[0]
#             enriched_post = {
#                 "shortcode": shortcode,
#                 "username": first_item.get("username"),
#                 "caption": first_item.get("description") or first_item.get("caption"),
#                 "likes": first_item.get("likes"),
#                 "timestamp": first_item.get("post_date"),
#                 "post_url": first_item.get("post_url"),
#                 "media_count": len(media_entries),
#                 "downloaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
#                 "media": media_entries,
#                 "profile": {
#                     "biography": first_item.get("user", {}).get("biography"),
#                     "profile_pic_url": first_item.get("user", {}).get("profile_pic_url_hd")
#                 },
#                 "isEvent": False,
#                 "eventDayTime": None
#             }
#             enriched_posts.append(enriched_post)

#         enriched_posts.sort(key=lambda x: x["timestamp"], reverse=True)
#         grouped_posts[username] = enriched_posts[:numPostsToFetch]

#     clean_up_directory(output_base)
#     return grouped_posts


# # ===== RUN SCRIPT & EXPORT JSON =====
# if __name__ == "__main__":
#     result = scrape_instagram_posts(usernames, config_file, output_base, numPostsToFetch)

#     with open("all_posts.json", "w", encoding="utf-8") as f:
#         json.dump(result, f, indent=2)

#     print(f"✅ Saved posts grouped by username to instagram_all_posts.json")

import os
import json
import shutil
import subprocess
from datetime import datetime
from collections import defaultdict
import time
import random

# ===== CONFIGURATION =====
usernames = ["ubcwsoccer", "ubctbirds", "ubcmswim"]
numPostsToFetch = 2
output_base = "ig_data"
config_file = "gallerydl_configTest.json"

def clean_up_directory(folder_path):
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
        print(f"🧹 Cleaned up {folder_path}")

def scrape_instagram_posts(usernames, config_file, output_base, numPostsToFetch):
    global_posts_by_shortcode = {}

    for username in usernames:
        time.sleep(random.randint(10, 20))
        print(f"🔎 Fetching @{username}...")
        output_path = os.path.join(output_base, username)

        try:
            subprocess.run([
                "gallery-dl",
                f"https://www.instagram.com/{username}/",
                "--write-metadata",
                "-d", output_path,
                "-c", config_file
            ], check=True)
        except subprocess.CalledProcessError:
            print(f"❌ Failed to download for {username}")
            continue

        # Remove media files (keep only JSON)
        for root, _, files in os.walk(output_path):
            for fname in files:
                if fname.endswith((".jpg", ".mp4", ".png", ".webp")):
                    os.remove(os.path.join(root, fname))

        # Group JSON files by post_shortcode
        posts_by_shortcode = defaultdict(list)
        for root, _, files in os.walk(output_path):
            for file in files:
                if file.endswith(".json") and not file.startswith("gallery-dl"):
                    path = os.path.join(root, file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            shortcode = data.get("post_shortcode") or data.get("shortcode")
                            if shortcode:
                                posts_by_shortcode[shortcode].append(data)
                    except Exception as e:
                        print(f"❌ Failed to load {file}: {e}")

        # Enrich, deduplicate, and collect up to numPostsToFetch
        unique_count = 0
        sorted_shortcodes = sorted(
            posts_by_shortcode.keys(),
            key=lambda sc: posts_by_shortcode[sc][0].get("post_date"),
            reverse=True
        )

        for shortcode in sorted_shortcodes:
            if shortcode in global_posts_by_shortcode:
                # Check if already added from this account
                existing_post = global_posts_by_shortcode[shortcode]
                if existing_post.get("userFetchedFrom") == username:
                    break  # Stop — we're hitting old posts
                else:
                    continue  # Skip duplicate, but keep trying to find new ones

            sorted_items = sorted(posts_by_shortcode[shortcode], key=lambda x: x.get("num", 0))
            media_entries = []

            for item in sorted_items:
                is_video = bool(item.get("video_url"))
                media_entries.append({
                    "type": "video" if is_video else "image",
                    "image_url": item.get("display_url"),
                    "video_url": item.get("video_url") if is_video else None
                })

            first_item = sorted_items[0]
            enriched_post = {
                "shortcode": shortcode,
                "username": first_item.get("username"),
                "caption": first_item.get("description") or first_item.get("caption"),
                "likes": first_item.get("likes"),
                "timestamp": first_item.get("post_date"),
                "post_url": first_item.get("post_url"),
                "media_count": len(media_entries),
                "downloaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "media": media_entries,
                "profile": {
                    "biography": first_item.get("user", {}).get("biography"),
                    "profile_pic_url": first_item.get("user", {}).get("profile_pic_url_hd")
                },
                "isEvent": False,
                "eventDayTime": None,
                "userFetchedFrom": username
            }

            global_posts_by_shortcode[shortcode] = enriched_post
            unique_count += 1

            if unique_count >= numPostsToFetch:
                break  # Got enough new posts from this user

    clean_up_directory(output_base)
    return global_posts_by_shortcode

# ===== RUN SCRIPT & EXPORT JSON =====
if __name__ == "__main__":
    result = scrape_instagram_posts(usernames, config_file, output_base, numPostsToFetch)

    with open("all_posts.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"✅ Saved posts (keyed by shortcode) to all_posts.json")
