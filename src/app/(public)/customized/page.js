import { redirect } from "next/navigation";

export default async function CustomizedRedirectPage(props) {
  const searchParams = await props?.searchParams;
  const tab = searchParams?.tab?.toLowerCase();

  if (tab === "apps" || tab === "applications" || tab === "app") {
    redirect("/customized/apps");
  }

  redirect("/customized/websites");
}
