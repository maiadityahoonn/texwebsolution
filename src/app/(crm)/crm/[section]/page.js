import CrmSectionView from "@/components/crm/shared/CrmSectionPage";
import { getCrmSectionFromSlug } from "@/components/crm/routing";

export default async function CrmSectionPage({ params }) {
  const resolvedParams = await params;
  const section = getCrmSectionFromSlug(resolvedParams?.section);
  return <CrmSectionView section={section} />;
}
