export const metadata = {
  title: "AI Automation & Custom Chatbots",
  description: "Automate your customer service, business workflows, and lead generation with TexWeb Solution's custom AI chatbot and automation solutions.",
  alternates: {
    canonical: "https://texwebsolution.in/ai-automation",
  },
  openGraph: {
    title: "AI Automation & Custom Chatbots",
    description: "Automate your customer service, business workflows, and lead generation with TexWeb Solution's custom AI chatbot and automation solutions.",
    url: "https://texwebsolution.in/ai-automation",
  },
};

export default function AiAutomationLayout({ children }) {
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
        "name": "AI Automation",
        "item": "https://texwebsolution.in/ai-automation"
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
