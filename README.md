# Jai Veera Hanuman — Updated Website & Inventory Dashboard

This update preserves the existing vanilla HTML/CSS/JavaScript + Node.js/Express website, product imagery, cart, seven selectable themes, admin login, and inventory dashboard. It adds a customer checkout form, server-validated WhatsApp order enquiries, and admin enquiry tracking.

## Features implemented

- Public catalogue with stock-status badges and wholesale/retail price labels.
- Product-specific WhatsApp enquiry buttons (kept as enquiry actions even when stock is out).
- Admin login at `/admin/login`; dashboard at `/admin/dashboard`.
- Server-protected dashboard route and admin API endpoints.
- Dashboard cards for product/stock counts and recorded visits.
- Searchable/filterable inventory table with edit forms for quantity, unit, threshold, status, wholesale price, tin weight and retail price.
- Calculated wholesale price per kg in the edit form.
- Visitor line chart and stock distribution chart.
- Input validation, basic login attempt throttling, HttpOnly/SameSite cookies and security headers.
- Product changes and analytics persist to a JSON data store, not browser-only state.
- Existing prices and inventory are deliberately **unset**; no business prices or quantities have been invented.

## Run locally

Requires Node.js 20–22.

```bash
npm install
```

On macOS/Linux:
```bash
export ADMIN_USERNAME="your-admin-name"
export ADMIN_PASSWORD="use-a-long-unique-password"
export SESSION_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
export DATA_DIR="./data"
npm start
```

On PowerShell:
```powershell
$env:ADMIN_USERNAME = "your-admin-name"
$env:ADMIN_PASSWORD = "use-a-long-unique-password"
$env:SESSION_SECRET = node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
$env:DATA_DIR = "./data"
npm start
```

Open `http://localhost:3000`. Health check: `http://localhost:3000/api/health`.

Do not deploy the example credentials above. Configure your own unique secrets.

## Azure App Service deployment

1. Use a Linux Azure App Service with Node.js 20 or 22, or verify compatibility with the current App Service runtime.
2. In **App Service → Configuration → Application settings**, set:
   - `ADMIN_USERNAME`: your chosen administrator username.
   - `ADMIN_PASSWORD`: a long, unique password stored as an App Setting (not in source control).
   - `SESSION_SECRET`: a randomly generated secret of at least 32 random bytes.
   - `DATA_DIR`: `/home/data` for a Linux App Service with persistent `/home` storage enabled.
   - `WHATSAPP_BUSINESS_NUMBER`: business WhatsApp number in international digits-only format, e.g. `918553430387`.
   - `NODE_ENV`: `production`.
3. Save settings and restart the App Service.
4. ZIP the *contents* of this project so `package.json`, `.deployment`, `src/`, `public/`, and `private/` are at the ZIP root. Do not ZIP the parent folder.
5. Deploy using your existing App Service deployment method.
6. Test `/api/health`, public product cards, `/admin/login`, saving an inventory edit, checkout validation, an order enquiry, the WhatsApp message, admin enquiry visibility, status updates, and reloading the public catalogue.

The `private/admin.html` dashboard file is intentionally outside `public/` and is served only after the server checks the admin session. Do not move it into `public/`.

## Persistence and production notes

**Current implementation:** file-based JSON storage in `DATA_DIR/store.json`. It uses atomic file replacement for individual writes and is suitable for local validation or a small single-instance deployment when the configured directory is persistent.

**Before scaling to multiple instances or relying on this for mission-critical inventory:** migrate the store to a managed database such as Azure Database for PostgreSQL or Azure SQL. A JSON file is not a safe multi-instance database and does not provide database transactions/locking for concurrent writes. Add backups and monitor storage usage.

Visitor analytics counts browser-session visits submitted to the backend. Historical analytics begin only after this version is deployed; the dashboard does not invent past traffic. Visits are recorded by day in UTC. No IP addresses are stored. This is basic first-party analytics, not a bot-filtered analytics service.

The login uses an HttpOnly, SameSite=Strict, signed session cookie with an eight-hour expiry and in-memory IP-based throttling. Use HTTPS in production, configure a strong `SESSION_SECRET`, and review your organization's security requirements before public production use.

## Important product data notes

- Initial stock status is “Not Set”; administrators should enter verified inventory quantities.
- Wholesale price, tin weight, and retail price are editable per product. The initial 20 kg tin weight is a suggested starting value from the requested specification; verify and edit it for each actual product before publishing prices.
- Public prices show “Contact for price” until a price is set.
- Stock status becomes Out of Stock at zero quantity; positive quantity below threshold is Low Stock.
- The initial product list and images were taken from the supplied website.
- The existing GST certificate preview is retained. The original PDF remains in `private-documents/` and is not exposed as a public static file. Confirm that the certificate preview is intended for public display.

## Validation performed

- JavaScript syntax checks passed for the server, public frontend, and admin frontend.
- A live integration test could not be completed in this environment because npm dependency installation timed out; run `npm install` and verify the full flow locally and in Azure before production use.


