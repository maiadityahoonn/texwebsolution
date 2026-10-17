export const metadata = {
  title: "Contact Us",
  description: "Get in touch with TexWeb Solution for custom websites, mobile applications, AI automation, and digital marketing. Reach us at info@texwebsolution.in or +91-7462827259.",
  alternates: {
    canonical: "https://texwebsolution.in/contact",
  },
  openGraph: {
    title: "Contact Us | TexWeb Solution",
    description: "Get in touch with TexWeb Solution for custom websites, mobile applications, AI automation, and digital marketing. Reach us at info@texwebsolution.in or +91-7462827259.",
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
        "item": "https://texwebsolution.in/"
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
