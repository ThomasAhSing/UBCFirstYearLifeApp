import firebase_admin
from firebase_admin import credentials, storage
import os
import requests 

# Firebase init
# bucket reference: gs://ubcfirstyearlifeapp.firebasestorage.app
def init_firebase():
    cred_path = os.path.join(os.path.dirname(__file__), 'ubcfirstyearlifeapp-firebase-adminsdk-fbsvc-99dca536fd.json')
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': "ubcfirstyearlifeapp.firebasestorage.app" 
        })


# Upload function
# return Firebase url

# TODO implement if receive duplicate destFilename mean already uploaded
def upload_image_from_url(image_url, base_dest_filename): 
    try:
        response = requests.get(image_url)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to download image from {image_url}: {e}")
        return None
    
    content_type = response.headers.get("Content-Type", "image/jpeg")
    extension_map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".jpg"  
    }
    extension = extension_map.get(content_type, ".jpg")
    final_filename = f"{base_dest_filename}{extension}" 
    
    try: 
        bucket = storage.bucket()
        
        existing_blobs = list(bucket.list_blobs(prefix=base_dest_filename))
        for blob in existing_blobs:
            if blob.name.startswith(base_dest_filename):
                # File already exists
                blob.make_public()  # Ensure it's public
                print(f"Skipped upload: {blob.name} already exists")
                return blob.public_url
        
        blob = bucket.blob(final_filename)
        blob.upload_from_string(response.content, content_type=content_type)
        blob.make_public()
        return blob.public_url  
    except Exception as e:
        print(f"Failed to upload image to Firebase: {e}")
        return None
    
# Test
if __name__ == "__main__":
    init_firebase()
    test_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyPscMySS3cdcZ3YGBicFOslqPsdnYxq45XA&s"
    filename = "test_upload/ubcwsoccer/DKu7HQNhq3y/0"
    firebase_url = upload_image_from_url(test_url, filename)
    print(f"Image link: {firebase_url}")
