#!/usr/bin/env python3
"""
Deploy script for Hugging Face Spaces
Usage: python scripts/deploy-hf.py
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

def main():
    """Deploy the built application to Hugging Face Spaces"""
    
    # Configuration
    REPO_ID = "your-username/gaokao-analytics"  # Change this to your HF repo
    HF_TOKEN = os.getenv("HF_TOKEN")
    
    if not HF_TOKEN:
        print("❌ HF_TOKEN environment variable not set")
        print("Please set your Hugging Face token: export HF_TOKEN=your_token")
        sys.exit(1)
    
    # Check if build exists
    out_dir = Path("out")
    if not out_dir.exists():
        print("❌ Build directory 'out' not found")
        print("Please run 'npm run build' first")
        sys.exit(1)
    
    print("🚀 Starting deployment to Hugging Face Spaces...")
    
    try:
        # Install huggingface_hub if not present
        subprocess.run([sys.executable, "-m", "pip", "install", "huggingface_hub"], check=True)
        
        from huggingface_hub import HfApi
        
        # Initialize API
        api = HfApi()
        
        # Create space if it doesn't exist
        try:
            print(f"📦 Uploading to {REPO_ID}...")
            api.upload_folder(
                folder_path=str(out_dir),
                repo_id=REPO_ID,
                repo_type="space",
                token=HF_TOKEN,
                commit_message="Deploy Gaokao Analytics"
            )
            print(f"✅ Successfully deployed to https://huggingface.co/spaces/{REPO_ID}")
            
        except Exception as e:
            if "does not exist" in str(e):
                print(f"🏗️  Creating new space: {REPO_ID}")
                api.create_repo(
                    repo_id=REPO_ID,
                    repo_type="space",
                    space_sdk="static",
                    token=HF_TOKEN
                )
                
                # Try upload again
                api.upload_folder(
                    folder_path=str(out_dir),
                    repo_id=REPO_ID,
                    repo_type="space",
                    token=HF_TOKEN,
                    commit_message="Initial deployment of Gaokao Analytics"
                )
                print(f"✅ Successfully created and deployed to https://huggingface.co/spaces/{REPO_ID}")
            else:
                raise e
                
    except ImportError:
        print("❌ Failed to install huggingface_hub")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 