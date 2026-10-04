# 8.8.20.10 — HomeWake

- Preserves focused same-tab voyage authorization from PassageLine.
- After refresh, Engine PIN remains required.
- After successful Engine authentication, Black Flag queries Fleet Core for the authenticated officer's active commissioning voyage.
- If found, the exact server voyage, safe stage, Project ID context and draft are restored automatically.
- Recovery is visibly identified inside commissioning; no duplicate voyage is created.
- If no server voyage exists, normal Engine Room behavior is unchanged.
- SERVER SAFE still requires server save plus same-voyage readback.
