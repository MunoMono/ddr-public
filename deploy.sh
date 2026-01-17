#!/bin/bash

# Deploy ddr-public to DigitalOcean Droplet
# Usage: ./deploy.sh

set -e

# Configuration
DROPLET_IP="134.209.182.97"
DROPLET_USER="root"
REMOTE_DIR="/opt/ddr-public"
IMAGE_NAME="ddr-public"
CONTAINER_NAME="ddr-public"

echo "🚀 Deploying ddr-public to $DROPLET_IP..."

# Step 1: Build Docker image locally
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:latest \
  --platform linux/amd64 \
  --build-arg VITE_DDR_ENV=production \
  --build-arg VITE_GRAPHQL_ENDPOINT=https://api.ddrarchive.org/graphql \
  .

# Step 2: Save image to tar file
echo "💾 Saving Docker image..."
docker save $IMAGE_NAME:latest | gzip > /tmp/${IMAGE_NAME}.tar.gz

# Step 3: Copy image to droplet
echo "📤 Uploading image to droplet..."
scp /tmp/${IMAGE_NAME}.tar.gz $DROPLET_USER@$DROPLET_IP:/tmp/

# Step 4: Ensure remote directory exists and copy docker-compose file
echo "📤 Setting up remote directory and uploading docker-compose.prod.yml..."
ssh $DROPLET_USER@$DROPLET_IP "mkdir -p $REMOTE_DIR"
scp docker-compose.prod.yml $DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/

# Step 5: Deploy on droplet
echo "🔄 Deploying on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << 'ENDSSH'
set -e

# Create directory if it doesn't exist
mkdir -p /opt/ddr-public
cd /opt/ddr-public

# Load the Docker image
echo "Loading Docker image..."
docker load < /tmp/ddr-public.tar.gz

# Stop and remove existing container if it exists
echo "Stopping existing container..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker rm -f ddr-public 2>/dev/null || true

# Start new container
echo "Starting new container..."
docker compose -f docker-compose.prod.yml up -d

# Clean up
rm /tmp/ddr-public.tar.gz

# Show status
echo "Container status:"
docker ps | grep ddr-public || echo "Container not found!"

echo "✅ Deployment complete!"
ENDSSH

# Clean up local tar file
rm /tmp/${IMAGE_NAME}.tar.gz

echo "✅ Deployment successful!"
echo "🌐 Site should be available at http://$DROPLET_IP:8080"
