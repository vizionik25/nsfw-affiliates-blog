#!/bin/sh
set -e

# Ensure the themes directory exists in the volume
mkdir -p /var/lib/ghost/content/themes

# Force copy/sync the custom theme from the image to the persistent volume
cp -rf /var/lib/ghost/content.orig/themes/neonlust /var/lib/ghost/content/themes/

# Ensure correct permissions on the copied theme in the volume
chown -R node:node /var/lib/ghost/content/themes/neonlust

# Execute the default Ghost entrypoint
exec docker-entrypoint.sh "$@"
