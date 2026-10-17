export const metadata = {
  title: "Get Free Project Quote & Technical Architecture",
  description: "Get an instant free proposal, cost estimate, and tech roadmap for your custom website, mobile app, SaaS, or AI automation. Starter packages from ₹1,999/mo.",
  alternates: {
    canonical: "https://texwebsolution.in/get-quote",
  },
  openGraph: {
    title: "Get Free Project Quote & Technical Architecture | TexWeb Solution",
    description: "Get an instant free proposal, cost estimate, and tech roadmap for your custom website, mobile app, SaaS, or AI automation. Starter packages from ₹1,999/mo.",
    url: "https://texwebsolution.in/get-quote",
    images: [
      {
        url: "https://texwebsolution.in/logo.png",
        width: 1024,
        height: 1024,
        alt: "TexWeb Solution Quote Request",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Free Project Quote & Architecture | TexWeb Solution",
    description: "Get an instant free proposal, cost estimate, and tech roadmap for your custom website, mobile app, SaaS, or AI automation.",
    images: ["https://texwebsolution.in/logo.png"],
  },
};

export default function GetQuoteLayout({ children }) {
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
        "name": "Get Free Quote",
        "item": "https://texwebsolution.in/get-quote"
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
