import CustomizedPageContent from "@/components/public/CustomizedPageContent";

export const metadata = {
  title: "Custom Websites & Web Platforms Portfolio",
  description: "Explore bespoke websites and web platforms built by TexWeb Solution including Sarvadnya Vidyapeeth, Trend Kro Media, Heal Stride, Siwan City Hospital, Samay Hospital, Anikara, Kirtilals, and more.",
  alternates: {
    canonical: "https://texwebsolution.in/customized/websites",
  },
};

export default function CustomizedWebsitesPage() {
  return <CustomizedPageContent activeTab="websites" />;
}
