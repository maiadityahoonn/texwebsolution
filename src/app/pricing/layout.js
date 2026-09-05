export const metadata = {
  title: "Pricing & Monthly Plans | Affordable Website & Automation Packages",
  description: "Transparent, flexible monthly website and business management plans starting at just ₹999/month. Tailored for any industry with zero heavy upfront costs.",
  alternates: {
    canonical: "https://texwebsolution.in/pricing",
  },
  openGraph: {
    title: "Pricing & Monthly Plans | TexWeb Solution",
    description: "Transparent, flexible monthly website and business management plans starting at just ₹999/month. Tailored for any industry with zero heavy upfront costs.",
    url: "https://texwebsolution.in/pricing",
  },
};

export default function PricingLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://texwebsolution.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Pricing & Monthly Plans",
        "item": "https://texwebsolution.in/pricing"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
