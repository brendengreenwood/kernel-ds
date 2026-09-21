# Prototype promotion acceptances

This directory stores committed, tuple-specific acceptance artifacts used by `ds:prototype` when a validated concern is recorded as promoted.

Accepted artifact types are `conversation-record`, `decision-record`, and normalized offline `pr-review-snapshot`. Each artifact must identify the initiative, concern, scope key, canonical target, exact approval, and immutable implementation evidence required by the prototype registry contract. Generic approval or an actor name alone is not acceptance.

Do not add sample approvals. Create an artifact only after the user explicitly accepts the exact promotion tuple, then commit it before recording the `validated → promoted` transition.
