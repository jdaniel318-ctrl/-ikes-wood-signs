# Keelmark 8.8.20.35 — current architecture

A static frontend recheck of Chartwright .34, preserving the SureFoot owner proof repair and Workhorse decks. Existing executable logic is unchanged apart from release labels and the link to a new static build brief. Authentication, commissioning/no-retry logic, saved identifiers, pricing behavior, sign geometry and storage are not migrated.

The new HouseHull plan and readiness matrix are specification documents. The package verifier is a local, read-only Python developer tool; it is not loaded by the website. The new build brief has no JavaScript/forms and cannot call Fleet Core. Historical .34 plan files remain history. HouseHull is the approved name; Iron Square requires a separate naming decision.

Owner Orders/Pricing remain browser-local. Existing site security and production-readiness holds are not waived. Exact project/role guards remain necessary on the server regardless of frontend tests.
