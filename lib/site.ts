export const site = {
  name: "Jacks Motors",
  tagline: "Premium pre-owned, without the markup.",
  description:
    "Hand-picked premium used cars, transparent pricing, and financing for every credit story. Browse the inventory at Jacks Motors.",
  url: "https://jacksmotors.example.com",

  phone: "(555) 123-4567",
  phoneHref: "tel:+15551234567",
  email: "hello@jacksmotors.example.com",

  address: {
    street: "1234 Auto Row",
    city: "Toronto",
    region: "ON",
    postalCode: "M1A 0A1",
    country: "CA",
  },

  hours: [
    { day: "Mon – Fri", time: "9:00 AM – 7:00 PM" },
    { day: "Saturday", time: "10:00 AM – 5:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],

  social: {
    instagram: "https://instagram.com/jacksmotors",
    facebook: "https://facebook.com/jacksmotors",
    youtube: "https://youtube.com/@jacksmotors",
  },

  dealerLicense: "OMVIC #0000000",
};

export type SiteConfig = typeof site;
