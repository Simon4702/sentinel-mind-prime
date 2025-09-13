-- RLS Policies for Organizations
CREATE POLICY "Users can view their organization" ON public.organizations
FOR SELECT USING (id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage organizations" ON public.organizations
FOR ALL USING (get_user_role() = 'admin'::user_role);

-- RLS Policies for Departments
CREATE POLICY "Users can view departments in their organization" ON public.departments
FOR SELECT USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage departments" ON public.departments
FOR ALL USING (get_user_role() = 'admin'::user_role);

-- RLS Policies for Role Permissions
CREATE POLICY "Users can view role permissions" ON public.role_permissions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
FOR ALL USING (get_user_role() = 'admin'::user_role);

-- RLS Policies for Risk Scores
CREATE POLICY "Users can view their own risk scores" ON public.risk_scores
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Security analysts can view all risk scores in organization" ON public.risk_scores
FOR SELECT USING (
  get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.user_id = auth.uid() AND p2.user_id = risk_scores.user_id
    AND p1.organization_id = p2.organization_id
  )
);

CREATE POLICY "System can manage risk scores" ON public.risk_scores
FOR ALL USING (get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role));

-- RLS Policies for Security Incidents
CREATE POLICY "Users can view incidents in their organization" ON public.security_incidents
FOR SELECT USING (
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Security analysts can manage incidents" ON public.security_incidents
FOR ALL USING (
  get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role) AND
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for Threat Intelligence
CREATE POLICY "Users can view threat intelligence for their organization" ON public.threat_intelligence
FOR SELECT USING (
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()) OR
  organization_id IS NULL -- Global threat intelligence
);

CREATE POLICY "Security analysts can manage threat intelligence" ON public.threat_intelligence
FOR ALL USING (get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role));

-- RLS Policies for User Behaviors
CREATE POLICY "Users can view their own behavior data" ON public.user_behaviors
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Security analysts can view behavior data in organization" ON public.user_behaviors
FOR SELECT USING (
  get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.user_id = auth.uid() AND p2.user_id = user_behaviors.user_id
    AND p1.organization_id = p2.organization_id
  )
);

CREATE POLICY "System can manage behavior data" ON public.user_behaviors
FOR INSERT USING (true);

CREATE POLICY "Security analysts can update behavior data" ON public.user_behaviors
FOR UPDATE USING (get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role));

-- RLS Policies for Phishing Campaigns
CREATE POLICY "Users can view campaigns in their organization" ON public.phishing_campaigns
FOR SELECT USING (
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Security analysts can manage campaigns" ON public.phishing_campaigns
FOR ALL USING (
  get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role) AND
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for Training Results
CREATE POLICY "Users can view their own training results" ON public.training_results
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Security analysts can view training results in organization" ON public.training_results
FOR SELECT USING (
  get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.user_id = auth.uid() AND p2.user_id = training_results.user_id
    AND p1.organization_id = p2.organization_id
  )
);

CREATE POLICY "Users can manage their own training results" ON public.training_results
FOR INSERT USING (user_id = auth.uid());

CREATE POLICY "Security analysts can manage training results" ON public.training_results
FOR UPDATE USING (get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role));

-- RLS Policies for Audit Logs
CREATE POLICY "Security analysts can view audit logs in organization" ON public.audit_logs
FOR SELECT USING (
  get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role) AND
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "System can create audit logs" ON public.audit_logs
FOR INSERT USING (true);

-- RLS Policies for Security Alerts
CREATE POLICY "Users can view alerts in their organization" ON public.security_alerts
FOR SELECT USING (
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Security analysts can manage alerts" ON public.security_alerts
FOR ALL USING (
  get_user_role() IN ('admin'::user_role, 'security_analyst'::user_role) AND
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);