#!/bin/bash

# WebClone Pro - Backup and Disaster Recovery Script
# Production-grade backup solution with encryption and verification

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/webclone-pro}"
DATABASE_URL="${DATABASE_URL:-}"
S3_BUCKET="${S3_BUCKET:-}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PREFIX="webclone_backup_${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Ensure required tools are installed
check_dependencies() {
    local deps=("pg_dump" "tar" "gzip" "openssl" "aws")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep is not installed"
            exit 1
        fi
    done
    
    log_info "All dependencies are installed"
}

# Create backup directory if it doesn't exist
setup_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        chmod 700 "$BACKUP_DIR"
        log_info "Created backup directory: $BACKUP_DIR"
    fi
}

# Backup database
backup_database() {
    if [ -z "$DATABASE_URL" ]; then
        log_warn "DATABASE_URL not set, skipping database backup"
        return 1
    fi
    
    local db_backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}_database.sql"
    
    log_info "Starting database backup..."
    
    # Use pg_dump with custom format for faster restore
    pg_dump "$DATABASE_URL" \
        --format=custom \
        --verbose \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --exclude-table-data='audit_logs' \
        --exclude-table-data='rate_limits' \
        --file="$db_backup_file" 2>&1 | while read line; do
            echo "[pg_dump] $line"
        done
    
    if [ $? -eq 0 ]; then
        log_info "Database backup completed: $db_backup_file"
        
        # Compress the backup
        gzip -9 "$db_backup_file"
        db_backup_file="${db_backup_file}.gz"
        
        # Calculate checksum
        local checksum=$(sha256sum "$db_backup_file" | cut -d' ' -f1)
        echo "$checksum" > "${db_backup_file}.sha256"
        
        log_info "Database backup compressed and checksum created"
        return 0
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Backup application files
backup_application() {
    local app_backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}_application.tar.gz"
    
    log_info "Starting application backup..."
    
    # Create tar archive excluding unnecessary files
    tar -czf "$app_backup_file" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='coverage' \
        --exclude='*.log' \
        --exclude='.git' \
        --exclude='tmp' \
        --exclude='cache' \
        -C /app . 2>&1 | while read line; do
            echo "[tar] $line"
        done
    
    if [ $? -eq 0 ]; then
        log_info "Application backup completed: $app_backup_file"
        
        # Calculate checksum
        local checksum=$(sha256sum "$app_backup_file" | cut -d' ' -f1)
        echo "$checksum" > "${app_backup_file}.sha256"
        
        return 0
    else
        log_error "Application backup failed"
        return 1
    fi
}

# Backup environment configuration
backup_config() {
    local config_backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}_config.tar.gz"
    
    log_info "Starting configuration backup..."
    
    # Create temporary directory for config files
    local temp_config_dir=$(mktemp -d)
    
    # Copy configuration files (excluding secrets)
    cp /app/.env.production "$temp_config_dir/" 2>/dev/null || true
    cp /app/docker-compose.yml "$temp_config_dir/" 2>/dev/null || true
    cp /app/nginx.conf "$temp_config_dir/" 2>/dev/null || true
    cp -r /app/config "$temp_config_dir/" 2>/dev/null || true
    
    # Remove sensitive data
    sed -i 's/\(.*SECRET.*=\).*/\1[REDACTED]/' "$temp_config_dir/.env.production" 2>/dev/null || true
    sed -i 's/\(.*PASSWORD.*=\).*/\1[REDACTED]/' "$temp_config_dir/.env.production" 2>/dev/null || true
    sed -i 's/\(.*KEY.*=\).*/\1[REDACTED]/' "$temp_config_dir/.env.production" 2>/dev/null || true
    
    # Create tar archive
    tar -czf "$config_backup_file" -C "$temp_config_dir" . 2>&1
    
    # Clean up
    rm -rf "$temp_config_dir"
    
    log_info "Configuration backup completed: $config_backup_file"
}

