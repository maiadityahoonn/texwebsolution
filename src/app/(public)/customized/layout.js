export const metadata = {
  title: {
    default: "Customized Web & Mobile App Development | TexWeb Solution",
    template: "%s | TexWeb Solution",
  },
  description: "Bespoke full-stack web application and mobile app engineering tailored specifically to your enterprise and startup requirements.",
  alternates: {
    canonical: "https://texwebsolution.in/customized/websites",
  },
  openGraph: {
    title: "Customized Web & Mobile App Development | TexWeb Solution",
    description: "Bespoke full-stack web application and mobile app engineering tailored specifically to your enterprise and startup requirements.",
    url: "https://texwebsolution.in/customized/websites",
  },
};

export default function CustomizedLayout({ children }) {
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
        "name": "Customized Solutions",
        "item": "https://texwebsolution.in/customized/websites"
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
