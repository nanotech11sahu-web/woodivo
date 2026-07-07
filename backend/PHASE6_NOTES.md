# Phase 6 — Enquiry System (the revenue-critical one)

Builds on Phase 5 (Media + Products). This is the "Enquire Now / Get Quote"
flow the master prompt calls out as available from every page — public
submission, saved to Mongo, admin email notification, thank-you response.

## 1. Mail module — real send logic

Was previously just a raw nodemailer transporter provider with nothing built
on top of it. Added:

- `mail.service.ts` — `sendEnquiryNotification()`. Deliberately
  **fire-and-forget from the caller's side**: if SMTP is slow, misconfigured,
  or down, the enquiry is already saved before the email is attempted, and a
  failure is logged, not thrown. A broken mailbox must never mean a lost
  lead.
- `templates/enquiry-notification.template.ts` — plain HTML builder (no
  templating engine dependency), with a small `escapeHtml()` guard since the
  enquiry fields (name, message, city) are unauthenticated public input going
  straight into an email body.
- If `ADMIN_NOTIFICATION_EMAIL` isn't set, it logs a warning and skips rather
  than throwing — keeps local dev usable without full SMTP creds configured.

## 2. Enquiries module

- **Public** (`enquiries.controller.ts`, `@Public()`):
  `POST /enquiries` — `fullName`, `mobileNumber` (validated as 10-15 digit
  phone, optional `+`), optional `city`, `interestedCategory` (**category
  slug**, resolved server-side — matches how the public Categories API
  identifies things), optional `message`, optional `source` enum
  (homepage/product/category/contact/floating_cta — matches the schema's
  existing `EnquirySource`). Returns a minimal `{ id, fullName, submittedAt }`
  — the public form doesn't need the full CRM record back.
  - An unknown or inactive category slug does **not** fail the submission —
    the lead is still captured, just without the category link. A malformed
    dropdown value shouldn't cost a sale.
- **Admin/CRM** (`enquiries.admin.controller.ts`, `/admin/enquiries`):
  - `GET` — paginated, filterable by `status`, `source`, `category`, and
    free-text `search` across name/mobile/city
  - `GET /stats` — counts by status, for a dashboard widget (declared before
    the `:id` route so it doesn't get swallowed by the param route)
  - `GET /:id`, `PATCH /:id` (status + follow-up `notes`) — open to all CMS
    roles including editor, since triaging enquiries is a routine operational
    task, not a structural change
  - `DELETE /:id` — restricted to admin/super_admin

**Module wiring:** same pattern as Products — `Category` schema registered
directly via `forFeature` rather than importing `CategoriesModule`, to avoid
pulling in Categories' own `ProductsModule` dependency chain unnecessarily.

## Verified

- `npx tsc --noEmit` — clean
- `npm run build` — clean
- `npx eslint` on all new files — clean. (A full-repo lint sweep shows ~50
  pre-existing prettier/`require-await` issues in files from Phases 1-2 that
  were never touched — not introduced here. Worth a cleanup pass with
  `npm run lint` whenever convenient, but out of scope for this phase.)
- **Not verified in-sandbox:** live DB boot or an actual SMTP send — no
  `mongod` or outbound SMTP access in this environment. Recommend testing
  `POST /enquiries` end-to-end against real `MONGODB_URI` + SMTP creds before
  relying on the notification path in production.

## Next (Phase 7 candidate)

Content modules — Blogs, Projects, Gallery, Testimonials, FAQs, Banners, and
Website Settings all currently have schemas but zero services/controllers,
same as Categories/Products did before Phase 4. They're lower-stakes than
Products/Enquiries (no referential-integrity concerns, no auth-critical
paths) but there are six of them, so worth doing as one focused pass reusing
the same CRUD skeleton — plus, at that point, the Health/Dashboard module can
finally aggregate real counts instead of stubs.
