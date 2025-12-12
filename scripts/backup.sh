#!/bin/bash

# DDR Public Website Backup Script
# Backs up the entire project to a timestamped archive
# Run this via cron at 3 AM daily: 0 3 * * * /path/to/ddr-public/scripts/backup.sh

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$HOME/backups/ddr-public"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="ddr-public_${TIMESTAMP}.tar.gz"
RETENTION_DAYS=30

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔄 Starting DDR Public backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create temporary directory for backup
TMP_BACKUP_DIR=$(mktemp -d)
trap "rm -rf $TMP_BACKUP_DIR" EXIT

echo -e "${GREEN}📦 Creating archive...${NC}"

# Create tar archive excluding unnecessary files
cd "$PROJECT_ROOT"
tar -czf "$TMP_BACKUP_DIR/$BACKUP_NAME" \
  --exclude='node_modules' \
  --exclude='.venv' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='*.tar.gz' \
  .

# Move to final location
mv "$TMP_BACKUP_DIR/$BACKUP_NAME" "$BACKUP_DIR/"

echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/$BACKUP_NAME${NC}"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
echo -e "${BLUE}📊 Backup size: $BACKUP_SIZE${NC}"

# Clean up old backups (older than RETENTION_DAYS)
echo -e "${YELLOW}🧹 Cleaning up backups older than $RETENTION_DAYS days...${NC}"
find "$BACKUP_DIR" -name "ddr-public_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "ddr-public_*.tar.gz" -type f | wc -l | tr -d ' ')
echo -e "${GREEN}📁 Total backups: $BACKUP_COUNT${NC}"

echo -e "${BLUE}✨ Backup complete!${NC}"
