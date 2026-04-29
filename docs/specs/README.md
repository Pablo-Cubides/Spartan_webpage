# SSD Process

This repository uses a spec-driven workflow for product, design, content, and engineering changes.

## Required Artifacts
For each feature:
- `spec.md` — what and why
- `plan.md` — technical approach
- `tasks.md` — execution order
- `contracts/` or `contracts.md` — APIs, schemas, and events
- `test-scenarios.md` — acceptance examples
- `rollout.md` — release and rollback notes when needed

## Required Flow
1. Define the feature spec.
2. Review design impact.
3. Write the technical plan.
4. Break it into tasks.
5. Implement with tests.
6. Run the QA gate.
7. Update the living documentation.

## Naming
- Use numbered folders: `001-feature-slug`
- Keep feature slugs lowercase and kebab-case

## Gates
- No merge without a spec
- No merge without validation
- No merge without doc updates when behavior changes
