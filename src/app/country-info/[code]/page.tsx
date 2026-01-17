import CountryOverviewPage from "./CountryOverviewPage";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <CountryOverviewPage countryCode={code.toLowerCase()} />;
}
