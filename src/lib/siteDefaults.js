// Default business configuration. Every value here is editable from /admin;
// nothing in the site reads a hardcoded business detail outside this file.
import { MEDIA } from "@/lib/defaultMedia";

export const SITE_DEFAULTS = {
  business_name: "Cloud Nine Vape",
  tagline: "Vapor & Smoke Boutique",
  logo_url: "",
  favicon_url: "",

  color_background: "#050505",
  color_surface: "#0F0F10",
  color_primary: "#E3B04B",
  color_secondary: "#9AA0AE",
  color_ink: "#F5F5F4",
  color_muted: "#A1A1AA",

  font_heading: "Inter Tight",
  font_body: "Inter",
  button_style: "sharp",
  logo_size: "md",
  header_style: "ghost",
  footer_style: "detailed",
  background_image_url: "",

  hero_eyebrow: "Est. 2016 — East Nashville",
  hero_headline: "A considered collection of vapor, curated for the way you actually vape.",
  hero_subheadline:
    "Independent hardware, small-batch liquids and the accessories that keep them running. Everything on our shelves is tried by the people behind the counter.",
  hero_image_url: MEDIA.hero,

  about_heading: "Nine years of knowing every bottle on the shelf.",
  about_body:
    "Cloud Nine started as a single display case in a record shop on Gallatin Avenue. We opened because the shops we walked into either sold everything or knew nothing, and we thought a store could do both better.\n\nToday we carry a deliberately small list of hardware and liquids. If it is on the shelf, someone here has run it for at least a month. We will tell you what to skip, and we will not sell you something you do not need.",
  about_image_url: MEDIA.store,
  about_sections: [
    {
      title: "Curated, not stocked",
      body: "We would rather carry twelve things we trust than two hundred we don't. Our buyers spend weeks with a device before it earns shelf space, and the same rule applies to liquids.",
    },
    {
      title: "Answers without the attitude",
      body: "Whether you have been vaping for a decade or walked in for the first time, the conversation is the same. We will explain the difference between a pod and a mod, and we will tell you when the cheaper option is the smarter one.",
    },
  ],
  age_minimum: 21,

  phone: "(615) 555-0142",
  email: "hello@cloudninevape.example",
  address_line1: "1204 Gallatin Avenue",
  address_line2: "Suite 3",
  city: "Nashville",
  state: "TN",
  postal_code: "37206",
  maps_query: "1204 Gallatin Avenue, Nashville, TN 37206",
  social_instagram: "https://instagram.com",
  social_facebook: "https://facebook.com",
  social_tiktok: "",
  social_x: "",

  hours: [
    { day: "Monday", hours: "10:00 AM — 8:00 PM" },
    { day: "Tuesday", hours: "10:00 AM — 8:00 PM" },
    { day: "Wednesday", hours: "10:00 AM — 8:00 PM" },
    { day: "Thursday", hours: "10:00 AM — 9:00 PM" },
    { day: "Friday", hours: "10:00 AM — 9:00 PM" },
    { day: "Saturday", hours: "11:00 AM — 9:00 PM" },
    { day: "Sunday", hours: "12:00 PM — 6:00 PM" },
  ],
  holiday_hours: [
    { label: "Thanksgiving Day", hours: "Closed" },
    { label: "Christmas Eve", hours: "11:00 AM — 5:00 PM" },
    { label: "Christmas Day", hours: "Closed" },
    { label: "New Year's Day", hours: "12:00 PM — 6:00 PM" },
  ],
  store_policies:
    "Valid government-issued photo ID is required for every purchase of an age-restricted product, regardless of apparent age. We do not sell to anyone under 21. Returns are accepted within 14 days on sealed hardware with original packaging; opened liquids, coils and disposables cannot be returned. Device warranties are handled directly with the manufacturer and we are glad to help you file a claim.",

  meta_title: "Cloud Nine Vape — Vapor & Smoke Boutique in Nashville, TN",
  meta_description:
    "An independent vapor and smoke boutique in East Nashville. Curated hardware, small-batch liquids, coils and accessories. Visit us in store — 21+ only.",

  show_categories: true,
  show_featured: true,
  show_about: true,
  show_location: true,
  show_hours: true,
  banner_visible: true,
  banner_text: "New arrivals every Friday. Bring your device in for a free coil change while you browse.",
  banner_link_label: "See what's new",
  banner_link_url: "/products",

  age_gate_title: "Are you 21 or older?",
  age_gate_message:
    "This site displays tobacco and vapor products intended for adults. You must be at least 21 years old to enter.",
  age_denied_message:
    "Access is restricted. You must be 21 years of age or older to view age-restricted products. If you believe this is an error, please visit us in store with valid photo identification.",
  age_verification_mode: "self_attest",
  age_provider_name: "",
  age_provider_url: "",

  privacy_policy:
    "We collect only the information you choose to send us through the contact form — your name, email address, phone number and message — and we use it solely to reply to your inquiry. We do not sell, rent or share contact information with third parties.\n\nThis site uses your browser's session storage to remember that you confirmed you are of legal age. That confirmation is cleared when your browsing session ends. We do not create advertising profiles of visitors.\n\nIf you would like your inquiry removed from our records, contact us and we will delete it.",
  terms_conditions:
    "This website is an informational catalog for a physical retail store. No products can be purchased, ordered, reserved or delivered through this site, and no payment is accepted online.\n\nAll products shown are intended for adults 21 years of age or older. Age-restricted products are sold in store only, subject to valid government-issued photo identification and all applicable federal, state and local law.\n\nProduct availability, pricing and specifications shown here are for reference and may change without notice. Manufacturer imagery and descriptions remain the property of their respective owners.",
  compliance_notice:
    "Nothing on this website constitutes legal advice. Age verification, signage, licensing, product restrictions and marketing rules vary by state and locality, and each business is responsible for reviewing applicable federal, state and local requirements before publishing.",

  footer_note: "Independent, locally owned, and glad you're here.",
};

export const FONT_CHOICES = [
  { label: "Inter Tight", value: "Inter Tight" },
  { label: "Sora", value: "Sora" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Manrope", value: "Manrope" },
  { label: "Inter", value: "Inter" },
];

export function mergedSettings(record) {
  if (!record) return { ...SITE_DEFAULTS };
  const clean = {};
  Object.entries(record).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") clean[key] = value;
  });
  const hours = Array.isArray(record.hours) && record.hours.length ? record.hours : SITE_DEFAULTS.hours;
  const holiday = Array.isArray(record.holiday_hours) ? record.holiday_hours : SITE_DEFAULTS.holiday_hours;
  return { ...SITE_DEFAULTS, ...clean, hours, holiday_hours: holiday };
}

export function fullAddress(s) {
  return [s.address_line1, s.address_line2, `${s.city}, ${s.state} ${s.postal_code}`]
    .filter(Boolean)
    .join(", ");
}