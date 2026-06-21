#!/bin/bash
# bin/setup.sh
set -euo pipefail

# Determine the absolute project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check for required tools
for cmd in openssl grep sed cp chmod mkdir; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: Required command '$cmd' is not installed." >&2
    exit 1
  fi
done

# Copy .env if not present
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Function to generate a secure random password
generate_password() {
  # Generate a 32-character hexadecimal string
  openssl rand -hex 16
}

# Helper to replace placeholder values in .env safely
replace_in_env() {
  local placeholder="$1"
  local replacement="$2"
  
  if grep -q "$placeholder" .env; then
    if sed --version >/dev/null 2>&1; then
      sed -i "s/$placeholder/$replacement/g" .env
    else
      sed -i '' "s/$placeholder/$replacement/g" .env
    fi
    return 0
  fi
  return 1
}

# Replace placeholder passwords in .env if they exist
if replace_in_env "change_me_root_password_here" "$(generate_password)"; then
  echo "Generated secure random MYSQL_ROOT_PASSWORD in .env"
fi

if replace_in_env "change_me_ghost_password_here" "$(generate_password)"; then
  echo "Generated secure random MYSQL_PASSWORD in .env"
fi

# Ensure host backups folder exists
mkdir -p backups
echo "Created ./backups directory."

# Make sure permissions on theme are readable and traversable by container (node user UID 1000)
if [ -d "ghost/themes/neonlust" ]; then
  chmod -R o+rX ghost/themes/neonlust
  echo "Adjusted permissions on theme files to be container-readable."
else
  echo "Warning: ghost/themes/neonlust directory not found. Skipping permissions adjustment."
fi

echo "Setup complete. Please verify or update additional values in your .env file."
