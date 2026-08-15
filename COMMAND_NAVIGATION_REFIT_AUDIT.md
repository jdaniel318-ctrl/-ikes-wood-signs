# v3.8.4 Command Navigation Refit Audit

## Objective
Reduce visual search cost inside Project Control without removing functionality.

## Command map
- Direct: Overview, Orders, Customers
- Operate: Products & Services, Workflow, Deployments
- Insight: Analytics, Financials
- Experience: Marketing & Brand, Customer Experience
- Access: Owner Access, Permissions
- System: Payments, Notifications, Publishing, AI Recognition

## Regression boundary
Presentation and navigation-state synchronization only. Project authorization, immutable identity, data isolation, order ownership, and deployment lifecycle rules are unchanged. The capture-phase mission navigation handler still owns all `data-project-tab` routes.
