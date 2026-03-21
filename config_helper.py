#!/usr/bin/env python3
"""
Vivarta Dashboard - Supabase Configuration Helper

Usage:
  python3 config_helper.py setup      # Initial setup
  python3 config_helper.py validate   # Verify configuration
  python3 config_helper.py inject     # Inject into supabase-config.js

Works with:
  - Development: python -m http.server
  - Production: Environment variables
"""

import os
import sys
import re
from pathlib import Path

class SupabaseConfig:
    def __init__(self):
        self.root = Path(__file__).parent
        self.env_file = self.root / '.env'
        self.env_example = self.root / '.env.example'
        self.config_file = self.root / 'src' / 'js' / 'supabase-config.js'
        
    def load_env(self):
        """Load environment variables from .env file"""
        config = {}
        
        if not self.env_file.exists():
            return config
            
        with open(self.env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
        
        return config
    
    def setup(self):
        """Interactive setup"""
        print("\n🚀 Vivarta Dashboard - Supabase Setup\n")
        
        if self.env_file.exists():
            print(f"✅ .env file already exists at {self.env_file}")
            response = input("Overwrite? (y/n): ").strip().lower()
            if response != 'y':
                return
        
        print("\n📝 Enter your Supabase credentials")
        print("(Find these at: https://app.supabase.com → Settings → API)\n")
        
        url = input("Supabase Project URL: ").strip()
        key = input("Supabase Anon Key: ").strip()
        
        if not url or not key:
            print("❌ Credentials cannot be empty")
            return
        
        # Write .env file
        content = f"""# Supabase Configuration for {url}
# ⚠️  IMPORTANT: This file contains secrets - never commit to Git!
# Add to .gitignore (already done)

VITE_SUPABASE_URL={url}
VITE_SUPABASE_ANON_KEY={key}
"""
        
        with open(self.env_file, 'w') as f:
            f.write(content)
        
        # Make it readable only by owner (Unix-like systems)
        try:
            os.chmod(self.env_file, 0o600)
        except:
            pass  # Windows doesn't support chmod same way
        
        print(f"\n✅ Created {self.env_file}")
        print("⚠️  This file is gitignored - never commit it!")
        print("\nNext steps:")
        print("1. Run: python3 config_helper.py validate")
        print("2. Run: python3 config_helper.py inject")
        print("3. Open index.html in browser\n")
    
    def validate(self):
        """Check if configuration is valid"""
        print("\n🔍 Validating Supabase Configuration\n")
        
        if not self.env_file.exists():
            print("❌ .env file not found")
            print(f"   Create it with: python3 config_helper.py setup")
            return False
        
        config = self.load_env()
        
        url = config.get('VITE_SUPABASE_URL', '')
        key = config.get('VITE_SUPABASE_ANON_KEY', '')
        
        valid = True
        
        if not url or 'your-project' in url:
            print("❌ VITE_SUPABASE_URL not configured")
            valid = False
        else:
            print(f"✅ VITE_SUPABASE_URL: {url}")
        
        if not key or 'your-anon-key' in key:
            print("❌ VITE_SUPABASE_ANON_KEY not configured")
            valid = False
        else:
            print(f"✅ VITE_SUPABASE_ANON_KEY: {key[:20]}...")
        
        if valid:
            print("\n✅ Configuration valid!")
            print("Next: python3 config_helper.py inject")
        
        print()
        return valid
    
    def inject(self):
        """Inject configuration into supabase-config.js"""
        print("\n💉 Injecting Configuration\n")
        
        # Load environment variables
        config = self.load_env()
        url = config.get('VITE_SUPABASE_URL')
        key = config.get('VITE_SUPABASE_ANON_KEY')
        
        if not url or not key:
            print("❌ Configuration incomplete in .env")
            print("   Run: python3 config_helper.py validate")
            return
        
        # Validate file exists
        if not self.config_file.exists():
            print(f"❌ {self.config_file} not found")
            return
        
        # Read current config file
        with open(self.config_file, 'r') as f:
            content = f.read()
        
        # Replace placeholders
        updated = re.sub(
            r'const SUPABASE_URL = "[^"]*"',
            f'const SUPABASE_URL = "{url}"',
            content
        )
        updated = re.sub(
            r'const SUPABASE_ANON_KEY = "[^"]*"',
            f'const SUPABASE_ANON_KEY = "{key}"',
            updated
        )
        
        # Write back
        with open(self.config_file, 'w') as f:
            f.write(updated)
        
        print(f"✅ Updated {self.config_file}")
        print("   SUPABASE_URL injected")
        print("   SUPABASE_ANON_KEY injected")
        print("\n🎉 Ready to use!")
        print("   Open index.html in browser or run:")
        print("   python3 -m http.server 8000\n")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1].lower()
    config = SupabaseConfig()
    
    if command == 'setup':
        config.setup()
    elif command == 'validate':
        config.validate()
    elif command == 'inject':
        config.inject()
    else:
        print(f"Unknown command: {command}")
        print(__doc__)

if __name__ == '__main__':
    main()
