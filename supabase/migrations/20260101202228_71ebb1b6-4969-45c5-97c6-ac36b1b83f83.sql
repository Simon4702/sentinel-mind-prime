-- Fix RLS policies for cross-organization data access

-- Drop existing overly permissive policies and recreate with proper org-scoping

-- 1. honeypots
DROP POLICY IF EXISTS "Authenticated users can manage honeypots" ON honeypots;
CREATE POLICY "Users manage honeypots in their org" ON honeypots
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 2. deception_telemetry (uses honeypot_id for org scoping)
DROP POLICY IF EXISTS "Authenticated users can view deception telemetry" ON deception_telemetry;
CREATE POLICY "Users view deception telemetry in their org" ON deception_telemetry
  FOR SELECT
  USING (
    honeypot_id IN (
      SELECT id FROM honeypots WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 3. predictive_risk_scores
DROP POLICY IF EXISTS "Authenticated users can manage predictive scores" ON predictive_risk_scores;
CREATE POLICY "Analysts view risk scores in their org" ON predictive_risk_scores
  FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM profiles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
    OR department_id IN (
      SELECT id FROM departments WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Analysts manage risk scores in their org" ON predictive_risk_scores
  FOR ALL
  USING (
    (user_id IN (
      SELECT user_id FROM profiles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
    OR department_id IN (
      SELECT id FROM departments WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    ))
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 4. cognitive_profiles
DROP POLICY IF EXISTS "Authenticated users can manage cognitive profiles" ON cognitive_profiles;
CREATE POLICY "Users manage cognitive profiles in their org" ON cognitive_profiles
  FOR ALL
  USING (
    user_id IN (
      SELECT user_id FROM profiles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM profiles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 5. defense_actions
DROP POLICY IF EXISTS "Authenticated users can manage defense actions" ON defense_actions;
CREATE POLICY "Users manage defense actions in their org" ON defense_actions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 6. digital_twin_simulations
DROP POLICY IF EXISTS "Authenticated users can manage simulations" ON digital_twin_simulations;
CREATE POLICY "Users manage simulations in their org" ON digital_twin_simulations
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 7. supply_chain_vendors
DROP POLICY IF EXISTS "Authenticated users can manage vendors" ON supply_chain_vendors;
CREATE POLICY "Users manage vendors in their org" ON supply_chain_vendors
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 8. dark_web_alerts
DROP POLICY IF EXISTS "Authenticated users can manage dark web alerts" ON dark_web_alerts;
CREATE POLICY "Users manage dark web alerts in their org" ON dark_web_alerts
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 9. zero_trust_access
DROP POLICY IF EXISTS "Authenticated users can manage zero trust access" ON zero_trust_access;
CREATE POLICY "Users manage zero trust access in their org" ON zero_trust_access
  FOR ALL
  USING (
    user_id IN (
      SELECT user_id FROM profiles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM profiles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 10. red_team_tests
DROP POLICY IF EXISTS "Authenticated users can manage red team tests" ON red_team_tests;
CREATE POLICY "Users manage red team tests in their org" ON red_team_tests
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 11. learned_attack_patterns
DROP POLICY IF EXISTS "Security analysts can view attack patterns" ON learned_attack_patterns;
CREATE POLICY "Analysts view attack patterns in their org" ON learned_attack_patterns
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

DROP POLICY IF EXISTS "Security analysts can manage attack patterns" ON learned_attack_patterns;
CREATE POLICY "Analysts manage attack patterns in their org" ON learned_attack_patterns
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 12. adaptive_defense_rules
DROP POLICY IF EXISTS "Security analysts can view defense rules" ON adaptive_defense_rules;
CREATE POLICY "Analysts view defense rules in their org" ON adaptive_defense_rules
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

DROP POLICY IF EXISTS "Security analysts can manage defense rules" ON adaptive_defense_rules;
CREATE POLICY "Analysts manage defense rules in their org" ON adaptive_defense_rules
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- 13. Fix user_behaviors - only service role should insert
DROP POLICY IF EXISTS "System can create behavior data" ON user_behaviors;
CREATE POLICY "Service role creates behavior data" ON user_behaviors
  FOR INSERT
  WITH CHECK (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- 14. Fix threat_intelligence - restrict global access to analysts only
DROP POLICY IF EXISTS "Users can view threat intelligence for their organization" ON threat_intelligence;
CREATE POLICY "Users view org threat intel" ON threat_intelligence
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
    OR (
      organization_id IS NULL
      AND public.has_role(auth.uid(), 'security_analyst')
    )
  );

-- Update has_role function to support admin as well (admins have all analyst permissions)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR role = 'admin')
  )
$$;