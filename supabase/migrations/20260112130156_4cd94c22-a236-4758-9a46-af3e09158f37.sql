-- Clear all dummy data while preserving structure and user accounts
-- Keep profiles and organizations (user accounts)

-- Clear security data
DELETE FROM security_alerts;
DELETE FROM security_incidents;
DELETE FROM threat_intelligence;
DELETE FROM threat_enrichment;

-- Clear SIEM data
DELETE FROM siem_events;
DELETE FROM siem_agents;
DELETE FROM siem_agent_groups;
DELETE FROM siem_correlation_rules;

-- Clear IOC and scan data
DELETE FROM ioc_scan_history;
DELETE FROM ioc_watchlist;
DELETE FROM cyber_arsenal_scans;

-- Clear deception data
DELETE FROM deception_telemetry;
DELETE FROM honeypots;

-- Clear defense data
DELETE FROM defense_actions;
DELETE FROM defense_learning_events;
DELETE FROM adaptive_defense_rules;
DELETE FROM learned_attack_patterns;

-- Clear other security data
DELETE FROM dark_web_alerts;
DELETE FROM digital_twin_simulations;
DELETE FROM red_team_tests;
DELETE FROM supply_chain_vendors;
DELETE FROM zero_trust_access;
DELETE FROM predictive_risk_scores;
DELETE FROM cognitive_profiles;
DELETE FROM risk_scores;

-- Clear training data
DELETE FROM training_results;
DELETE FROM phishing_campaigns;

-- Clear playbook data
DELETE FROM playbook_executions;
DELETE FROM security_playbooks;

-- Clear user behavior (keep profiles)
DELETE FROM user_behaviors;