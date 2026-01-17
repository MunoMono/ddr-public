#!/bin/bash
set -e

# Production deployment script for ddr-public
# This script handles the complete deployment process with proper cache clearing

SERVER="root@134.209.182.97"
DEPLOY_DIR="/root/ddr-public-deploy"
IMAGE_NAME="ddr-public:latest"
CONTAINER_NAME="ddr-public"

echo "🚀 Starting ddr-public deployment..."

# Step 1: Pull latest code
echo "📥 Pulling latest code from GitHub..."
ssh $SERVER "cd $DEPLOY_DIR && git pull"

# Step 2: Build Docker image with no cache
echo "🏗️  Building Docker image (no cache)..."
ssh $SERVER "cd $DEPLOY_DIR && docker build --no-cache -t $IMAGE_NAME ."

# Step 3: Stop and remove old container
echo "🛑 Stopping old container..."
ssh $SERVER "docker stop $CONTAINER_NAME || true"
ssh $SERVER "docker rm $CONTAINER_NAME || true"

# Step 4: Start new container
echo "▶️  Starting new container..."
ssh $SERVER "cd $DEPLOY_DIR && docker compose -f docker-compose.prod.yml up -d"

# Step 5: Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
for i in {1..30}; do
    if ssh $SERVER "docker ps | grep $CONTAINER_NAME | grep -q healthy"; then
        echo "✅ Container is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Container failed to become healthy"
        exit 1
    fi
    sleep 2
done

# Step 6: Restart Caddy to clear its cache
echo "🔄 Restarting Caddy to clear cache..."
ssh $SERVER "docker restart ddrarchive-caddy"

# Step 7: Verify deployment
echo "🔍 Verifying deployment..."
sleep 3

# Check if JSON files are served correctly
JSON_RESPONSE=$(ssh $SERVER "curl -s http://localhost:8080/data/presets/records.json | head -1")
if [[ $JSON_RESPONSE == "{"* ]]; then
    echo "✅ JSON files are being served correctly"
else
    echo "❌ JSON files are NOT being served correctly"
    echo "Response: $JSON_RESPONSE"
    exit 1
fi

# Check container logs for errors
echo "📋 Recent container logs:"
ssh $SERVER "docker logs --tail=20 $CONTAINER_NAME"

echo "✨ Deployment complete!"
echo ""
echo "🌐 Live site: https://ddrarchive.org/api"
echo "📊 To view logs: ssh $SERVER docker logs -f $CONTAINER_NAME"
