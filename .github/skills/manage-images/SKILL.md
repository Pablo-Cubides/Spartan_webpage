---
name: manage-images
description: "Use when uploading, validating, or optimizing image assets, cover images, Cloudinary, or media URLs."
argument-hint: "Image task or upload request"
user-invocable: true
---

# Manage Images

Use this skill for a repeatable image workflow in Spartan Club.

## When to Use
- Cover image uploads
- Media validation
- Storage selection
- Image URL checks

## Workflow
1. Confirm image type, size, and destination.
2. Upload through the shared media route or storage helper.
3. Validate the resulting canonical URL.
4. Add alt text and accessible usage guidance.
5. Return the final image reference and any warnings.

## Output
- Canonical URL
- Storage identifier
- Validation result
- Alt text recommendation

## References
- [Image standards](./references/image-standards.md)
- [Upload flow](./references/upload-flow.md)
