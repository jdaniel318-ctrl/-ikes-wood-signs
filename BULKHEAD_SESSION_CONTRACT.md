# Bulkhead Session Contract — 7.9.3

1. Owner/Partner authentication is project-scoped and never requires or inherits Black Flag Engine credentials.
2. Owner login -> Owner Control Center must render immediately without browser refresh.
3. Refresh on #owner-portal restores the authenticated owner portal when the owner session is valid.
4. Refresh on #owner-login restores that project owner login, never Engine Access.
5. Owner logout returns to the same project's owner login.
6. Captain/Engine session state is independent and cannot substitute for owner authority.
7. Fleet Dock and Advanced Project Command derive vessel identity from the same canonical registry.
8. Forced duplicate identities are reconciled at registry source, not hidden in UI.
