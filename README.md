# Workshop Engine v2.9.76 — Modern Ship Engine Room

Built from v2.9.75 after approval of the modern ship Engine Room benchmark.

## Engine Room redesign
Business Mode now uses a modern vessel operations/control-room visual system:
- no left navigation sidebar;
- no pirate graphics in Business Mode;
- Configure Engine is a primary control in the top command header;
- Captain's Quarters is the only themed/private-command access in the Business Mode header;
- System Operations and Project Command remain visible on the main deck;
- existing project Control Center functions remain intact.

## Live top performance graphs
Four top telemetry cards are now tied to Engine data:
- Revenue · 30 days — actual recorded order values by day.
- Profit · 30 days — calculated from recorded revenue and the optional Engine cost model.
- Engine Usage — browser storage estimate plus locally sampled usage history.
- Cost · 30 days — calculated from the optional cost model.

No fake performance numbers are inserted.

### Engine cost model
Configure Engine → Engine Economics can record:
- fixed 30-day operating cost;
- cost per order;
- variable cost as a percentage of revenue.

Until a cost model is configured, Cost and Profit explicitly remain unconfigured rather than inventing numbers.

## Configure Engine
Existing Engine Settings, Company Registry, Protected Controls and Operations Monitor are preserved inside a configuration dock opened from the top of the Engine Room.

## Asset added
`assets/engine_room_modern_benchmark_v2976.png`

This is the Captain-approved visual benchmark and is also used as a dark cropped hero reference in the modern Engine header.

Existing assets were not removed or renamed.
