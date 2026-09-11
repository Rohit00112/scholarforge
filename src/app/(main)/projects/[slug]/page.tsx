export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div className="p-10 max-w-5xl mx-auto">Project Detail: {slug}</div>;
}