## Latest update: retail pack pricing, cart and themes

- Admin product table now separates **Retail weight (kg)** and **Retail price (₹)**. Retail price is stored per configured retail pack, using `retailPackWeightKg` and `retailPricePerPack`. Legacy `retailPricePerKg` values are read as a compatibility fallback.
- The public catalogue shows the retail pack weight and pack price. Visitors can select a quantity and add products with confirmed In Stock status and configured retail pricing to the cart.
- The cart shows item quantities, line totals, and an estimated total, then collects customer and delivery details before an order review.
- The backend validates customer data, current product pricing, stock status and quantity; creates a unique enquiry reference; and saves the enquiry before preparing a WhatsApp click-to-chat message.
- The Admin Dashboard includes an Order Enquiries table, customer/address and itemized details, status updates, status history, search/filter, and a WhatsApp contact link.
- Status starts as New Enquiry. Opening WhatsApp is not proof the customer sent the message, and neither enquiry creation nor WhatsApp opening confirms payment or order acceptance.
- Configure `WHATSAPP_BUSINESS_NUMBER` as digits only, including country code. The default matches the business number already shown on the supplied site; change it if needed.
- The Theme selector is restored with Plum & Blush, Orange & Charcoal, Orange & White, Forest & Cream, Pistachio, Burgundy & Gold, and Navy & Copper options. The selected theme is saved in the visitor's browser.
- After deployment, set each product's retail pack weight and retail pack price in the admin dashboard. Products without configured retail pricing or confirmed In Stock status cannot be added to the cart.


## Latest update: customer checkout and order enquiry tracking

- Customers proceed from the cart to a responsive customer details form, then review their delivery information and itemized estimated total before submitting.
- The server generates the order enquiry reference, validates product IDs/quantities/stock/prices against the current store, and saves the enquiry before the browser opens WhatsApp. Browser-supplied prices are not trusted.
- Enquiries are stored in `DATA_DIR/store.json` alongside the existing catalogue and analytics. For a single Linux App Service instance, configure `/home/data` and enable persistent App Service storage. Back up this data.
- **Production scaling note:** JSON-file storage is not a multi-instance database and does not provide database transactions or locking. For multiple instances or mission-critical order/inventory data, migrate to Azure SQL or Azure Database for PostgreSQL before scaling.
- Customer records and status history are visible only through authenticated admin endpoints. Admins can update statuses manually. No payment gateway was added, and the site does not claim to know whether a WhatsApp message was sent.


## Checkout shipping and delivery settings

The customer cart requests a server-calculated quote from `POST /api/order-quote`, and public checkout charge settings are available from `GET /api/shipping-settings`. The admin dashboard exposes authenticated `GET /api/admin/shipping-settings` and `PUT /api/admin/shipping-settings` endpoints. Settings are saved in the existing `store.json` data file. Defaults are shipping disabled, delivery disabled, and optional free shipping threshold enabled only when an administrator turns it on; the default threshold value is ₹1,000.

Shipping and delivery amounts are calculated on the server when an enquiry is quoted and again when it is submitted. Each saved order enquiry retains its own shipping charge, delivery charge, free-shipping flag, product subtotal, and estimated total; future settings changes do not modify older enquiries. Configure `DATA_DIR` to a persistent location in Azure App Service (for example `/home/data`) and enable persistent App Service storage for the data to survive restarts. This JSON-file store is intended for a single app instance; use a database before scaling to multiple instances.


## Latest update: retail/wholesale packs, GST, offers and account recovery

- Product cards no longer display individual enquiry buttons; the existing navigation Enquire link remains.
- Product editors support multiple enabled/disabled retail pack options and wholesale pack options. Each option stores an ID, label, weight in kilograms, price, and enabled flag. Retail and wholesale variants are separate cart lines, so the same product can be added in both modes or in multiple pack sizes.
- `POST /api/order-quote` and `POST /api/order-enquiries` accept `productId`, `variantType` (`retail` or `wholesale`), `variantId`, and quantity. The server resolves current pack prices and stock requirements from stored product data; it does not trust client prices.
- Admin **GST, discounts & offers** manages tax enabled/rate/inclusive-or-exclusive mode, an automatic percentage/fixed discount with minimum subtotal, cap and date range, and offers. Offers are stored persistently in `store.json`; active in-date offers appear in the scrolling banner. Offer discounts are applied to matching products and retail/wholesale types.
- Checkout and saved WhatsApp enquiry snapshots include discount, tax, shipping, delivery and estimated total. This is still an enquiry workflow, not payment or order confirmation.
- Admin **Account & Security** migrates the configured environment username/password into a salted PBKDF2 hash on first successful sign-in, permits username/password updates, and stores a hashed recovery date of birth. Passwords and DOB are not stored as plaintext. Recovery requires both username and the previously configured DOB, and is rate limited. Keep `SESSION_SECRET` strong and persistent in Azure; changing it invalidates existing sessions.
- The new settings are added to the existing JSON store with defaults when absent. Existing products, analytics and enquiries are retained; no store reset or new seed overwrite is performed.

