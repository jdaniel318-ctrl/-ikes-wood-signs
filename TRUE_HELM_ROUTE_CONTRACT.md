# Ironclad Route Contract — 7.9.9

1. The normal `index.html` route is Engine authority unless an explicit protected surface is requested.
2. Owner/Partner entry uses `owner.html?project=<id>` and resolves to `index.html?surface=owner&project=<id>&view=<login|portal>`.
3. Legacy owner hashes are honored only when armed by a same-session owner navigation; stale hashes never override Engine intent.
4. Client Preview remains an explicit protected invite route.
5. Neutral first paint remains mandatory; project branding cannot paint before authority is resolved.
6. Protected routes fail to explicit recovery; Engine routes fail directly to Engine Access.
7. Owner session and Engine session remain separate namespaces.
