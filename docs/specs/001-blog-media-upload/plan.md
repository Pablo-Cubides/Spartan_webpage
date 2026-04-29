# Technical Plan - Blog Media Upload

## Architecture
- Add an admin-only API route for uploads.
- Reuse `frontend/src/lib/storage.ts` as the storage abstraction.
- Update the blog editor to upload and preview a cover image.

## Validation
- Validate file type and size before upload.
- Validate admin authentication server-side.
- Return canonical URL plus storage identifier.

## UX
- Keep URL input as fallback.
- Add file picker and upload action.
- Show preview after upload.

## Rollout
- Ship backend route and editor update together.
- Keep the existing URL field as a fallback path.
