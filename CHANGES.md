# What changed

## Bugs fixed

| Where | Problem | Fix |
|---|---|---|
| Settings page | Never loaded saved settings, used camelCase names while the API uses snake_case, and `settings.id` was undefined, so Save sent `PUT /settings/undefined` and failed. "Backend: Connected" was fixed text. | Loads on mount, matches the API field names, status comes from a new `/health` endpoint. |
| Dashboard | Showed 4 hard-coded sample work orders until you opened the Work Orders page once. | Work orders load from the API at login (`WorkOrderContext`). |
| Reports > PDF | Always exported a hard-coded 3-row table. | Exports the filtered report rows; Excel export gets proper column names. |
| Reports table | Record id was built from the *product* id, so two runs of one product shared an id (duplicate React keys). | Id is based on the production record. |
| Monthly chart | Grouped by month name only (Jul 2025 + Jul 2026 merged), unordered. | Groups by year+month, sorted. |
| Production table | Pagination sat after `return`, so it never rendered: only the first 5 records were reachable. (Your DB has exactly 5 today, so it hasn't bitten yet.) | Pagination restored; progress no longer shows NaN/Infinity for a 0 target and is capped at 100%. |
| Login session | Lost on every refresh; the **password was saved in localStorage**; missing role defaulted to Admin. | Session restored, password never stored, no default role. |
| Routing | Any logged-in role could open any URL (e.g. a Planner at `/users`). | Routes enforce the same roles as the sidebar; unknown URLs redirect. |
| Modals | Add/Edit forms kept the previous record's values when reopened. | Reset on open. |
| API | Update/delete of a missing id returned `null` with HTTP 200. | Proper 404s. |
| Work orders / Production / Inventory | Showed "Product 3" / "PRD003" and could only be searched by id. | API returns `product_name`; tables show it and search by name. Product fields are dropdowns instead of typing an id. |
| Alerts | `alert()` mixed with toasts; generic "Operation Failed". | Toasts everywhere; server messages (e.g. "Order number WO-001 already exists") are shown. |

## Real authentication and roles

- **Server-side sign-in.** `POST /auth/login` (email + password) returns a signed token; every other data endpoint requires it. Previously the passwords were written in the frontend code and the API was completely open.
- **Passwords** are stored as salted scrypt hashes (standard library, no new packages), 8 to 128 characters, never returned by any endpoint and never saved in the browser.
- **Tokens** are standard HS256 JWTs (8 hours by default), verified on every request against the database, so a deactivated user or a changed role takes effect immediately.
- **Brute-force protection:** 5 failed logins per email+IP per 15 minutes, then 429. Unknown email and wrong password give the same error and take similar time.
- **Roles enforced by the API:** reading needs any sign-in; writing products/inventory/work orders needs Admin or Planner; production/issues needs Admin, Planner or Supervisor; users/settings need Admin. Management is read-only. The roles were also inconsistent before (the Users page offered Admin/Planner/Supervisor, the login used "Product Planner"/"Management"); now there is one list, and Management can be assigned.
- **Admin safety:** you cannot delete yourself or remove/deactivate the last Admin who can sign in.
- **Existing database upgraded in place:** a `password_hash` column is added to `users` on start-up (no data lost). On first run one Admin gets a password, printed once (or from `ADMIN_EMAIL`/`ADMIN_PASSWORD`). The other users cannot sign in until an Admin sets a password on the Users page.
- **Frontend:** login checks with the server; the API client sends the token and signs you out when it expires; Users form has a password field; Production/Issues hide add/edit/delete for read-only roles.
- Tests: `test_security.py`, `test_setup.py` (hashing, tokens, throttle, migration, first-run, admin safety) and `test_auth_api.py` (role matrix, lock-outs, "every route is protected").

## UI redesign (modern, light and clean)

- **One design system.** `styles/theme.css` holds the colours, radii, shadows and sizes; `styles/global.css` styles buttons, forms, cards, tables, modals, pagination and badges once, and loads last so it wins over Bootstrap and the old per-page styles. Change a colour in `theme.css` and the whole app follows.
- **App shell.** White sidebar with a brand mark, a soft "signed in as" card and a blue active-item pill; frosted top bar; softer Logout button. On screens under 992px the sidebar collapses to an icon rail.
- **Tables.** Every table had a different header (solid blue on some pages, black on others). They now share one light header, subtle row hover, no zebra stripes, and a card frame; small Edit/Delete buttons are tinted icon buttons. Tables scroll sideways on small screens instead of wrapping.
- **Status badges.** Defined in four places with different colours, now in one place: green = done/active, blue = running, amber = pending/low, red = delayed/open/inactive.
- **Dashboard and Settings.** Calmer summary cards (no hover jump, no black hover shadow) and a neutral Settings card header.
- **Login.** Centered card with brand, a proper form (Enter submits), and one-click demo-account buttons.
- **Typography.** Inter instead of Poppins; the browser tab now says "POTS | Production Order Tracking" instead of "frontend".
- Removed the dark-theme rules (there was no dark mode to trigger them) and fixed the Navbar title style, which targeted `h4` while the markup used `h5`.

## Backend

- Validation: positive prices/quantities, allowed statuses, `due_date >= start_date`, non-blank text, email format.
- Integrity: product must exist for inventory/work orders/production; work order must exist for an issue; unique order number; one inventory record per product; unique user email (409 instead of a 500).
- Deleting a product is blocked while work orders/production records use it (its stock record is removed with it); deleting a work order is blocked while it has issues.
- Response models no longer share the strict input rules, so an old row can never cause a 500 on read.
- DB path no longer depends on the working directory; CORS origins configurable and include `127.0.0.1:5173`; `/health` added.
- Removed dead files (`app.py`, 3 empty modules); `requirements.txt` is UTF-8 now (was UTF-16).

## Frontend

- One axios instance (`services/api.js`, `VITE_API_URL`) instead of 32 hard-coded URLs.
- Removed the duplicate `ProductProvider`, dead add/edit helpers, 3 empty/placeholder files, `console.log`s.
- ESLint (your config): 43 problems (34 errors) -> 25 (17 errors). What remains is the React-hooks "style" rules (fetch-in-effect before declaration, resetting modal state in an effect, contexts exporting hooks); they are not runtime bugs.

## Existing data worth cleaning (not changed)

- Inventory record #2 points at product 2, which no longer exists.
- Issues #1-#3 point at work orders 101-103, which don't exist. The API will now refuse to *edit* them until they're given a real work order.

## Unused files you may want to delete

`frontend/src/components/products/ProductForm.jsx`, `components/settings/*`,
`components/issues/IssueCards.jsx`, `data/products.js`, `data/workOrderStatus.js`.
