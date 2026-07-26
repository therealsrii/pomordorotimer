import urllib.request
import json
import time
import os
import re

def fetch_json(url):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        })
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    curated_ids = [
        436535, 436529, 436528, 437133, 437127, 437131, 437397, 437396, 437879, 437877,
        437430, 437434, 436253, 437658, 436819, 45434, 435868, 435882, 438015, 438023,
        436139, 436151, 437508, 437310, 435848, 436947, 437654, 436252, 335805, 341857,
        435826, 435728, 436838, 437869, 10497
    ]
    
    print(f"Updating {len(curated_ids)} curated masterpieces from MET API sequentially...")
    updated_items = []
    
    for oid in curated_ids:
        url = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}"
        data = fetch_json(url)
        if data:
            image = data.get("primaryImage") or data.get("primaryImageSmall")
            # If no image found, use a known fallback or warn
            if not image:
                print(f"WARNING: ID {oid} has no image!")
                image = "https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg"
                
            item = {
                "id": oid,
                "title": data.get("title", "Untitled"),
                "artist": data.get("artistDisplayName", "Unknown Artist"),
                "date": data.get("objectDate", "Date Unknown"),
                "imageUrl": image
            }
            updated_items.append(item)
            print(f"Fetched ID {oid}: '{item['title']}' - {item['imageUrl']}")
        else:
            print(f"Failed to fetch ID {oid}")
            
        time.sleep(0.3) # Polite sleep to prevent 403 Rate Limiting
        
    print(f"Successfully verified {len(updated_items)} items.")
    
    # Save the updated database into app.js
    app_js_path = "/Users/sridaranrajagopal/Documents/Fun_project/MET_timer/app.js"
    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Re-serialize CURATED_ARTWORKS array dynamically
    js_array_str = "const CURATED_ARTWORKS = [\n"
    for i, item in enumerate(updated_items):
        comma = "," if i < len(updated_items) - 1 else ""
        js_array_str += f'  {{ id: {item["id"]}, title: {json.dumps(item["title"])}, artist: {json.dumps(item["artist"])}, date: {json.dumps(item["date"])}, imageUrl: "{item["imageUrl"]}" }}{comma}\n'
    js_array_str += "];"
    
    # Locate and replace CURATED_ARTWORKS block in app.js using string slicing
    start_marker = "const CURATED_ARTWORKS = ["
    end_marker = "];"
    
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("Error: Could not find start of CURATED_ARTWORKS in app.js")
        sys.exit(1)
        
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        print("Error: Could not find end of CURATED_ARTWORKS in app.js")
        sys.exit(1)
        
    # Replace the block
    new_content = content[:start_idx] + js_array_str + content[end_idx + len(end_marker):]
    
    with open(app_js_path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print("Successfully replaced CURATED_ARTWORKS in app.js!")

if __name__ == "__main__":
    main()
