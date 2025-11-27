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
