export const metadata = {
  title: "Contact Us | TexWeb Solution - Free Project Consultation",
  description: "Contact TexWeb Solution. From idea to launch, we design and develop tailor-made websites, apps, and digital growth strategies for your business.",
  alternates: {
    canonical: "https://texwebsolution.in/contact",
  },
  openGraph: {
    title: "Contact Us | TexWeb Solution",
    description: "Contact TexWeb Solution. From idea to launch, we design and develop tailor-made websites, apps, and digital growth strategies for your business.",
    url: "https://texwebsolution.in/contact",
  },
};

export default function ContactLayout({ children }) {
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
        "name": "Contact Us",
        "item": "https://texwebsolution.in/contact"
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
