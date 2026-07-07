import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { batchAPI } from '../services/api';

export default function RankingDashboard() {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const fetchBatch = async () => {
    try {
      const response = await batchAPI.getBatchResults(id);
      setBatch(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load batch ranking.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading candidate rankings...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!batch) return <div className="text-center mt-20">No batch found.</div>;

  return (
    <div className="min-h-screen hero-gradient p-8 text-on-surface">
      <div className="max-w-5xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-2">Candidate Ranking Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Job Description: <span className="font-semibold">{batch.jd_filename || 'Pasted Text'}</span> | 
          Processed on: {new Date(batch.created_at).toLocaleString()}
        </p>

        <div className="grid gap-4">
          {batch.candidates.map((candidate, index) => (
            <div key={candidate.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Rank Badge */}
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-secondary text-secondary font-bold text-2xl flex-shrink-0">
                #{index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold truncate max-w-xs md:max-w-md">
                  {candidate.resume_filename || 'Pasted Resume Text'}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {candidate.narrative}
                </p>
              </div>

              {/* Score & Action */}
              <div className="flex flex-col items-center md:items-end gap-2 flex-shrink-0">
                <div className="text-3xl font-black text-secondary">
                  {candidate.overall_score}%
                </div>
                <Link 
                  to={`/results/${candidate.id}`} 
                  className="text-sm px-4 py-2 bg-secondary text-white rounded-full font-semibold hover:bg-opacity-90 transition-all"
                >
                  View Details
                </Link>
              </div>

            </div>
          ))}
          {batch.candidates.length === 0 && (
            <div className="text-center p-10 glass-card rounded-2xl">
              No candidates processed successfully for this batch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
