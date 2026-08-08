export const metadata = {
  title: "About Us",
  description: "Learn about TexWeb Solution. We specialize in custom web application development, prebuilt SaaS solutions, AI automation, and digital marketing.",
  alternates: {
    canonical: "https://texwebsolution.in/about-us",
  },
  openGraph: {
    title: "About Us",
    description: "Learn about TexWeb Solution. We specialize in custom web application development, prebuilt SaaS solutions, AI automation, and digital marketing.",
    url: "https://texwebsolution.in/about-us",
  },
};

export default function AboutLayout({ children }) {
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
        "name": "About Us",
        "item": "https://texwebsolution.in/about-us"
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
