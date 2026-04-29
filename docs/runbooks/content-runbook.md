# Content Runbook

## Create Article
1. Write or update the spec.
2. Draft the article through the `create-article` skill.
3. Validate slug, metadata, and cover image.
4. Save via CMS or markdown source, depending on the editorial decision.
5. Run `npm run qa:content:validate`.

## Publish
1. Verify final preview.
2. Confirm publish date.
3. Check internal links.
4. Confirm image availability.

## Rollback
- Revert the article version
- Clear any invalid cover image
- Re-run validation
