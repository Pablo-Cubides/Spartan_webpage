# Migration: `<timestamp>_<name>`

**File:** `frontend/prisma/migrations/<timestamp>_<name>/migration.sql`
**Date:** YYYY-MM-DD
**Author:** <name>
**Status:** `draft` | `applied (staging)` | `applied (production)`

## Motivation

<!-- Why is this migration needed? Link to the feature spec or bug report. -->

Feature spec: [docs/specs/<feature>/spec.md](../specs/<feature>/spec.md)

## Tables Created

| Table | Purpose |
|-------|---------|
| `TableName` | What it stores and why |

## Tables Modified

| Table | Column | Change | Reason |
|-------|--------|--------|--------|
| `TableName` | `column_name` | ADD / DROP / ALTER | Why this change |

## Rollback Risk

`LOW` | `MEDIUM` | `HIGH`

Explain the rollback risk:
- LOW: additive only (new nullable columns, new tables), safe to revert
- MEDIUM: new NOT NULL columns with defaults, data may exist
- HIGH: destructive (DROP TABLE, DROP COLUMN, NOT NULL without default)

## Rollback Plan

<!-- Only required for MEDIUM and HIGH risk migrations -->

```sql
-- Manual rollback steps if prisma migrate resolve --rolled-back doesn't suffice
```

Runbook: `docs/runbooks/<feature>-rollback.md` (create if HIGH risk)

## Verification

```sql
-- Queries to verify the migration applied correctly
SELECT COUNT(*) FROM "NewTable"; -- should be 0 initially
```

## Checklist

- [ ] Migration tested locally with `npx prisma migrate dev`
- [ ] Schema validates with `npx prisma validate`
- [ ] Prisma Client generated and TypeScript compiles
- [ ] Entry added to `docs/specs/database-migrations.md`
- [ ] Runbook created in `docs/runbooks/` (if HIGH risk)
