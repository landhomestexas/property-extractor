-- Increase statement timeout for large geometry queries
-- This migration increases database timeout settings to handle large property boundary queries

-- Set statement timeout to 10 minutes (600 seconds) to handle large geometry queries
ALTER DATABASE postgres SET statement_timeout = '600s';

-- Set it for current session as well
SET statement_timeout = '600s';

-- Increase work_mem for better performance on large geometry operations
-- This helps with sorting and hash operations on large datasets
ALTER DATABASE postgres SET work_mem = '256MB';
SET work_mem = '256MB';

-- Increase maintenance_work_mem for better index performance
ALTER DATABASE postgres SET maintenance_work_mem = '1GB';
SET maintenance_work_mem = '1GB';

-- Add a comment explaining why these settings exist
COMMENT ON DATABASE postgres IS 'Increased timeouts and memory settings for large geometry queries with 49k+ property boundaries';
