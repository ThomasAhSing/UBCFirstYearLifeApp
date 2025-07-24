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
def upload_image_from_url(image_url, dest_filename): // dest_filename doesnt include extendion
    try:
        response = requests.get(image_url)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to download image from {image_url}: {e}")
        return None
    
    try: 
        bucket = storage.bucket()
        blob = bucket.blob(dest_filename)
        blob.upload_from_string(response.content, content_type='image/jpeg')
        blob.make_public()
        return blob.public_url
    except Exception as e:
        print(f"Failed to upload image to Firebase: {e}")
        return None
    
# Test
if __name__ == "__main__":
    init_firebase()
    test_url = "https://scontent-sea1-1.cdninstagram.com/v/t51.2885-15/516606382_18518354164063796_7921003239888856122_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjEwODB4MTA4MC5zZHIuZjgyNzg3LmRlZmF1bHRfaW1hZ2UuYzIifQ&_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QHXwQ1XbuoMK9CckfUUPEvosgUXJUltfGTFDh84fIHH5qqR5Ub8vNtnwwlkDF7jvVI&_nc_ohc=ULqZvEoi3hEQ7kNvwH2XChO&_nc_gid=bWNvduVFz2gC8d-mskxxtQ&edm=ABmJApABAAAA&ccb=7-5&ig_cache_key=MzY3MTY5ODIxMDk0MDE0Mjg2MQ%3D%3D.3-ccb7-5&oh=00_AfTJlTlT9A4-yi-m1IaLLtX_XtaiVvyXo4SCzOzrxozE0A&oe=6886159C&_nc_sid=b41fef"
    filename = "test_upload/unrelated_image.jpg"
    firebase_url = upload_image_from_url(test_url, filename)
    print(f"Image uploaded to: {firebase_url}")
