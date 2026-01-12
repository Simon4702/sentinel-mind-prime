-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role creates behavior data" ON user_behaviors;

-- Create a more restrictive INSERT policy that validates user_id belongs to the inserting user's organization
-- Using authenticated users with proper organization validation
CREATE POLICY "Authenticated users can insert their own behavior data" ON user_behaviors
  FOR INSERT
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Either inserting their own behavior data
      user_id = auth.uid()
      OR
      -- Or security analysts/admins can insert behavior data for users in their organization
      (
        get_user_role() IN ('admin', 'security_analyst')
        AND EXISTS (
          SELECT 1 FROM profiles p1, profiles p2
          WHERE p1.user_id = auth.uid()
            AND p2.user_id = user_behaviors.user_id
            AND p1.organization_id = p2.organization_id
        )
      )
    )
  );

-- Add a CHECK constraint to validate anomaly_score is within valid range (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_behaviors_anomaly_score_check' 
    AND conrelid = 'user_behaviors'::regclass
  ) THEN
    ALTER TABLE user_behaviors 
    ADD CONSTRAINT user_behaviors_anomaly_score_check 
    CHECK (anomaly_score IS NULL OR (anomaly_score >= 0 AND anomaly_score <= 100));
  END IF;
END $$;