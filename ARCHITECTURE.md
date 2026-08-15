# Dark Sky Architecture — Standing Rules

These rules describe the boundaries that future Black Flag work must preserve unless the Captain explicitly changes course.

## 1. Platform and project identity

Black Flag is the platform identity. Individual businesses remain visually independent inside their project customer and project-admin experiences. Black Flag branding should identify platform-owned transitions and controls without competing with project branding.

Every project shell inherits one small Black Flag return control in the lower-right. That control belongs to the platform, not to project content. It opens the Black Flag Engine authorization gate and must not be replaced by project-specific return implementations or passive “Powered by Black Flag” text.

## 2. Project isolation

Each project has a permanent project identity and namespace. Orders, customers, photos, settings, ledger entries, deployments, owner access, and other project records must remain bound to the owning project. Cross-project reads or writes are denied unless a deliberately shared Black Flag service is designed for that purpose.

Project branding and customer media must never leak between projects.

## 3. Authority boundaries

Customer devices receive customer-session authority only. Project administrators receive project-scoped authority only. Owner access is project scoped. Engine administration is a separate platform authority. Captain's Mode / Captain's Quarters is a separately gated, higher-privilege governance and experimental layer and must not collapse into ordinary super-admin access.

Crossing back toward Black Flag from a project locks Engine authorization and presents the Engine gate again.

## 4. Data and lifecycle

Projects use explicit lifecycle states and retain audit/recovery foundations. Completed operational history should be preserved according to the platform's retention rules rather than silently discarded. Production upgrades must preserve project data across application releases.

## 5. Security boundary

The current static/browser implementation provides client-side structure, policy, scoping, and test workflows. Real external owner/staff production authentication requires server-backed identity, secure sessions, server-side authorization, recovery, and revocation enforcement.

## 6. Development discipline

Prefer shared platform capabilities over hand-coded project exceptions. Avoid implicit project fallbacks when new platform services are introduced. Preserve working IDs and routing contracts during visual-only changes. Validate JavaScript syntax, DOM ID uniqueness, local asset references, service-worker assets, and project boundary controls before release.
