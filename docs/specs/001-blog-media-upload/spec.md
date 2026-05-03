---
version: "1.1"
status: active
owner: engineering
last_changed: "2026-04-29"
---

# Blog Media Upload

## Problem
Article authors need a repeatable way to upload cover images without leaving the blog editor or manually pasting unstable image URLs.

## Goal
Provide a secure admin-only upload flow that returns a canonical image URL for blog cover images.

## Scope
### In
- Uploading JPEG, PNG, and WEBP images
- Admin-only access
- Returning a canonical URL for the article form
- Local fallback when Cloudinary is unavailable

### Out
- Full media library management
- Image cropping/editing
- Bulk uploads

## Acceptance Criteria
- An admin can select a file and upload it from the blog editor. {@test: frontend/tests/production-checklist.ts}
- The app returns a canonical URL and a storage identifier. {@test: frontend/tests/production-checklist.ts}
- Invalid file types are rejected. {@test: frontend/tests/production-checklist.ts}
- Files larger than 10 MB are rejected. {@test: frontend/tests/production-checklist.ts}
- The article form can reuse the uploaded URL immediately. {@test: frontend/tests/production-checklist.ts}

## Implementation

| Spec requirement | Code location |
|-----------------|---------------|
| Upload endpoint | `frontend/src/app/api/admin/blog/media/route.ts` |
| Blog editor integration | `frontend/src/app/admin/dashboard/blog/editor.tsx` |
| Blog API contract | `docs/specs/api-contracts/blog-media.md` |

## Test Scenarios

See `docs/specs/001-blog-media-upload/test-scenarios.md`.

## Examples
- **Happy path**: admin uploads a WEBP cover image and the form receives a canonical URL.
- **Validation error**: admin uploads a PDF and receives a validation error.
- **Size error**: admin uploads a 15 MB image and the request is rejected.

## Constraints
- Must preserve existing article publishing flow.
- Must not expose secrets or raw upload credentials in logs or responses.
- Must remain compatible with Cloudinary and local fallback storage.

## Non-Functional Requirements
- Performance: response < 500ms at P95 for image processing.
- Availability: graceful degradation if Cloudinary is unavailable.

## Definition of Done

- [ ] Upload endpoint returns canonical URL and storage identifier
- [ ] Invalid file types (non-image) rejected with 400
- [ ] Files > 10 MB rejected with 413
- [ ] No raw credentials or secrets returned in API response
- [ ] Compatible with existing blog publish flow
- [ ] Tests passing for happy path and validation errors
