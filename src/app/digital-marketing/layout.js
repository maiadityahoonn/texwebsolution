export const metadata = {
  title: "Digital Marketing & SEO Services",
  description: "Drive targeted traffic, organic SEO rankings, social media growth, and paid campaigns with TexWeb Solution's digital marketing expertise.",
  alternates: {
    canonical: "https://texwebsolution.in/digital-marketing",
  },
  openGraph: {
    title: "Digital Marketing & SEO Services",
    description: "Drive targeted traffic, organic SEO rankings, social media growth, and paid campaigns with TexWeb Solution's digital marketing expertise.",
    url: "https://texwebsolution.in/digital-marketing",
  },
};

export default function DigitalMarketingLayout({ children }) {
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
        "name": "Digital Marketing",
        "item": "https://texwebsolution.in/digital-marketing"
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
