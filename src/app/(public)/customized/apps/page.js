import CustomizedPageContent from "@/components/public/CustomizedPageContent";

export const metadata = {
  title: "Custom Mobile Applications Development Portfolio",
  description: "Explore custom iOS & Android mobile applications built by TexWeb Solution including MinitPe, Threadclothes, Uoons, Women Plus, Twin Leaves, Reeta Fashion, and Tracks by Truckoom.",
  alternates: {
    canonical: "https://texwebsolution.in/customized/apps",
  },
};

export default function CustomizedAppsPage() {
  return <CustomizedPageContent activeTab="applications" />;
}
