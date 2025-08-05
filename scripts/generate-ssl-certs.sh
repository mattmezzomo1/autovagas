#!/bin/bash

# Create directory for SSL certificates
mkdir -p nginx/ssl

# Generate self-signed SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt \
  -subj "/C=BR/ST=Sao Paulo/L=Sao Paulo/O=AutoVagas/OU=Development/CN=localhost"

# Set permissions
chmod 600 nginx/ssl/server.key
chmod 600 nginx/ssl/server.crt

echo "Self-signed SSL certificates generated successfully."
echo "Note: These certificates are for development only. Use proper certificates for production."
