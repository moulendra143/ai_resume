import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/shared/GlassCard';
import api from '../services/api';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend
} from 'recharts';

export default function ATSAnalyzer() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let response;
      if (file) {
        // Multipart file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jobDescription', jobDescription);
        response = await api.post('/ats/analyze/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Raw text analysis
        if (!resumeText.trim()) {
          setError('Please upload a file or paste your resume text.');
          setLoading(false);
          return;
        }
        response = await api.post('/ats/analyze/text', { jobDescription, resumeText });
      }
      setAnalysis(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to analyze resume. Please verify input.');
    } finally {
      setLoading(false);
    }
  };

  const [fixing, setFixing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);





  // Convert comma strings to lists for display/charts
  const formatList = (str) => {
    if (!str) return [];
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  };

  const matchingSkillsList = analysis ? formatList(analysis.matchingSkills) : [];
  const missingSkillsList = analysis ? formatList(analysis.missingSkills) : [];
  const suggestedKeywordsList = analysis ? formatList(analysis.suggestedKeywords) : [];

  // Chart data formatting
  const gaugeData = analysis ? [
    {
      name: 'ATS Score',
      value: analysis.atsScore || 0,
      fill: '#8b5cf6', // Violet
    },
    {
      name: 'Match %',
      value: analysis.matchPercentage || 0,
      fill: '#06b6d4', // Cyan
    },
    {
      name: 'Hiring Readiness',
      value: analysis.hiringReadinessScore || 0,
      fill: '#10b981', // Emerald
    }
  ] : [];

  const barData = analysis ? [
    {
      name: 'Matching Skills',
      count: matchingSkillsList.length,
      fill: '#10b981',
    },
    {
      name: 'Missing Skills',
      count: missingSkillsList.length,
      fill: '#ef4444',
    },
    {
      name: 'Missing Keywords',
      count: suggestedKeywordsList.length,
      fill: '#f59e0b',
    }
  ] : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard title="ATS Analyzer" subtitle="Match your resume to a job description">
          <div className="space-y-4">
            <label className="block text-slate-300">
              Job Description
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                rows="6"
                className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
              />
            </label>

            <div className="border-t border-white/5 pt-4">
              <span className="block text-slate-300 font-semibold mb-2">Resume Input Option 1: Upload Document</span>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-white/2 hover:bg-white/5 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-2xl mb-1">📄</span>
                    <p className="mb-1 text-sm text-slate-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF or DOCX (Max 20MB)</p>
                    {file && <p className="text-violet-400 font-bold mt-2 text-xs">Selected: {file.name}</p>}
                  </div>
                  <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="relative border-t border-white/5 pt-4">
              <span className="block text-slate-300 font-semibold mb-2">Resume Input Option 2: Paste Raw Text</span>
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  if (file) setFile(null); // Clear file upload if text is pasted
                }}
                disabled={!!file}
                placeholder={file ? "Clear file upload above to paste text directly..." : "Paste your resume plain text here..."}
                rows="5"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-40 transition-all"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full py-3 text-white bg-violet-600 hover:bg-violet-500 rounded-2xl font-bold transition-all mt-4"
            >
              {loading ? 'Analyzing Application...' : 'Analyze Resume'}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </GlassCard>

        {/* Dashboard Placeholder before load */}
        {!analysis && (
          <GlassCard title="Analysis Dashboard" subtitle="Upload and analyze to view statistics" className="flex items-center justify-center text-center py-24">
            <div className="space-y-3">
              <span className="text-5xl block animate-pulse">📊</span>
              <h4 className="text-lg font-bold text-white">Metrics Dashboard</h4>
              <p className="text-slate-400 text-sm max-w-xs">
                Your ATS score, matching skills ratio, missing keywords, and section-by-section improvements will compile here.
              </p>
            </div>
          </GlassCard>
        )}

        {/* ATS score metrics visualization */}
        {analysis && (
          <div className="space-y-6">
            <GlassCard title="Score Visualizations" subtitle="ATS score breakdown and comparative alignment">
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={10} data={gaugeData}>
                      <RadialBar minAngle={15} background clockWise dataKey="value" />
                      <Tooltip formatter={(value) => `${value}`} />
                      <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px', color: '#fff' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">ATS Score</span>
                    <span className="text-3xl font-bold text-violet-400">{analysis.atsScore} / 100</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Match Percentage</span>
                    <span className="text-3xl font-bold text-cyan-400">{analysis.matchPercentage}%</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Hiring Readiness</span>
                    <span className="text-3xl font-bold text-emerald-400">{analysis.hiringReadinessScore} / 100</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Keywords Comparison" subtitle="Skills matched vs missing count stats">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {analysis && (
        <GlassCard title="ATS Recommendations & Gaps" subtitle="Details on how to optimize your resume">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-emerald-400 font-semibold flex items-center gap-2">
                <span>✓</span> Matching Skills ({matchingSkillsList.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {matchingSkillsList.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                    {skill}
                  </span>
                ))}
                {matchingSkillsList.length === 0 && <p className="text-slate-400 text-sm">No overlapping skills found yet.</p>}
              </div>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/5 md:pl-6">
              <h4 className="text-red-400 font-semibold flex items-center gap-2">
                <span>⚠</span> Missing Skills ({missingSkillsList.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {missingSkillsList.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs rounded-full bg-red-500/10 border border-red-500/20 text-red-200">
                    {skill}
                  </span>
                ))}
                {missingSkillsList.length === 0 && <p className="text-slate-400 text-sm">Perfect match! No missing skills identified.</p>}
              </div>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/5 md:pl-6">
              <h4 className="text-amber-400 font-semibold flex items-center gap-2">
                <span>⚡</span> Suggested Keywords ({suggestedKeywordsList.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestedKeywordsList.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    {kw}
                  </span>
                ))}
                {suggestedKeywordsList.length === 0 && <p className="text-slate-400 text-sm">No recommendations generated.</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 mt-6 pt-6 space-y-2">
            <h4 className="text-white font-bold text-lg">Section-by-section Feedback</h4>
            <p className="text-slate-300 leading-relaxed text-sm">{analysis.sectionFeedback}</p>
          </div>
        </GlassCard>
      )}

      {analysis && (
        <GlassCard title="Improve Your Resume" subtitle="Add missing keywords to boost your ATS score">
          <div className="grid md:grid-cols-2 gap-4">


          </div>
          {missingSkillsList.length === 0 && (
            <p className="text-emerald-400 text-sm mt-3 text-center">Your resume already contains all required keywords!</p>
          )}
        </GlassCard>
      )}
    </div>
  );
}
