export default async function ProjectEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div className="p-10 max-w-3xl mx-auto">Edit Project: {slug}</div>;
}
