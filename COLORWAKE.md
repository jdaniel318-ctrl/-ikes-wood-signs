> Historical 0.4.0 notes. Openpaper 0.5.0 updates drawing controls, paper dimensions and capacity; CHANGELOG.md and README.md take precedence. Current bounds: 12 pictures, 2,000 strokes and 50,000 sampled points per picture.

# Colorwake 0.4.0

This release extends Wonderwake03. Existing IDs, IndexedDB database, profile schema and export envelope remain in place. A bounded optional gallery field is included only for learners who have saved paintings, preserving the canonical form of older profile exports. Each picture stores a title, timestamp, and validated normalized strokes: 12 pictures, 200 strokes and 1,600 points per picture. Drawing colors, brush sizes and coordinates are checked on every profile save or import.

Early math picture answers count deliberately placed dots; arbitrary handwriting is never recognized. Spelling offers a clue, freehand paper, reveal, and an explicit self-check button. A completed self-check records guided practice with no independent evidence. Other math offers paper as scratch work while the existing answers remain authoritative. Learners can always use normal answers instead.

Gallery pictures remain within their learner's profile and progress export. Downloads produce local PNGs. Painting never accesses the camera or microphone and adds no networking. Unsaved draft paper is temporary. A full gallery refuses new pictures until the user explicitly removes one; it never silently replaces an older picture. Local learner profiles remain conveniences on a shared device, not authenticated accounts.

The drawing module reuses the existing single-pointer/Pencil guard. After a pen stroke, touch is ignored until Enable finger drawing is pressed. This behavior has synthetic pointer tests; physical Pencil and Safari acceptance still requires device testing.

Mission rendering uses a time parameter for water/cloud motion, character bobbing, floating stars and completion sparkles. Motion settings and the system reduced-motion preference disable the added animation. Leaving an activity cancels its animation and drawing handlers.

An application rollback ZIP is bundled under recovery. Real learner records are never included in this package. Export each learner's progress before uploading or rolling back. Old 0.3 builds cannot retain new gallery fields.
