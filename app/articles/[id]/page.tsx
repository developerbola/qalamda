export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return <div className="flex items-center justify-center min-h-screen">My Post: {id}</div>;
}
