# AI Interaction Log

## Prompt 1 — Initial Architecture
**Prompt**: "Design the data model for a QR-based loyalty rewards system where customers scan codes to earn points."
**AI Response**: Suggested a good base schema but missed the `QrBatch` concept — it modelled each QR code independently with no batch grouping.
**Problem Noticed**: Without batches, the owner can't deactivate a group of codes at once.
**Fix**: Added the `QrBatch` model with an `isActive` flag, linking QrCode → QrBatch → Product.

## Prompt 2 — PDF Layout
**Prompt**: "Generate a PDF with 20 QR codes per page in a 5×4 grid using pdf-lib."
**AI Response**: Generated code using `PDFDocument.create()` and `drawImage()` correctly, but calculated cell dimensions wrong — it divided by 4 columns and 5 rows (inverted).
**Problem Noticed**: Running the code produced portrait cells in landscape orientation.
**Fix**: Corrected to 5 columns × 4 rows with cell width = (pageWidth - 20) / 5.

## Prompt 3 — NextAuth with Two Providers
**Prompt**: "Set up NextAuth with Google for customers and email/password for admin."
**AI Response**: Suggested using `PrismaAdapter` for both providers, but Credentials provider is not compatible with database sessions in NextAuth — it requires JWT strategy.
**Problem Noticed**: The app crashed on admin login with "Cannot use Credentials provider with database sessions."
**Fix**: Switched to `strategy: "jwt"` in the session config and manually handled session role via JWT callbacks.

## Prompt 4 — Unique Code Generation
**Prompt**: "Generate unique 15-character alphanumeric codes and check for DB collisions."
**AI Response**: Wrote a simple random generator but used Math.random() without collision checking — in a large batch, duplicates were possible.
**Problem Noticed**: No uniqueness guarantee for large batches.
**Fix**: Added a while-loop that checks the generated code against a Set of existing codes before adding it to the batch.

## Prompt 5 — Admin Route Protection
**Prompt**: "Protect all /admin/* routes in Next.js middleware."
**AI Response**: Used `withAuth` from next-auth/middleware correctly, but forgot to also protect the `/api/admin/*` API routes.
**Problem Noticed**: Admin API endpoints were accessible without authentication via direct URL calls.
**Fix**: Added role check at the top of every admin API route handler using `getServerSession(authOptions)`.
