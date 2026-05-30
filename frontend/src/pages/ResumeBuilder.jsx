import { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlassCard from '../components/shared/GlassCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const templateOptions = ['MODERN', 'PROFESSIONAL', 'MINIMAL', 'EXECUTIVE', 'ATS_FRIENDLY'];

const blankResume = {
  title: 'My AI Resume',
  template: 'MODERN',
  fullName: '', email: '', phone: '', address: '',
  linkedinUrl: '', githubUrl: '', portfolioUrl: '', leetcodeUrl: '',
  professionalSummary: '', careerObjective: '',
  languages: '', interests: '', referencesInfo: '', courses: '',
  educations: [], experiences: [], projects: [],
  skills: [], certifications: [], achievements: [],
};

/* ─── Mini Resume Preview Card ─── */
function ResumeCard({ item, isActive, onClick, onDuplicate, onDelete }) {
  const r = item;
  return (
    <div
      className={`group relative flex flex-col cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-950/30 ${isActive ? 'border-violet-500 shadow-lg shadow-violet-950/30' : 'border-white/8 hover:border-white/20'}`}
      style={{ background: 'rgba(15,23,42,0.6)' }}
      onClick={onClick}
    >
      {/* Paper preview */}
      <div className="bg-white text-slate-900 mx-3 mt-3 rounded-xl p-3 text-[6px] leading-tight min-h-[160px] shadow-md overflow-hidden">
        <div className="text-center border-b border-slate-200 pb-1.5 mb-1.5">
          <div className="font-bold text-[8px]">{r.fullName || 'Your Name'}</div>
          <div className="text-slate-500 text-[5px]">{r.email || ''} {r.phone ? `· ${r.phone}` : ''}</div>
          {(r.linkedinUrl || r.githubUrl) && (
            <div className="text-slate-400 text-[5px]">
              {r.linkedinUrl && <span>linkedin </span>}
              {r.githubUrl && <span>github</span>}
            </div>
          )}
        </div>
        {r.educations && r.educations.length > 0 && (
          <div className="mb-1">
            <div className="uppercase text-[5px] font-bold text-slate-500 border-b border-slate-200 mb-0.5">Education</div>
            {r.educations.slice(0, 2).map((e, i) => (
              <div key={i} className="text-[5px]">
                <span className="font-semibold">{e.institution || ''}</span>
                {e.degree && <span className="text-slate-500"> — {e.degree}</span>}
              </div>
            ))}
          </div>
        )}
        {r.skills && r.skills.length > 0 && (
          <div className="mb-1">
            <div className="uppercase text-[5px] font-bold text-slate-500 border-b border-slate-200 mb-0.5">Skills</div>
            <div className="text-[5px] text-slate-700">{r.skills.slice(0, 6).map(s => s.skillName).join(', ')}</div>
          </div>
        )}
        {r.experiences && r.experiences.length > 0 && (
          <div>
            <div className="uppercase text-[5px] font-bold text-slate-500 border-b border-slate-200 mb-0.5">Experience</div>
            {r.experiences.slice(0, 2).map((e, i) => (
              <div key={i} className="text-[5px]">
                <span className="font-semibold">{e.jobTitle || ''}</span>
                {e.companyName && <span className="text-slate-500"> · {e.companyName}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{item.title}</p>
          <p className="text-slate-500 text-xs">{item.template}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={onDuplicate} title="Duplicate" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs">❐</button>
          <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-xs">✕</button>
        </div>
      </div>

      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-400/50"></div>
      )}
    </div>
  );
}

/* ─── Create Resume Modal ─── */
function CreateModal({ onClose, onPrefill, onImport }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      <div
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl shadow-slate-950/60 p-8"
        style={{ background: 'rgba(10,15,30,0.97)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">✕</button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your AI Powered Resume</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Create a professional resume with AI assistance. Start from your profile, import an existing PDF, or begin with a blank template.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Option 1: Prefill from Profile */}
          <button
            onClick={onPrefill}
            className="flex items-start gap-4 p-5 rounded-2xl border border-white/8 bg-white/3 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-200 text-left group"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-all">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-violet-200 transition-colors">Prefill from Profile</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">Use your profile details as a starting point.</p>
            </div>
          </button>

          {/* Option 2: Import from existing resume */}
          <button
            onClick={onImport}
            className="flex items-start gap-4 p-5 rounded-2xl border border-white/8 bg-white/3 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 text-left group"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-cyan-200 transition-colors">Import from existing resume</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">Upload a PDF and we'll structure it into the editor with AI.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ResumeBuilder() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Gallery / editor state
  const [view, setView] = useState('gallery'); // 'gallery' | 'editor' | 'import'
  const [showModal, setShowModal] = useState(false);
  const [resumesList, setResumesList] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [resume, setResume] = useState(blankResume);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  // AI states
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiObjectiveLoading, setAiObjectiveLoading] = useState(false);
  const [aiSkillsLoading, setAiSkillsLoading] = useState(false);
  const [enhanceIndex, setEnhanceIndex] = useState(null);

  /* ── Data fetching ── */
  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumesList(res.data);
    } catch {
      setError('Unable to load resumes.');
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  // Auto-load resume from URL query param (e.g. /resume-builder?id=123 from ATS redirect)
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      loadResume(Number(idFromUrl));
      // Clear the query param so refreshing doesn't re-trigger
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const loadResume = async (id) => {
    try {
      const res = await api.get(`/resumes/${id}`);
      const data = res.data;
      setResume({
        ...blankResume, // ensures all fields exist
        ...data,
        educations: data.educations || [],
        experiences: data.experiences || [],
        projects: data.projects || [],
        skills: data.skills || [],
        certifications: data.certifications || [],
        achievements: data.achievements || [],
      });
      setActiveResumeId(id);
      setView('editor');
      setError('');
      setSaved(false);
    } catch {
      setError('Unable to load selected resume.');
    }
  };

  /* ── Create helpers ── */
  const handlePrefill = async () => {
    setShowModal(false);
    setError('');
    try {
      // Fetch the full profile to prefill as many fields as possible
      let profileData = { fullName: user?.fullName || '', email: user?.email || '' };
      try {
        const profileRes = await api.get('/user/profile');
        const p = profileRes.data;
        profileData = {
          fullName: p.fullName || user?.fullName || '',
          email: p.email || user?.email || '',
          phone: p.phone || '',
          linkedinUrl: p.linkedinUrl || '',
          githubUrl: p.githubUrl || '',
          leetcodeUrl: p.leetcodeUrl || '',
          portfolioUrl: p.portfolioUrl || '',
          courses: p.courses || '',
          professionalSummary: p.bio || '',
        };
      } catch {
        // silently fall back to basic data from auth context
      }
      const res = await api.post('/resumes', {
        ...blankResume,
        title: `${profileData.fullName || 'New'}'s Resume`,
        ...profileData,
      });
      await fetchResumes();
      loadResume(res.data.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create resume. Please try again.');
    }
  };

  const handleImportOption = () => {
    setShowModal(false);
    setView('import');
    setImportFile(null);
    setImportStatus('');
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setError('');
    setImportStatus('Extracting content from file…');
    const t1 = setTimeout(() => setImportStatus('AI is analysing your resume structure…'), 1800);
    const t2 = setTimeout(() => setImportStatus('Mapping skills, education & experience…'), 3500);
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      const res = await api.post('/resumes/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearTimeout(t1); clearTimeout(t2);
      setImportStatus('Saving your resume…');
      // Merge parsed data with blank defaults, then persist
      const parsed = {
        ...blankResume,
        ...res.data,
        title: res.data?.fullName ? `${res.data.fullName}'s Resume` : 'Imported Resume',
        // Ensure list fields are always arrays (never null)
        educations: res.data?.educations ?? [],
        experiences: res.data?.experiences ?? [],
        projects: res.data?.projects ?? [],
        skills: res.data?.skills ?? [],
        certifications: res.data?.certifications ?? [],
        achievements: res.data?.achievements ?? [],
      };
      const savedRes = await api.post('/resumes', parsed);
      await fetchResumes();
      setImporting(false);
      setImportStatus('');
      loadResume(savedRes.data.id);
    } catch (err) {
      clearTimeout(t1); clearTimeout(t2);
      setImporting(false);
      setImportStatus('');
      setError(err.response?.data?.message || 'Import failed. Please check the file format (PDF or DOCX) and try again.');
    }
  };

  /* ── Resume CRUD ── */
  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/resumes/${id}/duplicate`);
      await fetchResumes();
      loadResume(res.data.id);
    } catch { setError('Unable to duplicate resume.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume permanently?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      if (activeResumeId === id) { setActiveResumeId(null); setResume(blankResume); setView('gallery'); }
      fetchResumes();
    } catch { setError('Unable to delete resume.'); }
  };

  const saveResume = async () => {
    if (!activeResumeId) return;
    try {
      await api.put(`/resumes/${activeResumeId}`, resume);
      setSaved(true);
      setError('');
      fetchResumes();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save resume.');
    }
  };

  const downloadPdf = () => {
    if (!activeResumeId) return;
    api.get(`/resumes/${activeResumeId}/download`, { responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${resume.title.replace(/\s+/g, '_')}.pdf`;
        link.click();
      })
      .catch(() => setError('Failed to download PDF.'));
  };

  /* ── Field helpers ── */
  const handleChange = (f, v) => setResume(p => ({ ...p, [f]: v }));

  const addEdu = () => setResume(p => ({ ...p, educations: [...p.educations, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }] }));
  const removeEdu = i => setResume(p => ({ ...p, educations: p.educations.filter((_, x) => x !== i) }));
  const updateEdu = (i, f, v) => setResume(p => { const a = [...p.educations]; a[i][f] = v; return { ...p, educations: a }; });

  const addExp = () => setResume(p => ({ ...p, experiences: [...p.experiences, { companyName: '', jobTitle: '', location: '', startDate: '', endDate: '', description: '', sortOrder: 0 }] }));
  const removeExp = i => setResume(p => ({ ...p, experiences: p.experiences.filter((_, x) => x !== i) }));
  const updateExp = (i, f, v) => setResume(p => { const a = [...p.experiences]; a[i][f] = v; return { ...p, experiences: a }; });

  const addProj = () => setResume(p => ({ ...p, projects: [...p.projects, { projectName: '', description: '', technologiesUsed: '', projectUrl: '', githubUrl: '', startDate: '', endDate: '', sortOrder: 0 }] }));
  const removeProj = i => setResume(p => ({ ...p, projects: p.projects.filter((_, x) => x !== i) }));
  const updateProj = (i, f, v) => setResume(p => { const a = [...p.projects]; a[i][f] = v; return { ...p, projects: a }; });

  const addSkill = () => setResume(p => ({ ...p, skills: [...p.skills, { skillName: '', category: '', proficiencyLevel: 'Intermediate', sortOrder: 0 }] }));
  const removeSkill = i => setResume(p => ({ ...p, skills: p.skills.filter((_, x) => x !== i) }));
  const updateSkill = (i, f, v) => setResume(p => { const a = [...p.skills]; a[i][f] = v; return { ...p, skills: a }; });

  const addCert = () => setResume(p => ({ ...p, certifications: [...p.certifications, { certificationName: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', sortOrder: 0 }] }));
  const removeCert = i => setResume(p => ({ ...p, certifications: p.certifications.filter((_, x) => x !== i) }));
  const updateCert = (i, f, v) => setResume(p => { const a = [...p.certifications]; a[i][f] = v; return { ...p, certifications: a }; });

  const addAch = () => setResume(p => ({ ...p, achievements: [...p.achievements, { title: '', description: '' }] }));
  const removeAch = i => setResume(p => ({ ...p, achievements: p.achievements.filter((_, x) => x !== i) }));
  const updateAch = (i, f, v) => setResume(p => { const a = [...p.achievements]; a[i][f] = v; return { ...p, achievements: a }; });

  /* ── AI helpers ── */
  const generateAISummary = async () => {
    setAiSummaryLoading(true);
    try {
      const res = await api.post('/ai/summary', { fullName: resume.fullName, skills: resume.skills.map(s => s.skillName).join(', '), experiences: resume.experiences.map(e => `${e.jobTitle} at ${e.companyName}: ${e.description}`).join('; ') });
      handleChange('professionalSummary', res.data.summary);
    } catch { setError('AI summary failed.'); } finally { setAiSummaryLoading(false); }
  };

  const generateAICareerObjective = async () => {
    setAiObjectiveLoading(true);
    try {
      const res = await api.post('/ai/objective', { fullName: resume.fullName, skills: resume.skills.map(s => s.skillName).join(', '), education: resume.educations.map(e => `${e.degree} in ${e.fieldOfStudy}`).join('; ') });
      handleChange('careerObjective', res.data.objective);
    } catch { setError('AI objective failed.'); } finally { setAiObjectiveLoading(false); }
  };

  const suggestSkills = async () => {
    setAiSkillsLoading(true);
    try {
      const expText = resume.experiences.map(e => e.description).join(' ');
      if (!expText.trim()) { setError('Add experience descriptions first.'); setAiSkillsLoading(false); return; }
      const res = await api.post('/ai/skills', { experienceText: expText });
      const suggested = res.data.skills.split(',').map(s => ({ skillName: s.trim(), category: 'Suggested', proficiencyLevel: 'Intermediate' }));
      setResume(p => ({ ...p, skills: [...p.skills, ...suggested] }));
    } catch { setError('AI skill suggestion failed.'); } finally { setAiSkillsLoading(false); }
  };

  const enhanceExperienceDescription = async (idx) => {
    setEnhanceIndex(idx);
    try {
      const bullet = resume.experiences[idx].description;
      if (!bullet.trim()) { setError('Enter a description to enhance.'); setEnhanceIndex(null); return; }
      const res = await api.post('/ai/experience/enhance', { experienceBullet: bullet });
      updateExp(idx, 'description', res.data.enhancedExperience);
    } catch { setError('AI enhance failed.'); } finally { setEnhanceIndex(null); }
  };

  /* ── Filtered/paginated list ── */
  const filtered = resumesList.filter(r => {
    const titleMatch = r.title ? r.title.toLowerCase().includes(search.toLowerCase()) : false;
    const nameMatch = r.fullName ? r.fullName.toLowerCase().includes(search.toLowerCase()) : false;
    return titleMatch || nameMatch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ════════════════════════════════
     RENDER: IMPORT VIEW
  ════════════════════════════════ */
  if (view === 'import') {
    return (
      <div className="pb-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Resume Builder</h1>
            <p className="text-slate-500 text-sm mt-0.5">Build, polish, and download with AI-assisted editing</p>
          </div>
          <button onClick={() => setView('gallery')} className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all">
            ← Back to Gallery
          </button>
        </div>

        <div className="max-w-xl mx-auto">
          <GlassCard title="Import Existing Resume" subtitle="Upload a PDF or DOCX — our AI will extract and structure all your details">
            {importing ? (
              <div className="flex flex-col items-center py-16 space-y-5">
                <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white font-bold text-lg">AI Parser Working…</p>
                <p className="text-slate-400 text-sm animate-pulse text-center max-w-xs">{importStatus}</p>
              </div>
            ) : (
              <form onSubmit={handleImportSubmit} className="space-y-6">
                <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer bg-white/2 hover:bg-white/5 hover:border-violet-500/40 transition-all">
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mb-3">
                      <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold mb-1">Click to upload <span className="text-slate-400 font-normal">or drag & drop</span></p>
                    <p className="text-slate-500 text-sm">PDF or DOCX · Max 20 MB</p>
                    {importFile && (
                      <div className="mt-3 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
                        📄 {importFile.name}
                      </div>
                    )}
                  </div>
                  <input type="file" accept=".pdf,.docx" className="hidden" onChange={e => e.target.files?.[0] && setImportFile(e.target.files[0])} required />
                </label>

                {importFile && (
                  <div className="rounded-xl bg-slate-900/50 border border-white/5 p-4 text-sm text-slate-300 space-y-1">
                    <p className="font-semibold text-white">What happens next?</p>
                    <p>• We extract all text from your file</p>
                    <p>• Gemini AI maps it to education, skills, experience & more</p>
                    <p>• Your resume opens in the editor — ready to polish</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setView('gallery')} className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={!importFile} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-lg">
                    Parse with AI ⚡
                  </button>
                </div>
              </form>
            )}
            {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-300 text-sm">{error}</div>}
          </GlassCard>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════
     RENDER: EDITOR VIEW
  ════════════════════════════════ */
  if (view === 'editor') {
    return (
      <div className="pb-12 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Resume Builder</h1>
            <p className="text-slate-500 text-sm mt-0.5">Build, polish, and download with AI-assisted editing</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('gallery')} className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all">
              ← Gallery
            </button>
            <button onClick={() => setShowModal(true)} className="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all flex items-center gap-2 text-sm shadow">
              + Create Resume
            </button>
          </div>
        </div>

        {error && <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100 text-sm">{error}</div>}
        {saved && <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-200 text-sm font-semibold">✓ Resume saved successfully!</div>}

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* ── Editor pane ── */}
          <div className="space-y-0">
            <GlassCard title={`Editing: ${resume.title}`} subtitle="Fill out your resume details below">
              {/* Meta row */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/8 mb-4">
                <label className="block text-slate-300 text-sm">
                  Resume Title
                  <input type="text" value={resume.title} onChange={e => handleChange('title', e.target.value)} className="mt-1.5 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm" />
                </label>
                <label className="block text-slate-300 text-sm">
                  Template
                  <select value={resume.template} onChange={e => handleChange('template', e.target.value)} className="mt-1.5 w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm">
                    {templateOptions.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                </label>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 border-b border-white/8 pb-2 mb-4">
                {['personal', 'summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'details'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* ─ Personal ─ */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[['Full Name','fullName','text'],['Email','email','email'],['Phone','phone','text'],['Address / Location','address','text']].map(([label,field,type]) => (
                        <label key={field} className="block text-slate-300 text-sm">{label}
                          <input type={type} value={resume[field] || ''} onChange={e => handleChange(field, e.target.value)} className="mt-1.5 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                        </label>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[['LinkedIn URL','linkedinUrl'],['GitHub URL','githubUrl'],['LeetCode URL','leetcodeUrl'],['Portfolio URL','portfolioUrl']].map(([label,field]) => (
                        <label key={field} className="block text-slate-300 text-sm">{label}
                          <input type="text" value={resume[field] || ''} onChange={e => handleChange(field, e.target.value)} className="mt-1.5 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs" />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─ Summary ─ */}
                {activeTab === 'summary' && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 text-sm font-semibold">Professional Summary</label>
                        <button onClick={generateAISummary} disabled={aiSummaryLoading} className="text-xs bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 text-violet-200 px-3 py-1 rounded-lg transition-all">
                          {aiSummaryLoading ? 'Generating…' : '⚡ AI Summary'}
                        </button>
                      </div>
                      <textarea value={resume.professionalSummary} onChange={e => handleChange('professionalSummary', e.target.value)} rows="5" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 text-sm font-semibold">Career Objective</label>
                        <button onClick={generateAICareerObjective} disabled={aiObjectiveLoading} className="text-xs bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 text-violet-200 px-3 py-1 rounded-lg transition-all">
                          {aiObjectiveLoading ? 'Generating…' : '⚡ AI Objective'}
                        </button>
                      </div>
                      <textarea value={resume.careerObjective} onChange={e => handleChange('careerObjective', e.target.value)} rows="4" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                    </div>
                  </div>
                )}

                {/* ─ Education ─ */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Education History</h4>
                      <button onClick={addEdu} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">+ Add</button>
                    </div>
                    {resume.educations.map((edu, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/3 rounded-xl p-4 space-y-3 relative">
                        <button onClick={() => removeEdu(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-400 text-sm">✕</button>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-slate-300 text-xs">Institution<input type="text" value={edu.institution} onChange={e => updateEdu(idx,'institution',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">Degree<input type="text" value={edu.degree} onChange={e => updateEdu(idx,'degree',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <label className="text-slate-300 text-xs col-span-1">Field of Study<input type="text" value={edu.fieldOfStudy} onChange={e => updateEdu(idx,'fieldOfStudy',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">Start<input type="text" placeholder="2020-09" value={edu.startDate} onChange={e => updateEdu(idx,'startDate',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">End<input type="text" placeholder="2024-05" value={edu.endDate} onChange={e => updateEdu(idx,'endDate',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                        <label className="block text-slate-300 text-xs">Description<textarea rows="2" value={edu.description} onChange={e => updateEdu(idx,'description',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─ Experience ─ */}
                {activeTab === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Work Experience</h4>
                      <button onClick={addExp} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">+ Add</button>
                    </div>
                    {resume.experiences.map((exp, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/3 rounded-xl p-4 space-y-3 relative">
                        <button onClick={() => removeExp(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-400 text-sm">✕</button>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-slate-300 text-xs">Company<input type="text" value={exp.companyName} onChange={e => updateExp(idx,'companyName',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">Job Title<input type="text" value={exp.jobTitle} onChange={e => updateExp(idx,'jobTitle',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <label className="text-slate-300 text-xs">Location<input type="text" value={exp.location} onChange={e => updateExp(idx,'location',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">Start<input type="text" placeholder="2024-01" value={exp.startDate} onChange={e => updateExp(idx,'startDate',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">End<input type="text" placeholder="Present" value={exp.endDate} onChange={e => updateExp(idx,'endDate',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-slate-300 text-xs">Description</label>
                            <button onClick={() => enhanceExperienceDescription(idx)} disabled={enhanceIndex === idx} className="text-xs bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 text-violet-200 px-2 py-0.5 rounded transition-all">
                              {enhanceIndex === idx ? 'Enhancing…' : '✨ Enhance'}
                            </button>
                          </div>
                          <textarea rows="3" value={exp.description} onChange={e => updateExp(idx,'description',e.target.value)} className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─ Projects ─ */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Projects</h4>
                      <button onClick={addProj} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">+ Add</button>
                    </div>
                    {resume.projects.map((proj, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/3 rounded-xl p-4 space-y-3 relative">
                        <button onClick={() => removeProj(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-400 text-sm">✕</button>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-slate-300 text-xs">Project Name<input type="text" value={proj.projectName} onChange={e => updateProj(idx,'projectName',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">Technologies<input type="text" placeholder="React, Node…" value={proj.technologiesUsed} onChange={e => updateProj(idx,'technologiesUsed',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-slate-300 text-xs">Project URL<input type="text" value={proj.projectUrl} onChange={e => updateProj(idx,'projectUrl',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">GitHub URL<input type="text" value={proj.githubUrl} onChange={e => updateProj(idx,'githubUrl',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                        <label className="block text-slate-300 text-xs">Description<textarea rows="2" value={proj.description} onChange={e => updateProj(idx,'description',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─ Skills ─ */}
                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Skills</h4>
                      <div className="flex gap-2">
                        <button onClick={suggestSkills} disabled={aiSkillsLoading} className="bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 text-violet-200 px-3 py-1 rounded-lg text-xs transition-all">{aiSkillsLoading ? 'Analyzing…' : '⚡ Suggest'}</button>
                        <button onClick={addSkill} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">+ Add</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {resume.skills.map((s, idx) => (
                        <div key={idx} className="border border-white/5 bg-white/3 rounded-xl p-2.5 flex gap-2 items-center">
                          <input type="text" placeholder="Skill" value={s.skillName} onChange={e => updateSkill(idx,'skillName',e.target.value)} className="w-1/2 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs" />
                          <select value={s.proficiencyLevel} onChange={e => updateSkill(idx,'proficiencyLevel',e.target.value)} className="w-5/12 px-2 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white text-xs">
                            {['Beginner','Intermediate','Advanced','Expert'].map(l => <option key={l}>{l}</option>)}
                          </select>
                          <button onClick={() => removeSkill(idx)} className="text-slate-400 hover:text-red-400 text-xs ml-auto">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─ Certifications ─ */}
                {activeTab === 'certifications' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Certifications</h4>
                      <button onClick={addCert} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">+ Add</button>
                    </div>
                    {resume.certifications.map((cert, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/3 rounded-xl p-4 space-y-3 relative">
                        <button onClick={() => removeCert(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-400 text-sm">✕</button>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-slate-300 text-xs">Certification Name<input type="text" value={cert.certificationName} onChange={e => updateCert(idx,'certificationName',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">Issuing Organization<input type="text" value={cert.issuingOrganization} onChange={e => updateCert(idx,'issuingOrganization',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-slate-300 text-xs">Issue Date<input type="text" placeholder="2025-05" value={cert.issueDate} onChange={e => updateCert(idx,'issueDate',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                          <label className="text-slate-300 text-xs">Expiry Date<input type="text" placeholder="2028-05" value={cert.expiryDate} onChange={e => updateCert(idx,'expiryDate',e.target.value)} className="mt-1 w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" /></label>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-white">Achievements</h4>
                        <button onClick={addAch} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">+ Add</button>
                      </div>
                      {resume.achievements.map((ach, idx) => (
                        <div key={idx} className="border border-white/5 bg-white/3 rounded-xl p-3 relative space-y-2 mb-3">
                          <button onClick={() => removeAch(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-400 text-sm">✕</button>
                          <input type="text" placeholder="Title" value={ach.title} onChange={e => updateAch(idx,'title',e.target.value)} className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-semibold" />
                          <textarea placeholder="Description" rows="2" value={ach.description} onChange={e => updateAch(idx,'description',e.target.value)} className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─ Details ─ */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    {[['Languages','languages','input','English (Native), French (Fluent)'],['Interests','interests','input','Photography, Running, Chess'],['Courses','courses','textarea','Data Structures, Cloud Computing…'],['References','referencesInfo','textarea','Available upon request']].map(([label,field,type,placeholder]) => (
                      <label key={field} className="block text-slate-300 text-sm">{label}
                        {type === 'input'
                          ? <input type="text" placeholder={placeholder} value={resume[field] || ''} onChange={e => handleChange(field,e.target.value)} className="mt-1.5 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                          : <textarea rows="3" placeholder={placeholder} value={resume[field] || ''} onChange={e => handleChange(field,e.target.value)} className="mt-1.5 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                        }
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Save bar */}
              <div className="flex gap-3 pt-5 border-t border-white/8 mt-5">
                <button onClick={saveResume} className="flex-1 py-3 text-white bg-violet-600 hover:bg-violet-500 rounded-xl font-bold transition-all">
                  Save Draft
                </button>
                <button onClick={downloadPdf} disabled={!activeResumeId} className="px-5 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all disabled:opacity-40">
                  📥 PDF
                </button>
              </div>
            </GlassCard>
          </div>

          {/* ── Live preview ── */}
          <div className="sticky top-6">
            <GlassCard title="Live Preview" subtitle="See how your resume looks">
              <div className="bg-white text-slate-900 p-6 rounded-xl shadow-xl min-h-[600px] text-[10px] font-sans space-y-3 overflow-y-auto max-h-[80vh]">
                <div className="text-center pb-3 border-b border-slate-200">
                  <h2 className="text-base font-bold text-slate-800">{resume.fullName || 'Full Name'}</h2>
                  <div className="text-slate-600 text-[9px] mt-0.5">{resume.email} {resume.phone && `· ${resume.phone}`} {resume.address && `· ${resume.address}`}</div>
                  <div className="text-slate-500 text-[8px] mt-0.5 flex flex-wrap justify-center gap-2">
                    {resume.linkedinUrl && <span>LinkedIn: {resume.linkedinUrl}</span>}
                    {resume.githubUrl && <span>GitHub: {resume.githubUrl}</span>}
                    {resume.portfolioUrl && <span>Portfolio: {resume.portfolioUrl}</span>}
                    {resume.leetcodeUrl && <span>LeetCode: {resume.leetcodeUrl}</span>}
                  </div>
                </div>
                {resume.professionalSummary && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Professional Summary</h3><p className="text-slate-700 leading-relaxed">{resume.professionalSummary}</p></div>}
                {resume.careerObjective && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Career Objective</h3><p className="text-slate-700 leading-relaxed">{resume.careerObjective}</p></div>}
                {resume.educations?.length > 0 && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Education</h3>{resume.educations.map((e,i) => <div key={i} className="mb-1"><div className="flex justify-between font-bold"><span>{e.degree} — {e.institution}</span><span className="text-slate-500 font-normal">{e.startDate}{e.endDate && ` – ${e.endDate}`}</span></div><p className="text-slate-600 italic">{e.fieldOfStudy}</p></div>)}</div>}
                {resume.experiences?.length > 0 && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Work Experience</h3>{resume.experiences.map((e,i) => <div key={i} className="mb-1"><div className="flex justify-between font-bold"><span>{e.jobTitle} at {e.companyName}</span><span className="text-slate-500 font-normal">{e.startDate}{e.endDate && ` – ${e.endDate}`}</span></div><p className="text-slate-500 italic">{e.location}</p>{e.description && <p className="text-slate-700 whitespace-pre-line mt-0.5">{e.description}</p>}</div>)}</div>}
                {resume.projects?.length > 0 && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Projects</h3>{resume.projects.map((p,i) => <div key={i} className="mb-1"><div className="font-bold">{p.projectName}</div><p className="text-slate-500 italic">Tech: {p.technologiesUsed}</p>{p.description && <p className="text-slate-700">{p.description}</p>}</div>)}</div>}
                {resume.skills?.length > 0 && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Skills</h3><p className="text-slate-700">{resume.skills.map(s => `${s.skillName} (${s.proficiencyLevel})`).join(', ')}</p></div>}
                {resume.certifications?.length > 0 && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Certifications</h3>{resume.certifications.map((c,i) => <div key={i}><span className="font-bold">{c.certificationName}</span> — {c.issuingOrganization}</div>)}</div>}
                {resume.achievements?.length > 0 && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Achievements</h3>{resume.achievements.map((a,i) => <div key={i}><span className="font-bold">{a.title}:</span> {a.description}</div>)}</div>}
                {(resume.languages || resume.interests || resume.courses) && <div><h3 className="font-bold text-[9px] text-slate-800 border-b border-slate-200 pb-0.5 mb-1 uppercase tracking-wide">Additional</h3>{resume.languages && <p><b>Languages:</b> {resume.languages}</p>}{resume.interests && <p><b>Interests:</b> {resume.interests}</p>}{resume.courses && <p><b>Courses:</b> {resume.courses}</p>}</div>}
              </div>
            </GlassCard>
          </div>
        </div>

        {showModal && <CreateModal onClose={() => setShowModal(false)} onPrefill={handlePrefill} onImport={handleImportOption} />}
      </div>
    );
  }

  /* ════════════════════════════════
     RENDER: GALLERY VIEW (DEFAULT)
  ════════════════════════════════ */
  return (
    <div className="pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Resume Builder</h1>
          <p className="text-slate-500 text-sm mt-0.5">Build, polish, and download with AI-assisted editing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all flex items-center gap-2 text-sm shadow"
        >
          + Create Resume
        </button>
      </div>

      {/* Search + sort bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search resumes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-white/8 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
          />
        </div>
        <button className="p-2.5 rounded-xl border border-white/8 bg-slate-900/40 text-slate-400 hover:text-white hover:border-white/20 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
        </button>
        <button className="p-2.5 rounded-xl border border-white/8 bg-slate-900/40 text-slate-400 hover:text-white hover:border-white/20 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
        </button>
      </div>

      {error && <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100 text-sm">{error}</div>}

      {/* Section label */}
      {paged.length > 0 && (
        <p className="text-white font-bold mb-4">
          {user?.fullName ? `${user.fullName}'s Resume${paged.length !== 1 ? 's' : ''}` : 'My Resumes'}
        </p>
      )}

      {/* Resume grid */}
      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/8 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-400 font-semibold">No resumes found</p>
          <p className="text-slate-600 text-sm mt-1">Click <strong className="text-slate-400">+ Create Resume</strong> to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paged.map(item => (
            <ResumeCard
              key={item.id}
              item={item}
              isActive={activeResumeId === item.id}
              onClick={() => loadResume(item.id)}
              onDuplicate={() => handleDuplicate(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/5">
          <p className="text-slate-500 text-sm">
            Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} resume{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page === 1} className="px-4 py-2 rounded-xl border border-white/8 bg-slate-900/40 text-slate-300 hover:text-white hover:border-white/20 disabled:opacity-30 text-sm font-semibold transition-all">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl border border-white/8 bg-slate-900/40 text-slate-300 hover:text-white hover:border-white/20 disabled:opacity-30 text-sm font-semibold transition-all">
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && <CreateModal onClose={() => setShowModal(false)} onPrefill={handlePrefill} onImport={handleImportOption} />}
    </div>
  );
}
