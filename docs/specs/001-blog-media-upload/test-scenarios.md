# Test Scenarios — Blog Media Upload

Test file: `frontend/tests/` *(integration tests pending — covered manually via admin panel)*
API route: `frontend/src/app/api/admin/blog/media/route.ts`

---

## Scenario 1 — Happy path: valid WEBP upload

**Given** an authenticated admin user  
**When** they POST a valid WEBP file (< 10 MB) to `/api/admin/blog/media`  
**Then** the response is `200` with `{ url: "https://res.cloudinary.com/...", storageId: "..." }`  
**And** the returned URL is a valid Cloudinary canonical URL  

Reference: spec acceptance criteria §1, §2  

---

## Scenario 2 — Invalid file type

**Given** an authenticated admin user  
**When** they POST a PDF file to `/api/admin/blog/media`  
**Then** the response is `422` with `{ error: "invalid_file_type" }`  
**And** no file is stored  

Reference: spec acceptance criteria §3 — `frontend/src/lib/asesor-estilo/validation/image.ts`

---

## Scenario 3 — File size exceeded

**Given** an authenticated admin user  
**When** they POST an image larger than 10 MB  
**Then** the response is `422` with `{ error: "file_too_large" }`  
**And** no file is stored  

Reference: spec acceptance criteria §4

---

## Scenario 4 — End-to-end: upload then publish article

**Given** an admin uploads a valid cover image and receives a canonical URL  
**When** they save a blog post using that URL in the `cover_image` field  
**Then** the post is created with `is_published: false` and the cover image is accessible  
**And** publishing the post makes it visible in `GET /api/blog`  

Reference: spec acceptance criteria §5 — `frontend/src/app/api/admin/blog/route.ts`

---

## Scenario 5 — Cloudinary unavailable (fallback)

**Given** Cloudinary credentials are not configured  
**When** an admin uploads a valid image  
**Then** the file is stored in local fallback storage  
**And** the response still returns a canonical URL  

Reference: spec non-functional §3 — `frontend/src/lib/storage.ts`

---

## Scenario 6 — Unauthenticated request

**Given** a request without a valid admin token  
**When** they POST to `/api/admin/blog/media`  
**Then** the response is `401` with `{ error: "unauthorized" }`  

Reference: `frontend/src/middleware.ts` + `frontend/src/lib/server/auth.ts`
