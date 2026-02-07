import requests
import sys

# Test the disease detection endpoint
url = "http://localhost:5000/api/disease/detect"
image_path = "uploads/test_image.jpg"

# Create a dummy token for testing (this will fail auth, but we can see the error)
headers = {
    "Authorization": "Bearer test_token"
}

try:
    with open(image_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(url, files=files, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
