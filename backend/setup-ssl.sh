#!/bin/bash

echo "🔐 Setting up SSL certificates for DAOgram..."

# Create ssl directory
mkdir -p ssl

echo "📁 Created ssl/ directory"
echo ""
echo "Please place your SSL certificate files in the ssl/ directory:"
echo "  - ssl/key.pem (private key)"
echo "  - ssl/cert.pem (certificate)"
echo ""
echo "If you don't have SSL certificates yet, you can:"
echo "1. Use Let's Encrypt: certbot certonly --standalone -d commonwealthsovereignfoundation.org"
echo "2. Copy the files to ssl/key.pem and ssl/cert.pem"
echo "3. Or use self-signed certificates for development:"
echo "   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes"
echo ""
echo "After placing the certificates, you can start the server with:"
echo "npm run dev" 