BEGIN;

-- Earlier Google sign-ins were marked accepted before the user saw the disclaimer.
-- Reset only incomplete Google onboarding records so consent is collected explicitly.
UPDATE users
SET accepted_disclaimer = FALSE,
    onboarding_completed = FALSE
WHERE auth_provider = 'google'
  AND onboarding_completed = FALSE;

INSERT INTO schema_migrations(version) VALUES ('002_google_disclaimer_consent')
ON CONFLICT (version) DO NOTHING;

COMMIT;
