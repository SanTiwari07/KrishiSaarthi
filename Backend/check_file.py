import os
import sys

print(f"CWD: {os.getcwd()}")
print(f"App.py exists: {os.path.exists('app.py')}")
print(f"App.py size: {os.path.getsize('app.py')}")

try:
    with open('app.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"Line count: {len(lines)}")
        if len(lines) > 350:
            print(f"Line 355: {lines[354]}")
except Exception as e:
    print(f"Error reading file: {e}")