# Encrypt backup files
encrypt_backups() {
    if [ -z "$ENCRYPTION_KEY" ]; then
        log_warn "ENCRYPTION_KEY not set, skipping encryption"
        return 1
    fi
    
    log_info "Encrypting backup files..."
    
    for file in ${BACKUP_DIR}/${BACKUP_PREFIX}_*.{tar.gz,sql.gz}; do
        if [ -f "$file" ]; then
            openssl enc -aes-256-cbc \
                -salt \
                -pbkdf2 \
                -in "$file" \
                -out "${file}.enc" \
                -pass "pass:$ENCRYPTION_KEY"
            
            if [ $? -eq 0 ]; then
                rm "$file"  # Remove unencrypted file
                log_info "Encrypted: $(basename ${file})"
            else
                log_error "Failed to encrypt: $(basename ${file})"
            fi
        fi
    done
}

# Upload to S3
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log_warn "S3_BUCKET not set, skipping S3 upload"
        return 1
    fi
    
    log_info "Uploading backups to S3..."
    
    for file in ${BACKUP_DIR}/${BACKUP_PREFIX}_*; do
        if [ -f "$file" ]; then
            aws s3 cp "$file" "s3://${S3_BUCKET}/backups/$(basename $file)" \
                --storage-class STANDARD_IA \
                --server-side-encryption AES256 \
                --metadata "backup-date=${TIMESTAMP}"
            
            if [ $? -eq 0 ]; then
                log_info "Uploaded to S3: $(basename $file)"
            else
                log_error "Failed to upload to S3: $(basename $file)"
            fi
        fi
    done
    
    # Set lifecycle policy for automatic deletion
    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$S3_BUCKET" \
        --lifecycle-configuration file:///app/scripts/s3-lifecycle.json 2>/dev/null || true
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    # Local cleanup
    find "$BACKUP_DIR" -type f -name "webclone_backup_*" -mtime +${RETENTION_DAYS} -exec rm {} \;
    
    # S3 cleanup (if configured)
    if [ -n "$S3_BUCKET" ]; then
        aws s3 ls "s3://${S3_BUCKET}/backups/" | while read -r line; do
            create_date=$(echo $line | awk '{print $1" "$2}')
            create_date=$(date -d "$create_date" +%s 2>/dev/null || echo 0)
            older_than=$(date -d "${RETENTION_DAYS} days ago" +%s)
            
            if [ $create_date -lt $older_than ]; then
                file_name=$(echo $line | awk '{print $4}')
                aws s3 rm "s3://${S3_BUCKET}/backups/${file_name}"
                log_info "Deleted from S3: $file_name"
            fi
        done
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_prefix="$1"
    local all_valid=true
    
    log_info "Verifying backup integrity..."
    
    for checksum_file in ${BACKUP_DIR}/${backup_prefix}_*.sha256; do
        if [ -f "$checksum_file" ]; then
            local backup_file="${checksum_file%.sha256}"
            if [ -f "$backup_file" ]; then
                local expected_checksum=$(cat "$checksum_file")
                local actual_checksum=$(sha256sum "$backup_file" | cut -d' ' -f1)
                
                if [ "$expected_checksum" = "$actual_checksum" ]; then
                    log_info "✓ Checksum valid: $(basename $backup_file)"
                else
                    log_error "✗ Checksum mismatch: $(basename $backup_file)"
                    all_valid=false
                fi
            fi
        fi
    done
    
    if $all_valid; then
        log_info "All backup files verified successfully"
        return 0
    else
        log_error "Backup verification failed"
        return 1
    fi
}

# Restore database from backup
restore_database() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Restoring database from: $backup_file"
    
    # Decrypt if encrypted
    if [[ "$backup_file" == *.enc ]]; then
        if [ -z "$ENCRYPTION_KEY" ]; then
            log_error "ENCRYPTION_KEY required to decrypt backup"
            return 1
        fi
        
        local decrypted_file="${backup_file%.enc}"
        openssl enc -aes-256-cbc -d \
            -pbkdf2 \
            -in "$backup_file" \
            -out "$decrypted_file" \
            -pass "pass:$ENCRYPTION_KEY"
        backup_file="$decrypted_file"
    fi
    
    # Decompress if compressed
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "${backup_file%.gz}"
        backup_file="${backup_file%.gz}"
    fi
    
    # Restore database
    pg_restore "$DATABASE_URL" \
        --verbose \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        "$backup_file"
    
    if [ $? -eq 0 ]; then
        log_info "Database restored successfully"
        return 0
    else
        log_error "Database restore failed"
        return 1
    fi
}

