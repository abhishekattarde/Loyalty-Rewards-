# Assumptions

1. **Points-to-Rupee rate**: 50 points = ₹25 (i.e., 1 point = ₹0.50), as specified by the client.
2. **QR code uniqueness**: Each code is a 15-character alphanumeric string (uppercase A-Z + 0-9), randomly generated and checked against the DB for collisions.
3. **Admin authentication**: A single admin account using email/password stored in environment variables. This was chosen over a database-stored admin to simplify setup and reduce attack surface. The admin cannot self-register.
4. **Logo in QR cell**: A branded text placeholder is used as the logo since the client did not provide a logo image file. The PDF generation code can be updated to embed an actual PNG logo.
5. **Redemption flow**: Customers redeem points directly in the shop. No physical shipment or fulfilment is in scope — the app marks points as redeemed and the owner handles fulfilment manually.
6. **Paper size**: A4 (595 × 842 pt at 72 DPI) in portrait orientation, with 5 columns × 4 rows = 20 QR codes per page.
7. **Greeting message**: Default is "Thanks for your purchase. Earn these points for further shopping." Owner can customise per batch.
8. **Fraud detection**: Deactivating a batch prevents any remaining unclaimed codes in that batch from being scanned. Already-claimed codes are not reversed.
9. **Customer privacy**: When a code is already used, the app tells the scanning customer it has been claimed but does not reveal the claimant's identity.
10. **Product images**: Stored as a URL string. Hosting of images is out of scope; the owner provides an image URL.
11. **No email notifications**: The system does not send emails. Points are visible in the wallet immediately after scanning.
12. **Points expiry**: Points do not expire (not specified by the client).
