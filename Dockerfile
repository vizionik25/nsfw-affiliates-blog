FROM ghost:5-alpine

# Copy custom theme to the original content template folder
COPY --chown=node:node ./ghost/themes/neonlust /var/lib/ghost/content.orig/themes/neonlust

# Copy and configure custom entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["node", "current/index.js"]