# Restore application files
restore_application() {
    local backup_file="$1"
    local restore_dir="${2:-/app}"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Restoring application files to: $restore_dir"
    
    # Decrypt if encrypted
    if [[ "$backup_file" == *.enc ]]; then
        if [ -z "$ENCRYPTION_KEY" ]; then
            log_error "ENCRYPTION_KEY required to decrypt backup"
            return 1
        fi
        
        local decrypted_file="${backup_file%.enc}"
        openssl enc -aes-256-cbc -d \
            -pbkdf2 \
            -in "$backup_file" \
            -out "$decrypted_file" \
            -pass "pass:$ENCRYPTION_KEY"
        backup_file="$decrypted_file"
    fi
    
    # Extract files
    tar -xzf "$backup_file" -C "$restore_dir"
    
    if [ $? -eq 0 ]; then
        log_info "Application files restored successfully"
        return 0
    else
        log_error "Application restore failed"
        return 1
    fi
}

# Generate backup report
generate_report() {
    local report_file="${BACKUP_DIR}/backup_report_${TIMESTAMP}.txt"
    
    {
        echo "WebClone Pro Backup Report"
        echo "=========================="
        echo "Date: $(date)"
        echo "Hostname: $(hostname)"
        echo ""
        echo "Backup Files:"
        echo "-------------"
        ls -lh ${BACKUP_DIR}/${BACKUP_PREFIX}_* 2>/dev/null || echo "No backup files found"
        echo ""
        echo "Disk Usage:"
        echo "-----------"
        df -h "$BACKUP_DIR"
        echo ""
        echo "Database Size:"
        echo "--------------"
        if [ -n "$DATABASE_URL" ]; then
            psql "$DATABASE_URL" -c "SELECT pg_database_size(current_database());" 2>/dev/null || echo "Unable to get database size"
        fi
        echo ""
        echo "Recent Backups:"
        echo "---------------"
        ls -lt ${BACKUP_DIR}/webclone_backup_* 2>/dev/null | head -10 || echo "No recent backups"
    } > "$report_file"
    
    log_info "Backup report generated: $report_file"
    
    # Send report via email if configured
    if [ -n "${ADMIN_EMAIL:-}" ]; then
        mail -s "WebClone Pro Backup Report - ${TIMESTAMP}" "$ADMIN_EMAIL" < "$report_file" 2>/dev/null || true
    fi
}

# Main execution
main() {
    local action="${1:-backup}"
    
    case "$action" in
        backup)
            log_info "Starting WebClone Pro backup process..."
            check_dependencies
            setup_backup_dir
            
            # Perform backups
            backup_database
            backup_application
            backup_config
            
            # Encrypt and upload
            encrypt_backups
            upload_to_s3
            
            # Verify and cleanup
            verify_backup "$BACKUP_PREFIX"
            cleanup_old_backups
            
            # Generate report
            generate_report
            
            log_info "Backup process completed successfully"
            ;;
            
        restore)
            if [ $# -lt 2 ]; then
                log_error "Usage: $0 restore <backup_prefix>"
                exit 1
            fi
            
            local backup_prefix="$2"
            log_info "Starting restore process for: $backup_prefix"
            
            # Restore components
            restore_database "${BACKUP_DIR}/${backup_prefix}_database.sql.gz.enc"
            restore_application "${BACKUP_DIR}/${backup_prefix}_application.tar.gz.enc"
            
            log_info "Restore process completed"
            ;;
            
        verify)
            if [ $# -lt 2 ]; then
                log_error "Usage: $0 verify <backup_prefix>"
                exit 1
            fi
            
            verify_backup "$2"
            ;;
            
        list)
            log_info "Available backups:"
            ls -lt ${BACKUP_DIR}/webclone_backup_* 2>/dev/null | head -20 || echo "No backups found"
            ;;
            
        cleanup)
            cleanup_old_backups
            ;;
            
        *)
            echo "Usage: $0 {backup|restore|verify|list|cleanup}"
            echo ""
            echo "Commands:"
            echo "  backup   - Create a new backup"
            echo "  restore  - Restore from backup"
            echo "  verify   - Verify backup integrity"
            echo "  list     - List available backups"
            echo "  cleanup  - Remove old backups"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"