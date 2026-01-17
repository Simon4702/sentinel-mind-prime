export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adaptive_defense_rules: {
        Row: {
          actions: Json
          created_at: string
          description: string | null
          effectiveness_score: number | null
          id: string
          is_auto_generated: boolean | null
          is_enabled: boolean | null
          last_triggered_at: string | null
          organization_id: string | null
          priority: number | null
          rule_name: string
          rule_type: string
          source_pattern_id: string | null
          times_triggered: number | null
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          description?: string | null
          effectiveness_score?: number | null
          id?: string
          is_auto_generated?: boolean | null
          is_enabled?: boolean | null
          last_triggered_at?: string | null
          organization_id?: string | null
          priority?: number | null
          rule_name: string
          rule_type: string
          source_pattern_id?: string | null
          times_triggered?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          actions?: Json
          created_at?: string
          description?: string | null
          effectiveness_score?: number | null
          id?: string
          is_auto_generated?: boolean | null
          is_enabled?: boolean | null
          last_triggered_at?: string | null
          organization_id?: string | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          source_pattern_id?: string | null
          times_triggered?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_defense_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adaptive_defense_rules_source_pattern_id_fkey"
            columns: ["source_pattern_id"]
            isOneToOne: false
            referencedRelation: "learned_attack_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_escalation_history: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_id: string | null
          escalated_at: string
          escalated_to: string
          escalation_level: number
          id: string
          notification_sent: boolean | null
          rule_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id?: string | null
          escalated_at?: string
          escalated_to: string
          escalation_level: number
          id?: string
          notification_sent?: boolean | null
          rule_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id?: string | null
          escalated_at?: string
          escalated_to?: string
          escalation_level?: number
          id?: string
          notification_sent?: boolean | null
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_escalation_history_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "alert_escalation_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "security_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_escalation_history_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_escalation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_escalation_rules: {
        Row: {
          created_at: string
          description: string | null
          escalation_level: number
          escalation_target: string
          escalation_target_type: string
          id: string
          is_enabled: boolean | null
          notification_channels: string[] | null
          organization_id: string | null
          response_time_minutes: number
          rule_name: string
          severity_trigger: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          escalation_level?: number
          escalation_target: string
          escalation_target_type?: string
          id?: string
          is_enabled?: boolean | null
          notification_channels?: string[] | null
          organization_id?: string | null
          response_time_minutes?: number
          rule_name: string
          severity_trigger?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          escalation_level?: number
          escalation_target?: string
          escalation_target_type?: string
          id?: string
          is_enabled?: boolean | null
          notification_channels?: string[] | null
          organization_id?: string | null
          response_time_minutes?: number
          rule_name?: string
          severity_trigger?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_escalation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          organization_id: string
          resource_id: string | null
          resource_type: string
          result: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          organization_id: string
          resource_id?: string | null
          resource_type: string
          result?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          result?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cognitive_profiles: {
        Row: {
          activity_patterns: Json | null
          characteristics: Json | null
          created_at: string
          detection_sensitivity: number | null
          id: string
          last_analyzed_at: string | null
          profile_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activity_patterns?: Json | null
          characteristics?: Json | null
          created_at?: string
          detection_sensitivity?: number | null
          id?: string
          last_analyzed_at?: string | null
          profile_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activity_patterns?: Json | null
          characteristics?: Json | null
          created_at?: string
          detection_sensitivity?: number | null
          id?: string
          last_analyzed_at?: string | null
          profile_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cyber_arsenal_scans: {
        Row: {
          created_at: string
          id: string
          is_malicious: boolean | null
          organization_id: string | null
          risk_score: number | null
          scan_result: Json
          tags: string[] | null
          target: string
          target_type: string
          tool_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_malicious?: boolean | null
          organization_id?: string | null
          risk_score?: number | null
          scan_result?: Json
          tags?: string[] | null
          target: string
          target_type: string
          tool_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_malicious?: boolean | null
          organization_id?: string | null
          risk_score?: number | null
          scan_result?: Json
          tags?: string[] | null
          target?: string
          target_type?: string
          tool_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cyber_arsenal_scans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dark_web_alerts: {
        Row: {
          affected_assets: Json | null
          alert_type: string
          created_at: string
          details: Json | null
          discovered_at: string
          id: string
          is_resolved: boolean | null
          organization_id: string | null
          resolved_at: string | null
          severity: string | null
          source: string | null
        }
        Insert: {
          affected_assets?: Json | null
          alert_type: string
          created_at?: string
          details?: Json | null
          discovered_at?: string
          id?: string
          is_resolved?: boolean | null
          organization_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          source?: string | null
        }
        Update: {
          affected_assets?: Json | null
          alert_type?: string
          created_at?: string
          details?: Json | null
          discovered_at?: string
          id?: string
          is_resolved?: boolean | null
          organization_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dark_web_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deception_telemetry: {
        Row: {
          attacker_fingerprint: Json | null
          attacker_ip: string | null
          created_at: string
          honeypot_id: string | null
          id: string
          intent_analysis: string | null
          redirected_to_sandbox: boolean | null
          sandbox_id: string | null
          technique_used: string | null
          timeline: Json | null
        }
        Insert: {
          attacker_fingerprint?: Json | null
          attacker_ip?: string | null
          created_at?: string
          honeypot_id?: string | null
          id?: string
          intent_analysis?: string | null
          redirected_to_sandbox?: boolean | null
          sandbox_id?: string | null
          technique_used?: string | null
          timeline?: Json | null
        }
        Update: {
          attacker_fingerprint?: Json | null
          attacker_ip?: string | null
          created_at?: string
          honeypot_id?: string | null
          id?: string
          intent_analysis?: string | null
          redirected_to_sandbox?: boolean | null
          sandbox_id?: string | null
          technique_used?: string | null
          timeline?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deception_telemetry_honeypot_id_fkey"
            columns: ["honeypot_id"]
            isOneToOne: false
            referencedRelation: "honeypots"
            referencedColumns: ["id"]
          },
        ]
      }
      defense_actions: {
        Row: {
          action_type: string
          auto_triggered: boolean | null
          created_at: string
          executed_at: string | null
          id: string
          organization_id: string | null
          rolled_back_at: string | null
          status: string | null
          target_id: string | null
          target_type: string
          trigger_alert_id: string | null
          trigger_reason: string | null
        }
        Insert: {
          action_type: string
          auto_triggered?: boolean | null
          created_at?: string
          executed_at?: string | null
          id?: string
          organization_id?: string | null
          rolled_back_at?: string | null
          status?: string | null
          target_id?: string | null
          target_type: string
          trigger_alert_id?: string | null
          trigger_reason?: string | null
        }
        Update: {
          action_type?: string
          auto_triggered?: boolean | null
          created_at?: string
          executed_at?: string | null
          id?: string
          organization_id?: string | null
          rolled_back_at?: string | null
          status?: string | null
          target_id?: string | null
          target_type?: string
          trigger_alert_id?: string | null
          trigger_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defense_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defense_actions_trigger_alert_id_fkey"
            columns: ["trigger_alert_id"]
            isOneToOne: false
            referencedRelation: "security_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      defense_learning_events: {
        Row: {
          analysis_result: Json | null
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          organization_id: string | null
          patterns_identified: number | null
          processing_time_ms: number | null
          rules_generated: number | null
          rules_updated: number | null
          source_data: Json
          status: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          organization_id?: string | null
          patterns_identified?: number | null
          processing_time_ms?: number | null
          rules_generated?: number | null
          rules_updated?: number | null
          source_data?: Json
          status?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          organization_id?: string | null
          patterns_identified?: number | null
          processing_time_ms?: number | null
          rules_generated?: number | null
          rules_updated?: number | null
          source_data?: Json
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defense_learning_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          risk_level: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          risk_level?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          risk_level?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_twin_simulations: {
        Row: {
          attack_scenario: Json | null
          blast_radius: Json | null
          completed_at: string | null
          created_at: string
          financial_impact_estimate: number | null
          id: string
          name: string
          network_architecture: Json | null
          organization_id: string | null
          recommendations: Json | null
          simulation_type: string
          status: string | null
        }
        Insert: {
          attack_scenario?: Json | null
          blast_radius?: Json | null
          completed_at?: string | null
          created_at?: string
          financial_impact_estimate?: number | null
          id?: string
          name: string
          network_architecture?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          simulation_type: string
          status?: string | null
        }
        Update: {
          attack_scenario?: Json | null
          blast_radius?: Json | null
          completed_at?: string | null
          created_at?: string
          financial_impact_estimate?: number | null
          id?: string
          name?: string
          network_architecture?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          simulation_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_twin_simulations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      honeypots: {
        Row: {
          created_at: string
          decoy_data: Json | null
          id: string
          interactions_count: number | null
          is_active: boolean | null
          last_interaction_at: string | null
          name: string
          organization_id: string | null
          target_ip: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decoy_data?: Json | null
          id?: string
          interactions_count?: number | null
          is_active?: boolean | null
          last_interaction_at?: string | null
          name: string
          organization_id?: string | null
          target_ip?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decoy_data?: Json | null
          id?: string
          interactions_count?: number | null
          is_active?: boolean | null
          last_interaction_at?: string | null
          name?: string
          organization_id?: string | null
          target_ip?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "honeypots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ioc_scan_history: {
        Row: {
          alert_generated: boolean | null
          id: string
          ioc_id: string
          is_malicious: boolean | null
          reputation_change: number | null
          risk_score: number | null
          scan_result: Json | null
          scanned_at: string
        }
        Insert: {
          alert_generated?: boolean | null
          id?: string
          ioc_id: string
          is_malicious?: boolean | null
          reputation_change?: number | null
          risk_score?: number | null
          scan_result?: Json | null
          scanned_at?: string
        }
        Update: {
          alert_generated?: boolean | null
          id?: string
          ioc_id?: string
          is_malicious?: boolean | null
          reputation_change?: number | null
          risk_score?: number | null
          scan_result?: Json | null
          scanned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ioc_scan_history_ioc_id_fkey"
            columns: ["ioc_id"]
            isOneToOne: false
            referencedRelation: "ioc_watchlist"
            referencedColumns: ["id"]
          },
        ]
      }
      ioc_watchlist: {
        Row: {
          alert_on_change: boolean | null
          created_at: string
          description: string | null
          id: string
          indicator_type: string
          indicator_value: string
          is_active: boolean | null
          is_malicious: boolean | null
          last_risk_score: number | null
          last_scan_at: string | null
          organization_id: string | null
          previous_risk_score: number | null
          scan_frequency_hours: number | null
          tags: string[] | null
          updated_at: string
          was_malicious: boolean | null
        }
        Insert: {
          alert_on_change?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          indicator_type: string
          indicator_value: string
          is_active?: boolean | null
          is_malicious?: boolean | null
          last_risk_score?: number | null
          last_scan_at?: string | null
          organization_id?: string | null
          previous_risk_score?: number | null
          scan_frequency_hours?: number | null
          tags?: string[] | null
          updated_at?: string
          was_malicious?: boolean | null
        }
        Update: {
          alert_on_change?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          indicator_type?: string
          indicator_value?: string
          is_active?: boolean | null
          is_malicious?: boolean | null
          last_risk_score?: number | null
          last_scan_at?: string | null
          organization_id?: string | null
          previous_risk_score?: number | null
          scan_frequency_hours?: number | null
          tags?: string[] | null
          updated_at?: string
          was_malicious?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ioc_watchlist_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      learned_attack_patterns: {
        Row: {
          attack_type: string
          confidence_score: number | null
          countermeasures: Json
          created_at: string
          detection_rules: Json
          first_seen_at: string
          id: string
          indicators: Json
          is_active: boolean | null
          last_seen_at: string
          learned_from_incidents: string[] | null
          organization_id: string | null
          pattern_name: string
          times_detected: number | null
          updated_at: string
        }
        Insert: {
          attack_type: string
          confidence_score?: number | null
          countermeasures?: Json
          created_at?: string
          detection_rules?: Json
          first_seen_at?: string
          id?: string
          indicators?: Json
          is_active?: boolean | null
          last_seen_at?: string
          learned_from_incidents?: string[] | null
          organization_id?: string | null
          pattern_name: string
          times_detected?: number | null
          updated_at?: string
        }
        Update: {
          attack_type?: string
          confidence_score?: number | null
          countermeasures?: Json
          created_at?: string
          detection_rules?: Json
          first_seen_at?: string
          id?: string
          indicators?: Json
          is_active?: boolean | null
          last_seen_at?: string
          learned_from_incidents?: string[] | null
          organization_id?: string | null
          pattern_name?: string
          times_detected?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learned_attack_patterns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          is_active: boolean
          max_users: number | null
          name: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          max_users?: number | null
          name: string
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          max_users?: number | null
          name?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      phishing_campaigns: {
        Row: {
          click_rate: number | null
          created_at: string
          created_by: string
          description: string | null
          difficulty_level: number | null
          end_date: string | null
          id: string
          name: string
          organization_id: string
          report_rate: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_departments: string[] | null
          template_type: string
          updated_at: string
        }
        Insert: {
          click_rate?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          name: string
          organization_id: string
          report_rate?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_departments?: string[] | null
          template_type: string
          updated_at?: string
        }
        Update: {
          click_rate?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          report_rate?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_departments?: string[] | null
          template_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phishing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "phishing_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          executed_by: string
          id: string
          incident_id: string
          notes: string | null
          playbook_id: string
          started_at: string
          step_statuses: Json
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          executed_by: string
          id?: string
          incident_id: string
          notes?: string | null
          playbook_id: string
          started_at?: string
          step_statuses?: Json
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          executed_by?: string
          id?: string
          incident_id?: string
          notes?: string | null
          playbook_id?: string
          started_at?: string
          step_statuses?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_executions_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "security_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_risk_scores: {
        Row: {
          behavior_drift_score: number | null
          breach_probability: number | null
          created_at: string
          department_id: string | null
          id: string
          insider_threat_probability: number | null
          phishing_susceptibility: number | null
          predicted_at: string
          prediction_factors: Json | null
          stress_indicators: Json | null
          user_id: string | null
        }
        Insert: {
          behavior_drift_score?: number | null
          breach_probability?: number | null
          created_at?: string
          department_id?: string | null
          id?: string
          insider_threat_probability?: number | null
          phishing_susceptibility?: number | null
          predicted_at?: string
          prediction_factors?: Json | null
          stress_indicators?: Json | null
          user_id?: string | null
        }
        Update: {
          behavior_drift_score?: number | null
          breach_probability?: number | null
          created_at?: string
          department_id?: string | null
          id?: string
          insider_threat_probability?: number | null
          phishing_susceptibility?: number | null
          predicted_at?: string
          prediction_factors?: Json | null
          stress_indicators?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictive_risk_scores_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_risk_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          department_id: string | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          security_clearance_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          security_clearance_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          security_clearance_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      red_team_tests: {
        Row: {
          attack_chain: Json | null
          completed_at: string | null
          created_at: string
          id: string
          organization_id: string | null
          posture_score: number | null
          results: Json | null
          started_at: string | null
          status: string | null
          target_scope: Json | null
          test_type: string
          vulnerabilities_found: number | null
        }
        Insert: {
          attack_chain?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          posture_score?: number | null
          results?: Json | null
          started_at?: string | null
          status?: string | null
          target_scope?: Json | null
          test_type: string
          vulnerabilities_found?: number | null
        }
        Update: {
          attack_chain?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          posture_score?: number | null
          results?: Json | null
          started_at?: string | null
          status?: string | null
          target_scope?: Json | null
          test_type?: string
          vulnerabilities_found?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "red_team_tests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_scores: {
        Row: {
          behavior_anomaly_score: number | null
          compliance_score: number | null
          created_at: string
          id: string
          insider_threat_risk: number | null
          last_calculated: string
          overall_score: number
          phishing_susceptibility: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          behavior_anomaly_score?: number | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          insider_threat_risk?: number | null
          last_calculated?: string
          overall_score?: number
          phishing_susceptibility?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          behavior_anomaly_score?: number | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          insider_threat_risk?: number | null
          last_calculated?: string
          overall_score?: number
          phishing_susceptibility?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission: Database["public"]["Enums"]["permission_type"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          id?: string
          permission: Database["public"]["Enums"]["permission_type"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_user_id: string | null
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_acknowledged: boolean | null
          is_resolved: boolean | null
          organization_id: string
          priority: Database["public"]["Enums"]["alert_priority"]
          raw_data: Json | null
          resolved_at: string | null
          resolved_by: string | null
          source_system: string | null
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_user_id?: string | null
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          organization_id: string
          priority?: Database["public"]["Enums"]["alert_priority"]
          raw_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          source_system?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_user_id?: string | null
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["alert_priority"]
          raw_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          source_system?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_alerts_affected_user_id_fkey"
            columns: ["affected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      security_incidents: {
        Row: {
          affected_user_id: string | null
          assigned_to: string | null
          created_at: string
          department_id: string | null
          description: string | null
          detected_at: string
          detection_method: string | null
          id: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          organization_id: string
          resolved_at: string | null
          risk_score: number | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
        }
        Insert: {
          affected_user_id?: string | null
          assigned_to?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          detected_at?: string
          detection_method?: string | null
          id?: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          organization_id: string
          resolved_at?: string | null
          risk_score?: number | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
        }
        Update: {
          affected_user_id?: string | null
          assigned_to?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          detected_at?: string
          detection_method?: string | null
          id?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          organization_id?: string
          resolved_at?: string | null
          risk_score?: number | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_incidents_affected_user_id_fkey"
            columns: ["affected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_incidents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_playbooks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          estimated_time_minutes: number | null
          id: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          is_active: boolean
          name: string
          organization_id: string
          severity: Database["public"]["Enums"]["incident_severity"] | null
          steps: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          is_active?: boolean
          name: string
          organization_id: string
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          steps?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          is_active?: boolean
          name?: string
          organization_id?: string
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          steps?: Json
          updated_at?: string
        }
        Relationships: []
      }
      siem_agent_groups: {
        Row: {
          agent_count: number | null
          color: string | null
          created_at: string
          description: string | null
          group_name: string
          icon: string | null
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          agent_count?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          group_name: string
          icon?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_count?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          group_name?: string
          icon?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "siem_agent_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      siem_agents: {
        Row: {
          agent_name: string
          agent_type: string
          agent_version: string | null
          alerts_generated: number | null
          config: Json | null
          cpu_usage: number | null
          created_at: string
          disk_usage: number | null
          events_collected: number | null
          hostname: string
          id: string
          installed_at: string | null
          ip_address: string | null
          last_event_at: string | null
          last_heartbeat_at: string | null
          location: Json | null
          memory_usage: number | null
          network_bytes_in: number | null
          network_bytes_out: number | null
          organization_id: string | null
          os_type: string | null
          os_version: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          agent_type?: string
          agent_version?: string | null
          alerts_generated?: number | null
          config?: Json | null
          cpu_usage?: number | null
          created_at?: string
          disk_usage?: number | null
          events_collected?: number | null
          hostname: string
          id?: string
          installed_at?: string | null
          ip_address?: string | null
          last_event_at?: string | null
          last_heartbeat_at?: string | null
          location?: Json | null
          memory_usage?: number | null
          network_bytes_in?: number | null
          network_bytes_out?: number | null
          organization_id?: string | null
          os_type?: string | null
          os_version?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          agent_type?: string
          agent_version?: string | null
          alerts_generated?: number | null
          config?: Json | null
          cpu_usage?: number | null
          created_at?: string
          disk_usage?: number | null
          events_collected?: number | null
          hostname?: string
          id?: string
          installed_at?: string | null
          ip_address?: string | null
          last_event_at?: string | null
          last_heartbeat_at?: string | null
          location?: Json | null
          memory_usage?: number | null
          network_bytes_in?: number | null
          network_bytes_out?: number | null
          organization_id?: string | null
          os_type?: string | null
          os_version?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "siem_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      siem_correlation_rules: {
        Row: {
          actions: Json | null
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean | null
          last_triggered_at: string | null
          organization_id: string | null
          rule_name: string
          severity: string | null
          times_triggered: number | null
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_triggered_at?: string | null
          organization_id?: string | null
          rule_name: string
          severity?: string | null
          times_triggered?: number | null
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_triggered_at?: string | null
          organization_id?: string | null
          rule_name?: string
          severity?: string | null
          times_triggered?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "siem_correlation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      siem_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          agent_id: string | null
          category: string | null
          correlation_id: string | null
          created_at: string
          destination_ip: string | null
          destination_port: number | null
          event_type: string
          file_path: string | null
          hash: string | null
          id: string
          is_acknowledged: boolean | null
          is_alert: boolean | null
          message: string
          mitre_tactic: string | null
          mitre_technique: string | null
          organization_id: string | null
          parsed_data: Json | null
          process_name: string | null
          protocol: string | null
          raw_log: string | null
          severity: string
          source: string
          source_ip: string | null
          source_port: number | null
          timestamp: string
          user_name: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          agent_id?: string | null
          category?: string | null
          correlation_id?: string | null
          created_at?: string
          destination_ip?: string | null
          destination_port?: number | null
          event_type: string
          file_path?: string | null
          hash?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_alert?: boolean | null
          message: string
          mitre_tactic?: string | null
          mitre_technique?: string | null
          organization_id?: string | null
          parsed_data?: Json | null
          process_name?: string | null
          protocol?: string | null
          raw_log?: string | null
          severity?: string
          source: string
          source_ip?: string | null
          source_port?: number | null
          timestamp?: string
          user_name?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          agent_id?: string | null
          category?: string | null
          correlation_id?: string | null
          created_at?: string
          destination_ip?: string | null
          destination_port?: number | null
          event_type?: string
          file_path?: string | null
          hash?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_alert?: boolean | null
          message?: string
          mitre_tactic?: string | null
          mitre_technique?: string | null
          organization_id?: string | null
          parsed_data?: Json | null
          process_name?: string | null
          protocol?: string | null
          raw_log?: string | null
          severity?: string
          source?: string
          source_ip?: string | null
          source_port?: number | null
          timestamp?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "siem_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "siem_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siem_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_vendors: {
        Row: {
          auto_isolate_on_breach: boolean | null
          created_at: string
          id: string
          integration_status: string | null
          last_breach_date: string | null
          organization_id: string | null
          risk_score: number | null
          updated_at: string
          vendor_name: string
          vendor_type: string | null
          vulnerabilities: Json | null
        }
        Insert: {
          auto_isolate_on_breach?: boolean | null
          created_at?: string
          id?: string
          integration_status?: string | null
          last_breach_date?: string | null
          organization_id?: string | null
          risk_score?: number | null
          updated_at?: string
          vendor_name: string
          vendor_type?: string | null
          vulnerabilities?: Json | null
        }
        Update: {
          auto_isolate_on_breach?: boolean | null
          created_at?: string
          id?: string
          integration_status?: string | null
          last_breach_date?: string | null
          organization_id?: string | null
          risk_score?: number | null
          updated_at?: string
          vendor_name?: string
          vendor_type?: string | null
          vulnerabilities?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_enrichment: {
        Row: {
          created_at: string
          enriched_at: string
          enriched_by: string | null
          enrichment_data: Json
          geolocation: Json | null
          id: string
          related_campaigns: string[] | null
          reputation_score: number | null
          source: string
          threat_actors: string[] | null
          threat_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enriched_at?: string
          enriched_by?: string | null
          enrichment_data?: Json
          geolocation?: Json | null
          id?: string
          related_campaigns?: string[] | null
          reputation_score?: number | null
          source: string
          threat_actors?: string[] | null
          threat_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enriched_at?: string
          enriched_by?: string | null
          enrichment_data?: Json
          geolocation?: Json | null
          id?: string
          related_campaigns?: string[] | null
          reputation_score?: number | null
          source?: string
          threat_actors?: string[] | null
          threat_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "threat_enrichment_threat_id_fkey"
            columns: ["threat_id"]
            isOneToOne: false
            referencedRelation: "threat_intelligence"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_intelligence: {
        Row: {
          confidence_level: number | null
          created_at: string
          description: string | null
          first_seen: string
          id: string
          indicator_type: string
          indicator_value: string
          is_active: boolean
          last_seen: string
          organization_id: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          source: string
          threat_type: string
          updated_at: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          first_seen?: string
          id?: string
          indicator_type: string
          indicator_value: string
          is_active?: boolean
          last_seen?: string
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          source: string
          threat_type: string
          updated_at?: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          first_seen?: string
          id?: string
          indicator_type?: string
          indicator_value?: string
          is_active?: boolean
          last_seen?: string
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          source?: string
          threat_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "threat_intelligence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_results: {
        Row: {
          campaign_id: string
          clicked_link: boolean | null
          completion_time: number | null
          created_at: string
          entered_credentials: boolean | null
          feedback_provided: string | null
          id: string
          reported_phishing: boolean | null
          score: number | null
          timestamp: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          clicked_link?: boolean | null
          completion_time?: number | null
          created_at?: string
          entered_credentials?: boolean | null
          feedback_provided?: string | null
          id?: string
          reported_phishing?: boolean | null
          score?: number | null
          timestamp?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          clicked_link?: boolean | null
          completion_time?: number | null
          created_at?: string
          entered_credentials?: boolean | null
          feedback_provided?: string | null
          id?: string
          reported_phishing?: boolean | null
          score?: number | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "phishing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_behaviors: {
        Row: {
          activity_details: Json | null
          activity_type: string
          anomaly_score: number | null
          created_at: string
          device_info: Json | null
          id: string
          location_data: Json | null
          risk_indicators: Json | null
          session_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          anomaly_score?: number | null
          created_at?: string
          device_info?: Json | null
          id?: string
          location_data?: Json | null
          risk_indicators?: Json | null
          session_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          anomaly_score?: number | null
          created_at?: string
          device_info?: Json | null
          id?: string
          location_data?: Json | null
          risk_indicators?: Json | null
          session_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_behaviors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      zero_trust_access: {
        Row: {
          access_level: string
          actual_usage_frequency: number | null
          created_at: string
          id: string
          is_least_privilege: boolean | null
          last_accessed_at: string | null
          recommendations: Json | null
          resource_id: string
          resource_type: string
          risk_score: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_level: string
          actual_usage_frequency?: number | null
          created_at?: string
          id?: string
          is_least_privilege?: boolean | null
          last_accessed_at?: string | null
          recommendations?: Json | null
          resource_id: string
          resource_type: string
          risk_score?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_level?: string
          actual_usage_frequency?: number | null
          created_at?: string
          id?: string
          is_least_privilege?: boolean | null
          last_accessed_at?: string | null
          recommendations?: Json | null
          resource_id?: string
          resource_type?: string
          risk_score?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zero_trust_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_priority: "info" | "low" | "medium" | "high" | "critical"
      campaign_status: "draft" | "active" | "completed" | "paused"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status:
        | "open"
        | "investigating"
        | "contained"
        | "resolved"
        | "closed"
      incident_type:
        | "phishing_attempt"
        | "malware_detection"
        | "unauthorized_access"
        | "data_exfiltration"
        | "insider_threat"
        | "privilege_escalation"
        | "anomalous_behavior"
        | "policy_violation"
        | "compliance_breach"
      permission_type:
        | "read_users"
        | "write_users"
        | "delete_users"
        | "read_threats"
        | "write_threats"
        | "manage_threats"
        | "read_analytics"
        | "advanced_analytics"
        | "executive_dashboard"
        | "manage_training"
        | "conduct_simulations"
        | "system_admin"
        | "compliance_officer"
        | "security_analyst"
      user_role: "admin" | "security_analyst" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_priority: ["info", "low", "medium", "high", "critical"],
      campaign_status: ["draft", "active", "completed", "paused"],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: [
        "open",
        "investigating",
        "contained",
        "resolved",
        "closed",
      ],
      incident_type: [
        "phishing_attempt",
        "malware_detection",
        "unauthorized_access",
        "data_exfiltration",
        "insider_threat",
        "privilege_escalation",
        "anomalous_behavior",
        "policy_violation",
        "compliance_breach",
      ],
      permission_type: [
        "read_users",
        "write_users",
        "delete_users",
        "read_threats",
        "write_threats",
        "manage_threats",
        "read_analytics",
        "advanced_analytics",
        "executive_dashboard",
        "manage_training",
        "conduct_simulations",
        "system_admin",
        "compliance_officer",
        "security_analyst",
      ],
      user_role: ["admin", "security_analyst", "employee"],
    },
  },
} as const
