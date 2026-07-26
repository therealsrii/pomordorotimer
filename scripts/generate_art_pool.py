import urllib.request
import json
import os

def fetch_json(url):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        })
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("Fetching search result lists from Met Museum API...")
    object_ids = set()
    
    # Query lists from major painting departments
    queries = [
        "https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=11&q=oil",
        "https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=11&q=canvas",
        "https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=21&q=oil",
        "https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=21&q=canvas",
        "https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=1&q=oil",
        "https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=1&q=canvas"
    ]
    
    for url in queries:
        data = fetch_json(url)
        if data and data.get("objectIDs"):
            object_ids.update(data["objectIDs"])
            print(f"Added {len(data['objectIDs'])} IDs from query: {url}")
            
    object_ids = sorted(list(object_ids))
    print(f"Total unique painting ID candidates collected: {len(object_ids)}")
    
    if len(object_ids) == 0:
        print("Error: No IDs found. Using fallback ID list.")
        object_ids = [436535, 436529, 436528, 437133, 437127, 437131, 437397, 437396, 437879, 437877]
        
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "art_pool.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(object_ids, f)
        
    print(f"Saved raw ID list to {output_path}")

if __name__ == "__main__":
    main()
