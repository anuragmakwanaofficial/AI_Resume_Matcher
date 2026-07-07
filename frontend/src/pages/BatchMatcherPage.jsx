import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchAPI } from '../services/api';

export default function BatchMatcherPage() {
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [resumeFiles, setResumeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jdFile && !jdText.trim()) {
      setError('Please provide a Job Description.');
      return;
    }
    if (resumeFiles.length === 0) {
      setError('Please select at least one Resume.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const formData = new FormData();
    if (jdFile) formData.append('jd_file', jdFile);
    if (jdText) formData.append('jd_text', jdText);
    
    // Append multiple resume files
    for (let i = 0; i < resumeFiles.length; i++) {
      formData.append('resume_files', resumeFiles[i]);
    }

    try {
      const response = await batchAPI.runBatchMatch(formData);
      // response.data contains batch_id
      navigate(`/batch/${response.data.batch_id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred during batch analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient p-8 text-on-surface">
      <div className="max-w-4xl mx-auto mt-10">
        <h1 className="text-4xl font-bold text-center mb-2">Batch Resume Matcher</h1>
        <p className="text-center mb-8 text-gray-600">Rank multiple candidates against a single Job Description</p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 shadow-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* JD Input */}
            <div className="glass-card p-6 rounded-2xl shadow-sm transition-transform hover:-translate-y-1">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                💼 Job Description
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Upload File (PDF/DOCX)</label>
                  <input type="file" onChange={(e) => setJdFile(e.target.files[0])} className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-opacity-90"/>
                </div>
                <div className="text-center font-medium text-gray-400 text-sm">OR</div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Paste Text</label>
                  <textarea 
                    rows="6" 
                    className="w-full p-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary outline-none resize-none bg-surface-container-lowest text-on-surface transition-colors"
                    placeholder="Paste job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Resumes Input */}
            <div className="glass-card p-6 rounded-2xl shadow-sm transition-transform hover:-translate-y-1 flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📄 Candidate Resumes
              </h2>
              <div className="flex-1 flex flex-col justify-center">
                <label className="block text-sm font-semibold mb-2">Upload Multiple Files (PDF/DOCX)</label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface-container-lowest hover:border-secondary transition-colors">
                  <input 
                    type="file" 
                    multiple 
                    onChange={(e) => setResumeFiles(e.target.files)} 
                    className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-opacity-90 cursor-pointer"
                  />
                  <p className="mt-4 text-sm text-on-surface-variant">
                    {resumeFiles.length > 0 ? `${resumeFiles.length} files selected` : "Select all resumes you want to rank"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center">
            <button 
              type="submit" 
              disabled={loading}
              className={`px-12 py-4 rounded-full text-lg font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-opacity-90 hover:shadow-xl transform hover:-translate-y-1'}`}
            >
              {loading ? 'Processing Batch... (Might take a while)' : 'Run Batch Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
