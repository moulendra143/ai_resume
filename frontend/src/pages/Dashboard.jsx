import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/shared/GlassCard';
import api from '../services/api';

const templateOptions = [
  { id: 'MODERN', name: 'Modern Template', desc: 'A clean layout with side detail column and elegant timeline lines.' },
  { id: 'PROFESSIONAL', name: 'Professional Template', desc: 'A classic executive presentation with centered name block and solid lines.' },
  { id: 'MINIMAL', name: 'Minimalist Template', desc: 'A crisp, no-nonsense text design focused entirely on scan-friendly reading.' },
  { id: 'EXECUTIVE', name: 'Executive Template', desc: 'A polished double-column structure built for experienced managers.' },
  { id: 'ATS_FRIENDLY', name: 'ATS Friendly Template', desc: 'Strict standard single-column optimized perfectly for resume scanner crawlers.' }
];

const initialResumeState = {
  title: 'My AI Resume',
  template: 'MODERN',
  fullName: '',
  email: '',
  phone: '',
  address: '',
  linkedinUrl: '',
  githubUrl: '',
  leetcodeUrl: '',
  portfolioUrl: '',
  professionalSummary: '',
  careerObjective: '',
  languages: '',
  interests: '',
  courses: '',
  educations: [],
  experiences: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Onboarding wizard states
  const [view, setView] = useState('landing'); // 'landing', 'wizard', 'import'
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState(initialResumeState);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  
  // AI states in wizard
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiObjectiveLoading, setAiObjectiveLoading] = useState(false);
  const [aiSkillsLoading, setAiSkillsLoading] = useState(false);
  const [enhanceIndex, setEnhanceIndex] = useState(null);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/user/dashboard');
      setMetrics(response.data);
      if (response.data.totalResumes > 0) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    } catch (err) {
      setError('Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleStartFromScratch = async () => {
    setLoading(true);
    try {
      const response = await api.post('/resumes', { ...initialResumeState, title: 'Blank Slate Resume' });
      navigate(`/resume-builder?id=${response.data.id}`);
    } catch (err) {
      setError('Failed to initialize a new blank resume.');
      setLoading(false);
    }
  };

  const handlePrefillProfile = () => {
    setFormData(initialResumeState);
    setView('wizard');
    setWizardStep(1);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportStatus('Extracting content from file...');
    try {
      const postData = new FormData();
      postData.append('file', importFile);
      
      setTimeout(() => setImportStatus('AI is analyzing resume structure...'), 1800);
      setTimeout(() => setImportStatus('Mapping education and experience history...'), 3500);

      const response = await api.post('/resumes/import', postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const parsedResume = { ...initialResumeState, ...response.data, title: 'Imported AI Resume' };
      setFormData(parsedResume);
      setView('wizard');
      setWizardStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'AI Import failed. Please check file format.');
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  };

  // Onboarding Wizard Actions
  const handleWizardChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addEdu = () => {
    const newEdu = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' };
    setFormData((prev) => ({ ...prev, educations: [...prev.educations, newEdu] }));
  };

  const removeEdu = (idx) => {
    setFormData((prev) => ({ ...prev, educations: prev.educations.filter((_, i) => i !== idx) }));
  };

  const updateEdu = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.educations];
      updated[idx][field] = value;
      return { ...prev, educations: updated };
    });
  };

  const addExp = () => {
    const newExp = { companyName: '', jobTitle: '', location: '', startDate: '', endDate: '', description: '', sortOrder: 0 };
    setFormData((prev) => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const removeExp = (idx) => {
    setFormData((prev) => ({ ...prev, experiences: prev.experiences.filter((_, i) => i !== idx) }));
  };

  const updateExp = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experiences];
      updated[idx][field] = value;
      return { ...prev, experiences: updated };
    });
  };

  const addProj = () => {
    const newProj = { projectName: '', description: '', technologiesUsed: '', projectUrl: '', githubUrl: '', startDate: '', endDate: '', sortOrder: 0 };
    setFormData((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const removeProj = (idx) => {
    setFormData((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }));
  };

  const updateProj = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.projects];
      updated[idx][field] = value;
      return { ...prev, projects: updated };
    });
  };

  const addSkill = () => {
    const newSkill = { skillName: '', category: 'Technical', proficiencyLevel: 'Intermediate', sortOrder: 0 };
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const removeSkill = (idx) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
  };

  const updateSkill = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.skills];
      updated[idx][field] = value;
      return { ...prev, skills: updated };
    });
  };

  const addCert = () => {
    const newCert = { certificationName: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', sortOrder: 0 };
    setFormData((prev) => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };

  const removeCert = (idx) => {
    setFormData((prev) => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }));
  };

  const updateCert = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.certifications];
      updated[idx][field] = value;
      return { ...prev, certifications: updated };
    });
  };

  const addAch = () => {
    const newAch = { title: '', description: '' };
    setFormData((prev) => ({ ...prev, achievements: [...prev.achievements, newAch] }));
  };

  const removeAch = (idx) => {
    setFormData((prev) => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== idx) }));
  };

  const updateAch = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.achievements];
      updated[idx][field] = value;
      return { ...prev, achievements: updated };
    });
  };

  // AI Helpers inside wizard
  const generateSummary = async () => {
    setAiSummaryLoading(true);
    try {
      const profileData = {
        fullName: formData.fullName,
        skills: formData.skills.map((s) => s.skillName).join(', '),
        experiences: formData.experiences.map((e) => `${e.jobTitle} at ${e.companyName}: ${e.description}`).join('; ')
      };
      const response = await api.post('/ai/summary', profileData);
      handleWizardChange('professionalSummary', response.data.summary);
    } catch (err) {
      setError('AI summary generation failed.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const generateObjective = async () => {
    setAiObjectiveLoading(true);
    try {
      const profileData = {
        fullName: formData.fullName,
        skills: formData.skills.map((s) => s.skillName).join(', '),
        education: formData.educations.map((e) => `${e.degree} in ${e.fieldOfStudy}`).join('; ')
      };
      const response = await api.post('/ai/objective', profileData);
      handleWizardChange('careerObjective', response.data.objective);
    } catch (err) {
      setError('AI objective generation failed.');
    } finally {
      setAiObjectiveLoading(false);
    }
  };

  const handleSuggestSkills = async () => {
    setAiSkillsLoading(true);
    try {
      const expText = formData.experiences.map((e) => e.description).join(' ');
      if (!expText.trim()) {
        setError('Please add work experience descriptions first.');
        setAiSkillsLoading(false);
        return;
      }
      const response = await api.post('/ai/skills', { experienceText: expText });
      const suggested = response.data.skills.split(',').map((s) => ({
        skillName: s.trim(),
        category: 'Suggested',
        proficiencyLevel: 'Intermediate'
      }));
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, ...suggested] }));
    } catch (err) {
      setError('AI skill suggestion failed.');
    } finally {
      setAiSkillsLoading(false);
    }
  };

  const handleEnhanceExperience = async (idx) => {
    setEnhanceIndex(idx);
    try {
      const bullet = formData.experiences[idx].description;
      if (!bullet.trim()) {
        setError('Please enter a description to enhance.');
        setEnhanceIndex(null);
        return;
      }
      const response = await api.post('/ai/experience/enhance', { experienceBullet: bullet });
      updateExp(idx, 'description', response.data.enhancedExperience);
    } catch (err) {
      setError('AI experience enhancement failed.');
    } finally {
      setEnhanceIndex(null);
    }
  };

  const handleGenerateOnboardingResume = async () => {
    setLoading(true);
    try {
      // 1. Update user profile details
      const profilePayload = {
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.professionalSummary,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        leetcodeUrl: formData.leetcodeUrl,
        portfolioUrl: formData.portfolioUrl,
        courses: formData.courses,
      };
      await api.put('/user/profile', profilePayload);

      // 2. Post new resume draft
      const response = await api.post('/resumes', formData);
      
      navigate(`/resume-builder?id=${response.data.id}`);
    } catch (err) {
      setError('Failed to generate your resume document.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-semibold animate-pulse">Initializing your dashboard...</p>
      </div>
    );
  }

  // View: LANDING (Mockup display)
  if (view === 'landing') {
    return (
      <div className="min-h-[85vh] flex flex-col justify-between px-4 py-8">
        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Resume Builder
              <span className="text-slate-500 font-normal text-sm border-l border-white/10 pl-3">
                Build, polish, and download with AI-assisted editing
              </span>
            </h1>
          </div>
          <button 
            onClick={handlePrefillProfile}
            className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg"
          >
            <span className="text-lg leading-none">+</span> Create Resume
          </button>
        </div>

        {/* Center Mockup Options */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto text-center py-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Create your AI Powered Resume
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mt-4 leading-relaxed">
            Create a professional resume with AI assistance. Start from your profile, import an existing PDF, or begin with a blank template — then use Customize for JD from inside the editor.
          </p>

          {/* Three side-by-side cards matching the mockup image layout */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 w-full">
            {/* Card 1: Prefill from Profile */}
            <div 
              onClick={handlePrefillProfile}
              className="flex items-start gap-4 p-6 bg-slate-900/50 border border-white/5 hover:border-violet-500/40 rounded-2xl cursor-pointer hover:bg-slate-900/70 transition-all duration-300 shadow-glass group text-left"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-all duration-300">
                <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">Prefill from Profile</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">Use your profile details as a starting point.</p>
              </div>
            </div>

            {/* Card 2: Import from existing resume */}
            <div 
              onClick={() => setView('import')}
              className="flex items-start gap-4 p-6 bg-slate-900/50 border border-white/5 hover:border-cyan-500/40 rounded-2xl cursor-pointer hover:bg-slate-900/70 transition-all duration-300 shadow-glass group text-left"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-300">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">Import from existing resume</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">Upload a PDF and we'll structure it into the editor with AI.</p>
              </div>
            </div>

            {/* Card 3: Start from Scratch */}
            <div 
              onClick={handleStartFromScratch}
              className="flex items-start gap-4 p-6 bg-slate-900/50 border border-white/5 hover:border-emerald-500/40 rounded-2xl cursor-pointer hover:bg-slate-900/70 transition-all duration-300 shadow-glass group text-left"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">Start from Scratch</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">Begin with a clean, empty template.</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100 max-w-xl mx-auto w-full text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  // View: IMPORT
  if (view === 'import') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <GlassCard className="max-w-xl w-full p-8 space-y-6" title="Import Your Resume PDF" subtitle="Our advanced AI parser will extract all information">
          {importing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <h4 className="text-lg font-bold text-white">AI Parser Working</h4>
              <p className="text-slate-400 text-sm animate-pulse text-center max-w-xs">{importStatus}</p>
            </div>
          ) : (
            <form onSubmit={handleImportSubmit} className="space-y-6">
              <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/10 border-dashed rounded-2xl cursor-pointer bg-white/2 hover:bg-white/5 transition-all relative">
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-4xl mb-2">📄</span>
                    <p className="mb-1 text-sm text-slate-300"><span className="font-semibold font-bold text-white">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF or DOCX (Max 20MB)</p>
                    {importFile && <p className="text-violet-400 font-bold mt-4 text-sm">Selected: {importFile.name}</p>}
                  </div>
                  <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" required />
                </label>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setView('landing')} 
                  className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!importFile}
                  className="flex-1 py-3 text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl font-bold transition-all shadow-lg shadow-violet-950/20"
                >
                  Parse with AI ⚡
                </button>
              </div>
            </form>
          )}
          {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-300 text-sm">{error}</div>}
        </GlassCard>
      </div>
    );
  }

  // View: ONBOARDING WIZARD
  if (view === 'wizard') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 pb-20">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-violet-400">Step {wizardStep} of 6</span>
            <span className="text-xs text-slate-400">Profile Onboarding: Zero to Hero</span>
          </div>
          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${(wizardStep / 6) * 100}%` }}></div>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100">{error}</div>}

        <GlassCard 
          title={
            wizardStep === 1 ? 'Step 1: Contact Details & Links' :
            wizardStep === 2 ? 'Step 2: Objective & Summary' :
            wizardStep === 3 ? 'Step 3: Education Details' :
            wizardStep === 4 ? 'Step 4: Work Experience & Projects' :
            wizardStep === 5 ? 'Step 5: Skills, Certifications & Courses' :
            'Step 6: Select Resume Template'
          }
          subtitle="Generate a complete, beautiful resume immediately"
        >
          {/* STEP 1: Basic & Socials */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <label className="block text-slate-300">
                  Full Name
                  <input type="text" value={formData.fullName} onChange={(e) => handleWizardChange('fullName', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" required />
                </label>
                <label className="block text-slate-300">
                  Email Address
                  <input type="email" value={formData.email} onChange={(e) => handleWizardChange('email', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" required />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <label className="block text-slate-300">
                  Phone Number
                  <input type="text" value={formData.phone} onChange={(e) => handleWizardChange('phone', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
                <label className="block text-slate-300">
                  Address / City State
                  <input type="text" value={formData.address} onChange={(e) => handleWizardChange('address', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <label className="block text-slate-300">
                  LinkedIn URL
                  <input type="text" placeholder="https://linkedin.com/in/username" value={formData.linkedinUrl} onChange={(e) => handleWizardChange('linkedinUrl', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
                <label className="block text-slate-300">
                  GitHub URL
                  <input type="text" placeholder="https://github.com/username" value={formData.githubUrl} onChange={(e) => handleWizardChange('githubUrl', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <label className="block text-slate-300">
                  LeetCode Profile URL
                  <input type="text" placeholder="https://leetcode.com/username" value={formData.leetcodeUrl} onChange={(e) => handleWizardChange('leetcodeUrl', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
                <label className="block text-slate-300">
                  Portfolio / Website URL
                  <input type="text" placeholder="https://mywebsite.com" value={formData.portfolioUrl} onChange={(e) => handleWizardChange('portfolioUrl', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Objective & Summary */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-semibold">Career Objective</label>
                  <button type="button" onClick={generateObjective} disabled={aiObjectiveLoading} className="text-xs bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 text-violet-200 px-3 py-1.5 rounded-lg transition-all">
                    {aiObjectiveLoading ? 'Generating...' : '⚡ Generate AI Objective'}
                  </button>
                </div>
                <textarea rows="4" placeholder="Write a short description of your career goals..." value={formData.careerObjective} onChange={(e) => handleWizardChange('careerObjective', e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-semibold">Professional Summary</label>
                  <button type="button" onClick={generateSummary} disabled={aiSummaryLoading} className="text-xs bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 text-violet-200 px-3 py-1.5 rounded-lg transition-all">
                    {aiSummaryLoading ? 'Generating...' : '⚡ Generate AI Summary'}
                  </button>
                </div>
                <textarea rows="5" placeholder="Write a brief professional summary..." value={formData.professionalSummary} onChange={(e) => handleWizardChange('professionalSummary', e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
            </div>
          )}

          {/* STEP 3: Education */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-lg">Schools & Colleges</h4>
                <button type="button" onClick={addEdu} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all">
                  + Add Education
                </button>
              </div>

              {formData.educations.map((edu, idx) => (
                <div key={idx} className="border border-white/5 bg-slate-900/40 rounded-2xl p-6 relative space-y-4 shadow-sm">
                  <button type="button" onClick={() => removeEdu(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors">✕</button>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="text-slate-300 text-xs font-semibold">Institution / University Name
                      <input type="text" value={edu.institution} onChange={(e) => updateEdu(idx, 'institution', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </label>
                    <label className="text-slate-300 text-xs font-semibold">Degree
                      <input type="text" value={edu.degree} onChange={(e) => updateEdu(idx, 'degree', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </label>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <label className="text-slate-300 text-xs font-semibold">Field of Study
                      <input type="text" value={edu.fieldOfStudy} onChange={(e) => updateEdu(idx, 'fieldOfStudy', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </label>
                    <label className="text-slate-300 text-xs font-semibold">Start Date
                      <input type="text" placeholder="2021-09" value={edu.startDate} onChange={(e) => updateEdu(idx, 'startDate', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </label>
                    <label className="text-slate-300 text-xs font-semibold">End Date
                      <input type="text" placeholder="2025-05" value={edu.endDate} onChange={(e) => updateEdu(idx, 'endDate', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </label>
                  </div>
                  <label className="block text-slate-300 text-xs font-semibold">Description / Key Coursework (Optional)
                    <textarea rows="2" value={edu.description} onChange={(e) => updateEdu(idx, 'description', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </label>
                </div>
              ))}
              
              {formData.educations.length === 0 && (
                <div className="text-center py-10 bg-white/2 border border-white/5 border-dashed rounded-2xl text-slate-400">
                  No education history added yet. Click "+ Add Education" to add your studies.
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Experience & Projects */}
          {wizardStep === 4 && (
            <div className="space-y-8">
              {/* Experiences */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-lg">Work Experience</h4>
                  <button type="button" onClick={addExp} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all">
                    + Add Experience
                  </button>
                </div>

                {formData.experiences.map((exp, idx) => (
                  <div key={idx} className="border border-white/5 bg-slate-900/40 rounded-2xl p-6 relative space-y-4 shadow-sm">
                    <button type="button" onClick={() => removeExp(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors">✕</button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="text-slate-300 text-xs font-semibold">Company Name
                        <input type="text" value={exp.companyName} onChange={(e) => updateExp(idx, 'companyName', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs font-semibold">Job Title
                        <input type="text" value={exp.jobTitle} onChange={(e) => updateExp(idx, 'jobTitle', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <label className="text-slate-300 text-xs font-semibold">Location
                        <input type="text" placeholder="San Francisco, CA" value={exp.location} onChange={(e) => updateExp(idx, 'location', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs font-semibold">Start Date
                        <input type="text" placeholder="2024-01" value={exp.startDate} onChange={(e) => updateExp(idx, 'startDate', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs font-semibold">End Date
                        <input type="text" placeholder="Present" value={exp.endDate} onChange={(e) => updateExp(idx, 'endDate', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 text-xs font-semibold">Description (Bullet points)</label>
                        <button type="button" onClick={() => handleEnhanceExperience(idx)} disabled={enhanceIndex === idx} className="text-xs bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 text-violet-200 px-2 py-1 rounded transition-all">
                          {enhanceIndex === idx ? 'Enhancing...' : '✨ Enhance Bullet Point'}
                        </button>
                      </div>
                      <textarea rows="3" value={exp.description} onChange={(e) => updateExp(idx, 'description', e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </div>
                  </div>
                ))}
                
                {formData.experiences.length === 0 && (
                  <div className="text-center py-6 bg-white/2 border border-white/5 border-dashed rounded-2xl text-slate-400 text-sm">
                    No work experience added yet.
                  </div>
                )}
              </div>

              {/* Projects */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-lg">Projects</h4>
                  <button type="button" onClick={addProj} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all">
                    + Add Project
                  </button>
                </div>

                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="border border-white/5 bg-slate-900/40 rounded-2xl p-6 relative space-y-4 shadow-sm">
                    <button type="button" onClick={() => removeProj(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors">✕</button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="text-slate-300 text-xs font-semibold">Project Name
                        <input type="text" value={proj.projectName} onChange={(e) => updateProj(idx, 'projectName', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs font-semibold">Technologies Used
                        <input type="text" placeholder="React, Spring Boot, MySQL" value={proj.technologiesUsed} onChange={(e) => updateProj(idx, 'technologiesUsed', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="text-slate-300 text-xs font-semibold">Project URL
                        <input type="text" placeholder="https://myproject.com" value={proj.projectUrl} onChange={(e) => updateProj(idx, 'projectUrl', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs font-semibold">GitHub Repository URL
                        <input type="text" placeholder="https://github.com/user/project" value={proj.githubUrl} onChange={(e) => updateProj(idx, 'githubUrl', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="text-slate-300 text-xs font-semibold">Start Date
                        <input type="text" placeholder="2024-03" value={proj.startDate} onChange={(e) => updateProj(idx, 'startDate', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs font-semibold">End Date
                        <input type="text" placeholder="2024-05" value={proj.endDate} onChange={(e) => updateProj(idx, 'endDate', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                    </div>
                    <label className="block text-slate-300 text-xs font-semibold">Description / Key Features
                      <textarea rows="3" value={proj.description} onChange={(e) => updateProj(idx, 'description', e.target.value)} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Skills, Certifications, Achievements & Courses */}
          {wizardStep === 5 && (
            <div className="space-y-8">
              {/* Skills */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-lg">Skills List</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleSuggestSkills} disabled={aiSkillsLoading} className="text-xs bg-violet-600/30 border border-violet-500/30 hover:bg-violet-650 text-violet-200 px-3 py-1.5 rounded-lg transition-all">
                      {aiSkillsLoading ? 'Analyzing...' : '⚡ Suggest Skills'}
                    </button>
                    <button type="button" onClick={addSkill} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold transition-all">
                      + Add Skill
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {formData.skills.map((skill, idx) => (
                    <div key={idx} className="border border-white/5 bg-slate-900/30 rounded-xl p-3 relative flex gap-2 items-center">
                      <input type="text" placeholder="Skill (e.g. Java)" value={skill.skillName} onChange={(e) => updateSkill(idx, 'skillName', e.target.value)} className="w-1/2 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs" />
                      <select value={skill.proficiencyLevel} onChange={(e) => updateSkill(idx, 'proficiencyLevel', e.target.value)} className="w-5/12 px-2 py-1.5 bg-slate-900 border border-white/10 rounded text-white text-xs">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <button type="button" onClick={() => removeSkill(idx)} className="text-slate-400 hover:text-red-400 text-sm ml-auto">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-lg">Certifications</h4>
                  <button type="button" onClick={addCert} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold transition-all">
                    + Add Cert
                  </button>
                </div>

                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="border border-white/5 bg-slate-900/40 rounded-xl p-4 relative space-y-3">
                    <button type="button" onClick={() => removeCert(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-400">✕</button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="text-slate-300 text-xs">Certification Name
                        <input type="text" value={cert.certificationName} onChange={(e) => updateCert(idx, 'certificationName', e.target.value)} className="mt-1.5 w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs">Issuing Organization
                        <input type="text" value={cert.issuingOrganization} onChange={(e) => updateCert(idx, 'issuingOrganization', e.target.value)} className="mt-1.5 w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="text-slate-300 text-xs">Issue Date
                        <input type="text" placeholder="2025-01" value={cert.issueDate} onChange={(e) => updateCert(idx, 'issueDate', e.target.value)} className="mt-1.5 w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                      <label className="text-slate-300 text-xs">Expiry Date (Optional)
                        <input type="text" placeholder="2028-01" value={cert.expiryDate} onChange={(e) => updateCert(idx, 'expiryDate', e.target.value)} className="mt-1.5 w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-lg">Achievements</h4>
                  <button type="button" onClick={addAch} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold transition-all">
                    + Add Achievement
                  </button>
                </div>

                {formData.achievements.map((ach, idx) => (
                  <div key={idx} className="border border-white/5 bg-slate-900/40 rounded-xl p-4 relative space-y-2">
                    <button type="button" onClick={() => removeAch(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-400">✕</button>
                    <input type="text" placeholder="Title (e.g. 1st Place Hackathon)" value={ach.title} onChange={(e) => updateAch(idx, 'title', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-semibold" />
                    <textarea placeholder="Brief details about what you achieved..." rows="2" value={ach.description} onChange={(e) => updateAch(idx, 'description', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs" />
                  </div>
                ))}
              </div>

              {/* Courses */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <label className="block text-slate-300 font-semibold">
                  Relevant Courses & Academic Subjects
                  <span className="text-slate-500 font-normal block text-xs mt-1">Specify completed courses separating them with commas (e.g. Data Structures, Database Systems, Cloud Computing)</span>
                  <textarea rows="3" placeholder="Data Structures & Algorithms, Systems Engineering, Modern Full Stack Development..." value={formData.courses} onChange={(e) => handleWizardChange('courses', e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Template Selection */}
          {wizardStep === 6 && (
            <div className="space-y-6">
              <h4 className="font-bold text-white text-lg text-center">Select Your Resume Design Template</h4>
              <p className="text-slate-400 text-sm text-center max-w-md mx-auto">Click on a card below to select which styling template to generate your initial resume document with. You can change this later at any time.</p>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
                {templateOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => handleWizardChange('template', opt.id)}
                    className={`border p-5 rounded-2xl cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${formData.template === opt.id ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-950/20' : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-white/10'}`}
                  >
                    <div>
                      {/* Stylized layout illustration boxes */}
                      <div className="w-full h-24 rounded-lg bg-slate-950/80 mb-4 p-2 flex flex-col justify-between overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors">
                        {opt.id === 'MODERN' && (
                          <div className="h-full flex gap-1">
                            <div className="w-1/3 bg-violet-500/20 h-full rounded"></div>
                            <div className="w-2/3 flex flex-col gap-1">
                              <div className="w-full bg-slate-800 h-2.5 rounded"></div>
                              <div className="w-5/6 bg-slate-800 h-2 rounded"></div>
                              <div className="w-2/3 bg-slate-800 h-2 rounded mt-2"></div>
                              <div className="w-1/2 bg-slate-800 h-1.5 rounded"></div>
                            </div>
                          </div>
                        )}
                        {opt.id === 'PROFESSIONAL' && (
                          <div className="h-full flex flex-col gap-1.5 items-center justify-center">
                            <div className="w-1/2 bg-slate-700 h-3 rounded"></div>
                            <div className="w-11/12 border-b border-slate-800 my-1"></div>
                            <div className="w-full bg-slate-800 h-2 rounded"></div>
                            <div className="w-5/6 bg-slate-800 h-2 rounded"></div>
                          </div>
                        )}
                        {opt.id === 'MINIMAL' && (
                          <div className="h-full flex flex-col gap-1.5 text-left p-1">
                            <div className="w-2/3 bg-slate-700 h-3 rounded"></div>
                            <div className="w-full bg-slate-850 h-2 rounded mt-1"></div>
                            <div className="w-11/12 bg-slate-850 h-2 rounded"></div>
                            <div className="w-4/5 bg-slate-850 h-2 rounded"></div>
                          </div>
                        )}
                        {opt.id === 'EXECUTIVE' && (
                          <div className="h-full flex flex-col gap-1">
                            <div className="w-full bg-violet-900/30 h-4 rounded"></div>
                            <div className="w-full flex gap-1 mt-1">
                              <div className="w-1/2 flex flex-col gap-1">
                                <div className="w-full bg-slate-800 h-2 rounded"></div>
                                <div className="w-4/5 bg-slate-800 h-1.5 rounded"></div>
                              </div>
                              <div className="w-1/2 flex flex-col gap-1">
                                <div className="w-full bg-slate-800 h-2 rounded"></div>
                                <div className="w-4/5 bg-slate-800 h-1.5 rounded"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        {opt.id === 'ATS_FRIENDLY' && (
                          <div className="h-full flex flex-col gap-1 text-left p-1">
                            <div className="w-1/3 bg-slate-600 h-2.5 rounded"></div>
                            <div className="w-full bg-slate-800 h-1.5 rounded mt-1"></div>
                            <div className="w-full bg-slate-800 h-1.5 rounded"></div>
                            <div className="w-11/12 bg-slate-800 h-1.5 rounded"></div>
                          </div>
                        )}
                      </div>
                      
                      <h5 className="font-extrabold text-white text-sm">{opt.name}</h5>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-3xs uppercase font-extrabold text-violet-400">Layout Select</span>
                      {formData.template === opt.id && (
                        <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-ping"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stepper buttons */}
          <div className="flex gap-4 pt-8 border-t border-white/10 mt-8">
            {wizardStep > 1 ? (
              <button 
                type="button" 
                onClick={() => setWizardStep(wizardStep - 1)} 
                className="px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex-1"
              >
                Previous Step
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setView('landing')} 
                className="px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex-1"
              >
                Go Back
              </button>
            )}

            {wizardStep < 6 ? (
              <button 
                type="button" 
                onClick={() => {
                  if (wizardStep === 1 && !formData.fullName.trim()) {
                    setError('Full Name is required.');
                    return;
                  }
                  setError('');
                  setWizardStep(wizardStep + 1);
                }} 
                className="px-6 py-3 text-white bg-violet-600 hover:bg-violet-500 rounded-xl font-bold transition-all flex-1 shadow-lg shadow-violet-950/20"
              >
                Continue Next
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleGenerateOnboardingResume}
                className="px-8 py-3.5 text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-bold transition-all flex-1 shadow-xl shadow-violet-950/30 animate-pulse"
              >
                Generate Premium Resume ⚡
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  // View: DASHBOARD (Standard Metrics View)
  return (
    <div className="space-y-8 pb-12">
      <div className="grid xl:grid-cols-4 gap-6">
        <GlassCard title="Total Resumes" subtitle="Your active resume documents">
          <div className="text-5xl font-semibold text-white">{metrics?.totalResumes ?? '—'}</div>
        </GlassCard>
        <GlassCard title="ATS Analyses" subtitle="Job matching reports generated">
          <div className="text-5xl font-semibold text-white">{metrics?.totalAnalyses ?? '—'}</div>
        </GlassCard>
        <GlassCard title="Resume Downloads" subtitle="Downloaded resume files">
          <div className="text-5xl font-semibold text-white">{metrics?.resumeDownloads ?? '—'}</div>
        </GlassCard>
        <GlassCard title="Profile Completion" subtitle="How complete your profile is">
          <div className="text-5xl font-semibold text-white">{metrics?.profileCompletion ?? '—'}%</div>
        </GlassCard>
      </div>
      
      <GlassCard title="Recent Activity & Guides" subtitle="Action history summary">
        {error && <p className="text-red-300 mb-2">{error}</p>}
        <div className="space-y-3">
          <p className="text-slate-300">Review your latest resume drafts, ATS checks, and profile updates from the dashboard.</p>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => navigate('/resume-builder')}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all text-sm shadow-md"
            >
              Open Resume Editor 📝
            </button>
            <button 
              onClick={() => navigate('/ats-analyzer')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-bold transition-all text-sm"
            >
              Analyze Job Match 📊
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
