# Vape Store Connect

A complete, reusable website for an independent vape or smoke shop: a premium public
catalog site with a hidden owner dashboard behind an access code. No online sales, no
payment processing — customers browse the shelves and come to the store.

The code in this repository is the whole system. To launch another shop, deploy this
same repository again and hand it to the new owner; everything shop-specific lives in
the database, not in the code.

---

## What is included

**Public site**

| Page | Route | Notes |
| --- | --- | --- |
| Home | `/` | Hero, promo banner, category rail, featured products, about, location, hours |
| Products | `/products` | Full catalog with search, category filter, product detail view |
| About | `/about` | Store story plus additional story sections |
| FAQ | `/faq` | Accordion of questions and answers |
| Visit | `/store` | Address, map, hours, holiday hours, policies |
| Contact | `/contact` | Message form with spam honeypot |
| Privacy / Terms | `/privacy`, `/terms` | Editable policy text |
| Age gate | first visit | Server-verified 21+ confirmation, remembered per browser session |

**Owner dashboard** — `/admin` (access code, no Base44 login needed)

- **Overview** — catalog counts and unread messages
- **Branding** — business name, tagline, logo, favicon, social links
- **Appearance** — colors, fonts, button style, header/footer style, background
- **Homepage** — hero copy and image, banner, about content, section visibility
- **Products / Categories** — full catalog editing, images, specs, availability, ordering
- **FAQ** — questions, answers, ordering
- **Store info** — address, map query, phone, email, hours, holiday hours, policies
- **Messages** — customer inquiries, read state, and replies
- **Team access** — owner can add team members with their own codes, reset a code, or remove a person
- **Page content** — meta title/description, privacy, terms, compliance text, age gate copy
- **Security** — change your own access code

## How access works

- The first person to visit `/admin` on a fresh deployment **sets the owner code** and
  becomes the owner. This is per deployment, so no shop can ever open another shop's dashboard.
- Codes are stored as salted PBKDF2 hashes. Sessions last 8 hours; 5 wrong attempts lock
  that caller out for 15 minutes.
- The owner can add up to 6 codes. Team members can run the whole site (catalog, content,
  messages) but cannot add, remove or re-code anyone. Removing a person revokes their
  session immediately.
- A lost **owner** code can be reset from the access screen by the Base44 account that owns
  the deployment.

---

## Getting the code onto GitHub

Two supported routes:

1. **GitHub connection (two-way sync)** — in the app editor, open **More actions** in the
   top-right and choose **GitHub connection**. The workspace-level equivalent is
   **Workspace settings → GitHub**, which keeps your apps' code in sync with GitHub and
   shows changes from both sides in both places.
2. **Export project as ZIP** — in the editor's **More actions** menu, choose
   **Export project as ZIP**, then **Download ZIP**. That gives you the raw files to commit
   into any repository. Exporting a ZIP requires a Builder plan or higher.

Because the code holds no shop data, the same repository can be deployed for as many shops
as you like. Each deployment starts with an empty database and an unclaimed `/admin`.

## Running a new shop from this repository

1. Deploy the repository to a new app for that shop.
2. Open `/admin` on the new deployment right away and set the owner access code.
3. In **Branding**, **Appearance** and **Homepage**, set the business name, logo, colors and
   hero. Until you save, the site shows the demo content in `src/lib/siteDefaults.js`.
4. In **Store info**, replace the address, phone, email, hours and policies.
5. In **Categories** then **Products**, add the shop's catalog (images, brands, specs).
6. In **Page content**, write the meta title/description, privacy policy and terms.
7. Delete the demo inquiries in **Messages**, and confirm the age-gate copy.
8. Publish.

### Suggested first-run checklist

- [ ] Owner code set and stored somewhere safe
- [ ] Business name, tagline, logo, favicon
- [ ] Colors and fonts match the shop
- [ ] Address, map, phone, email, hours, holiday hours
- [ ] Categories and products (with images)
- [ ] FAQ, about story, policies, compliance notice
- [ ] Age gate wording and minimum age
- [ ] Meta title and description
- [ ] Test the contact form and reply flow
- [ ] Publish

---

## Working on the code locally

```bash
npm ci
base44 login   # one-time per machine
base44 link    # one-time per clone
base44 dev     # local backend + app together
```

```bash
npm run build    # dist/client (assets) + dist/server (the Worker)
base44 deploy    # or publish from the Base44 editor
```

## Where things live

```
base44/entities/          data schemas: SiteSettings, Product, ProductCategory,
                          FaqItem, ContactMessage, AdminCredential, AdminSession, AdminAttempt
src/lib/siteDefaults.js   demo/default site content used before an owner saves anything
src/lib/defaultMedia.js   fallback imagery for products and category tiles
src/lib/store.server.js   all administrative logic (settings, catalog, messages, team)
src/lib/admin-security.server.js   access-code hashing, sessions, rate limiting
src/lib/server-fns.js     the RPCs the browser calls (settings, contact form, admin API)
src/routes/_site/         public pages
src/routes/admin/         dashboard pages
src/components/site/      public site components
src/components/admin/     dashboard components
```

Design tokens (colors, fonts, radius) are in `src/index.css` and `tailwind.config.js`.
Values an owner changes at `/admin` are applied on top of those tokens at runtime.

## Notes

- This is an informational catalog: there is no cart, checkout, shipping or online payment,
  and there is no code in the repo to add one accidentally.
- The public site reads only published records; all writes go through the dashboard's
  authenticated server layer.
- The compliance notice on the Terms page is a reminder that age verification, signage,
  licensing and marketing rules vary by state and locality — it is not legal advice.
