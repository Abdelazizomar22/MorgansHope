BEGIN;

-- Consent cannot be reconstructed safely. Rollback only removes migration metadata.
DELETE FROM schema_migrations WHERE version = '002_google_disclaimer_consent';

COMMIT;
