# MTN Zambia — No Funds Portal

A React + Vite web app for MTN Zambia's zero-rated "No Funds" portal. Subscribers with a zero data/airtime balance are redirected here to recharge, buy bundles, borrow emergency credit (XtraTime), or access value-added services — all without using data.

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS
- **Payments:** MTN Mobile Money (MoMo) via backend recharge API
- **Ads:** Tangazo ad zones (`primary_banner`, `square_card`, `footer_banner`)
- **Analytics:** Google Tag Manager (GTM) + `dataLayer` events, tracked per the Analytics Implementation Workbook

## Key Pages & Components

| Path | Purpose |
|---|---|
| `HomePage` | Landing screen on redirect, shows entry reason/tier |
| `AboutNoFunds` | Explains the portal, hero CTAs into each flow |
| `BundlesPage` | Data/voice/social/night bundle catalogue + filters |
| `HotOffers` | Curated "best value" / night / social deal carousels |
| `RechargePage` | Airtime top-up flow |
| `ServicesPage` | VAS catalogue (MTN One TV, MyMTN, MoMo, etc.) |
| `AdvertPage` | Advertiser lead-gen enquiry form |
| `HelpSupportPage` / `FAQsPage` | Support chat, contact channels, FAQs |
| `Emergency` | Emergency service numbers (untracked, outside analytics scope) |
| `components/universal/PaymentModal` | Shared MoMo payment flow used by Bundles, Hot Offers, and Recharge |
| `components/home/*Banner` | Tangazo ad zone components (impression/click tracked) |

## Analytics

GTM container is wired in `index.html` (head snippet + body noscript iframe). Event tracking follows the zone/event/parameter spec in the Analytics Implementation Workbook:

- `page_view`, `cta_click` — entry & navigation
- `view_item_list`, `select_item`, `begin_checkout`, `purchase` — bundle/airtime ecommerce funnel
- `ad_impression`, `ad_click` — Tangazo ad zones (IntersectionObserver-based)
- `service_action`, `support_contact_click`, `faq_open` — engagement zones

The advertising enquiry form opens the user's default email app with a prefilled message. It does not emit a lead-conversion event because the app cannot confirm that the email was sent.

No PII (MSISDN, OTP, name, email, card number) is ever pushed to the `dataLayer`.

**Known open items:**
- `PaymentModal`'s `type` param needs bundle category passed explicitly from each call site (currently defaults to `"data"`/`"airtime"`).
- `is_first_purchase` has no client-side source yet — needs a backend account-history flag.
- Live Tangazo-served ad creatives don't expose `ad_id`/`advertiser`/`campaign` at the component layer — only the static fallback banners do.

## Getting Started

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Linting

```sh
npm run lint
```