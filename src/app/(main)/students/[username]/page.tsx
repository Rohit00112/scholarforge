export default async function StudentProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <div className="p-10 max-w-4xl mx-auto">Student Profile: {username}</div>;
}
