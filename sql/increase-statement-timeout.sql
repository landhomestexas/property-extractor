-- Increase statement timeout for large geometry queries
-- This allows queries to run for up to 10 minutes instead of the default (usually 30 seconds)

-- Set statement timeout to 10 minutes (600 seconds)
ALTER DATABASE postgres SET statement_timeout = '600s';

-- Also set it for the current session to take effect immediately
SET statement_timeout = '600s';

-- Optional: Set work_mem higher for better performance on large geometry operations
-- This allocates more memory for sorting and hash operations
ALTER DATABASE postgres SET work_mem = '256MB';
SET work_mem = '256MB';

-- Optional: Increase maintenance_work_mem for better index performance
ALTER DATABASE postgres SET maintenance_work_mem = '1GB';
SET maintenance_work_mem = '1GB';

-- Show current settings to verify
SHOW statement_timeout;
SHOW work_mem;
SHOW maintenance_work_mem;
