import { useParams } from 'react-router-dom';

export default function BlogDetailPage() {
  const { slug } = useParams();
  return (
    <>
      <section className="bg-primary-700 py-16 text-white">
        <div className="container-etaxwala">
          <h1 className="text-3xl font-bold">{slug?.replace(/-/g, ' ') || 'Blog Post'}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container-etaxwala max-w-3xl text-slate-600">
          <p>Blog content will be loaded from the API.</p>
        </div>
      </section>
    </>
  );
}