### Updated APIs

- `GET /api/pricing-settings` — public active offer banner data and public tax/discount configuration.
- `GET /api/admin/pricing-settings`, `PUT /api/admin/pricing-settings` — authenticated GST and automatic-discount settings.
- `PUT /api/admin/offers` — authenticated persistent offer list update.
- `PUT /api/admin/account` — authenticated username/password/recovery DOB update; clears the session on success.
- `POST /api/admin/recover` — username + configured recovery DOB + new password; DOB alone is not accepted.

### Deployment and verification notes

1. Back up the existing persistent `DATA_DIR/store.json` before deploying. Deploy the ZIP contents at the app root as usual; keep `DATA_DIR` pointed at persistent storage (for example `/home/data`) and retain the existing `SESSION_SECRET` value.
2. Configure/verify `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and `WHATSAPP_BUSINESS_NUMBER` in App Service settings. After the first successful admin login, set a recovery DOB in Account & Security.
3. Configure and test prices, stock, pack weights, tax and discounts before making offers active. GST behavior is configurable; the business should confirm the correct legal rate and whether displayed prices are tax-inclusive before using it commercially.
4. Validation in this environment included Node syntax checks for the modified server and browser scripts and static checks for removed product enquiry buttons and required API/form hooks. `npm install` timed out in this environment, so a live HTTP/browser integration test could not be completed here. Run `npm install`, `npm start`, and the manual checklist below before production rollout.

### Manual smoke-test checklist

- Set one product to In Stock and configure at least two retail sizes and two wholesale sizes; add the same product in different variants and verify the cart keeps separate lines.
- Verify unavailable/disabled variants cannot be purchased and tampering with price or variant IDs is rejected by the server.
- Test GST disabled, inclusive and exclusive; test fixed and percentage discounts, minimum subtotal, date windows, caps, retail/wholesale applicability, and active/inactive offers.
- Save an enquiry and verify the saved admin detail and WhatsApp message include variant labels, quantity, subtotal, discount, GST, shipping, delivery and estimated total.
- Verify offer banner only appears for active in-date offers and respects reduced-motion preferences.
- Change admin credentials, sign in again, configure DOB recovery, reset password with username + DOB, and verify DOB-only attempts fail. Test rate limiting and HTTPS cookie behavior in Azure.
- Confirm all seven themes, mobile navigation, product selectors, cart drawer, checkout and admin forms at mobile and desktop widths.


## Product card pricing and pack options

The product cards display retail pack prices from each product's enabled `retailPacks` options and can optionally display the first enabled wholesale option. Admins can manage pack options using the structured Retail pack options and Wholesale pack options controls in Edit Product; each option has an ID, label, weight in kilograms, price, and enabled state. Leave a pack price blank only when it is not intended to be purchasable. The selected default retail pack must be an enabled pack with a configured positive price.

Each product also supports `retailDisplayMode` (`all`, `starting`, or `default`), `defaultRetailPackId`, and `showWholesalePrice`. The homepage shows one Add to Cart button per product. Purchase type, pack option, and quantity can be adjusted in the cart. Prices and stock are revalidated by the server when requesting a quote and submitting an enquiry. Example pack prices are not inserted by the application; configure actual business prices in the admin dashboard.


## Latest enhancements

- Shopping cart quantity stepper with accessible plus/minus controls.
- Admin can create, edit, and delete products.
- Product image uploads accept JPG, PNG, and WebP up to 5 MB; uploaded files are stored under `public/uploads/products`.
- Admin can archive order enquiries without removing them from the underlying JSON store.
- Admin can export order records to an Excel workbook with `Orders` and `Order Items` worksheets.
- Excel export requires the `exceljs` dependency. Run `npm install` after updating the project.

### Important hosting note
The current JSON data store and uploaded images require persistent writable storage. Configure `DATA_DIR` to a persistent directory and ensure `public/uploads/products` persists across deployments, or switch image storage to a persistent/object storage service before deploying to a platform with ephemeral filesystems. Back up `store.json` regularly.


## Contact and business settings

After signing in to the Admin Dashboard, open **Contact & Business** to update the WhatsApp number (include the country code), separate call number, email, address, opening hours, business description, and enquiry message templates. Save the form to persist the settings in the existing store file. Public WhatsApp links read the current settings; the `/contact/whatsapp` route also provides a server-side fallback redirect. The order enquiry message template supports `{reference}`, and the product enquiry template supports `{product}`.

The admin settings API is protected by the existing admin session:
- `GET /api/admin/business-settings`
- `PUT /api/admin/business-settings`

The public `/api/config` response includes only public business contact/configuration fields; it does not return admin credentials or session secrets. Back up the configured `DATA_DIR` (including `store.json`) and uploaded product images when deploying. Confirm that the selected host provides persistent storage before using JSON-backed records in production.
