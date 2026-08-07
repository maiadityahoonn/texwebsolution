export const metadata = {
  title: "Prebuilt SaaS Software & Applications | TexWeb Solution",
  description: "Ready-to-launch prebuilt software solutions for businesses. Get custom SaaS applications, e-learning platforms, and e-commerce portals fast.",
  alternates: {
    canonical: "https://texwebsolution.in/prebuilt",
  },
  openGraph: {
    title: "Prebuilt SaaS Software & Applications | TexWeb Solution",
    description: "Ready-to-launch prebuilt software solutions for businesses. Get custom SaaS applications, e-learning platforms, and e-commerce portals fast.",
    url: "https://texwebsolution.in/prebuilt",
  },
};

export default function PrebuiltLayout({ children }) {
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
        "name": "Prebuilt SaaS Software",
        "item": "https://texwebsolution.in/prebuilt"
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
