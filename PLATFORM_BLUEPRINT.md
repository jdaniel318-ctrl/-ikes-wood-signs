# Dark Sky Platform Blueprint

**Revision:** v3.8.2  
**Purpose:** Canonical architecture for the Black Flag / Dark Sky platform.

## 1. Command hierarchy

### Dark Sky
The complete platform and shared technical foundation.

### Captain's Quarters — control plane
Captain-only governance, fleet intelligence, release authority, security posture, lifecycle control, recovery, and future controlled experimentation.

### Engine — fleet operations plane
Creates, finds, commissions, monitors, and services projects. The Engine operates projects but does not own project-specific business data.

### Project Control Center — business operating plane
The command center for one business. It must provide a fast overview first, then detailed operational menus.

### Deployment — delivery plane
A customer-facing instance of a project: web page, QR flow, kiosk, tablet, event station, embedded experience, or future channel.

## 2. Core objects

### Project
One operating business. Security identity is the immutable `projectId`, never the display name.

Minimum registry fields:
- `projectId`
- display name and normalized display name
- project code / order prefix
- lifecycle state
- template identity/version (future)
- enabled capability set (future)
- owner/access state
- deployments
- created/updated timestamps
- project namespace

Display names are labels and may legitimately repeat. Duplicate display names are an integrity warning, not a security boundary.

### Capability
A reusable platform building block. Planned examples: customer capture, custom text, image upload, dimensions, variants, appointments, inventory, pricing rules, approval, delivery/pickup, fulfillment, payments, notifications, staff access, analytics.

### Template
A tested recipe that assembles and preconfigures capabilities. Existing businesses are proof vessels, not canonical templates.

### Deployment
A separately measurable customer entry point attached to exactly one project.

### Integration
A project-scoped connection to a specialist system such as payment, accounting, fulfillment, shipping, or messaging providers.

## 3. Project lifecycle

Canonical direction:
`draft → configured → owner_invited → owner_active → deployment_ready → testing → live → suspended / relationship_ended → archived`

Operating records should normally be archived or retired, not destructively erased. Destructive "Powder Keg" behavior is reserved for isolated experiments and disposable test data.

## 4. Security doctrine

- Every meaningful project resource must carry explicit `projectId` ownership.
- Missing project identity is an error, never an invitation to infer a default project.
- Project display names are never used as authorization boundaries.
- Project roles, Engine roles, and Captain authority are separate.
- Deployments receive minimum necessary access.
- Sensitive actions should be auditable.
- Cross-project access is default-deny.
- Updates and migrations must preserve project isolation.

## 5. Project Control information architecture

The opening view should answer, without drilling in:
1. What is happening now?
2. What needs attention?
3. How is the business performing?
4. What changed recently?
5. Where should the operator go next?

Planned menus:
- Overview
- Orders
- Customers
- Products & Services
- Workflow
- Deployments
- Analytics
- Financial Overview
- Marketing
- Team & Access
- Integrations
- Settings

## 6. Integration boundary

Dark Sky should orchestrate and understand specialist systems rather than replace them prematurely.

Dark Sky may know payment state, transaction reference, cost, margin, fulfillment status, and customer context. Specialist providers move money, keep formal books, fulfill inventory, ship products, or control machinery.

## 7. Captain's Foundry — future R&D plane

New operating models remain isolated until deliberately promoted:
`idea → prototype → trial → approved capability set → template / separate vessel`

Future-vessel candidates preserved from strategy review include construction scheduling, Bad Camper / brand commerce, marketplace models, advanced production automation, and other specialized operating systems.

## 8. Current proof vessels

- Ike's Wood Signs — custom production
- Mugs After Dark — custom product / personalization
- Becca's Bloom Shop — floral / arrangement workflow

They are test cases for reusable platform behavior and must never leak branding or business assumptions into other projects.

## 9. Immediate build doctrine

1. Canonical project registry and identity
2. Invitation / onboarding reliability
3. Continuous project-isolation security checks
4. Project Control business cockpit
5. Capability model
6. Template model
7. Deployment architecture
8. Reliable analytics + customer intelligence
9. Integration framework
10. Captain's Foundry
11. Versioning / safe migrations
12. Advanced automation


## Stage 2 commissioning doctrine
1. New businesses enter through one Project Commissioning route.
2. A display name never acts as a security identifier.
3. Owner handoff is bound to the commissioned project and intended owner identity.
4. Commissioning produces a private project; publication remains a separate deliberate action.
5. Local invitation/credential behavior is a prototype boundary until server-side identity is introduced.


## Stage 3 hull-integrity doctrine
1. Project data mutations fail closed unless the actor and active project context match.
2. Engine-wide tooling may select a project, but every write is authorized against that selected project ID.
3. Owner writes require an active project-bound owner session and the enabled capability for the module being changed.
4. Deployment identity is sealed to exactly one project and namespace; a boundary mismatch blocks persistence.
5. Deployment state changes follow an explicit transition graph instead of arbitrary string assignment.
6. Critical integrity defects block project collection persistence and create audit evidence.
7. Browser-local enforcement is a development boundary, not a substitute for server-enforced tenant authorization.


## Command & Visibility doctrine
Project Control is the operating cockpit for one business. Its Overview must prefer verified business signals over configuration density. The first screen should show current state, attention items, recent activity, performance, and direct routes to deeper operating modules.

Analytics may only present telemetry that Dark Sky actually records. Missing visitor, conversion, campaign, or engagement telemetry must be labeled as uninstrumented until a real deployment signal pipeline exists.


## Immutable project identity doctrine — v3.8.2

A project is identified by its immutable Dark Sky Project ID, never by its business name. Display names and branding are mutable business data. Internal namespaces are derived from the immutable Project ID. Existing legacy IDs remain valid and permanent; new projects receive opaque `bf-p-*` IDs. Renaming a business must not migrate or re-key orders, customers, deployments, assets, permissions, analytics, or audit history. Public URL slugs, when introduced, are a separate deployment concern and must not become tenant identity.

## Overview command doctrine
Project Control Overview should orient and prioritize, not reproduce the entire navigation tree. Full navigation lives in the command bays; Overview may expose only a small set of high-value Quick Actions.


### Product presentation capabilities
A template may select a preview geometry appropriate to the operating model. Dark Sky must not assume one visualization fits every business. Preview geometry is reusable capability configuration and can evolve independently of project identity.


## Visual Capability Doctrine — v3.8.14
Visual behavior is a reusable Dark Sky primitive, not a property of one template. Projects compose Visual Input → Placement → Transform → Preview → Approval → Output capabilities. Current operating examples are Flat Surface (Ike’s), Cylindrical Wrap (Mugs After Dark), and Card / Message Overlay (Becca’s), but the contract also supports curved, front/back, multi-zone, bounded-area, perspective, freeform, environment, vehicle/equipment, arrangement, before/after, and no-preview models. New ships may reuse this contract without inheriting the Business Command Engine customer shells.
