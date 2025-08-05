#!/bin/bash

# Database backup script

# Set default values
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_DB=${POSTGRES_DB:-autovagas}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
BACKUP_DIR=${BACKUP_DIR:-/backups}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Set timestamp for backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

# Perform backup
echo "Starting backup of ${POSTGRES_DB} database at ${TIMESTAMP}"
PGPASSWORD=${POSTGRES_PASSWORD} pg_dump -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${POSTGRES_DB} | gzip > ${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ${BACKUP_FILE}"
  
  # Set proper permissions
  chmod 600 ${BACKUP_FILE}
  
  # Delete old backups
  echo "Removing backups older than ${BACKUP_RETENTION_DAYS} days"
  find ${BACKUP_DIR} -name "${POSTGRES_DB}_*.sql.gz" -type f -mtime +${BACKUP_RETENTION_DAYS} -delete
else
  echo "Backup failed"
  exit 1
fi

# Also backup Redis if available
if [ -n "$(command -v redis-cli)" ]; then
  REDIS_BACKUP_FILE="${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"
  echo "Starting backup of Redis at ${TIMESTAMP}"
  redis-cli -h redis --rdb ${REDIS_BACKUP_FILE}
  
  if [ $? -eq 0 ]; then
    echo "Redis backup completed successfully: ${REDIS_BACKUP_FILE}"
    chmod 600 ${REDIS_BACKUP_FILE}
    find ${BACKUP_DIR} -name "redis_*.rdb" -type f -mtime +${BACKUP_RETENTION_DAYS} -delete
  else
    echo "Redis backup failed"
  fi
fi

echo "Backup process completed"

# Sleep to keep container running for cron jobs
if [ "$1" = "daemon" ]; then
  echo "Running as daemon, sleeping..."
  while true; do
    sleep 86400
  done
fi
