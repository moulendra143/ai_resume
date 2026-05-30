import { useEffect, useState } from 'react';
import GlassCard from '../components/shared/GlassCard';
import api from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    bio: '',
    profilePhoto: '',
    notificationEmail: true
  });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc).');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingPhoto(true);
    setError('');
    
    try {
      const response = await api.post('/user/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Determine base URL if response URL is relative
      let photoUrl = response.data.url;
      if (photoUrl.startsWith('/')) {
        const baseURL = api.defaults.baseURL.replace('/api', '');
        photoUrl = baseURL + photoUrl;
      }
      
      setForm({ ...form, profilePhoto: photoUrl });
      setMessage('Profile photo uploaded successfully. Click Save changes to apply.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const loadProfile = () => {
    api.get('/user/profile')
      .then((response) => {
        setProfile(response.data);
        setForm({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          linkedinUrl: response.data.linkedinUrl || '',
          githubUrl: response.data.githubUrl || '',
          portfolioUrl: response.data.portfolioUrl || '',
          bio: response.data.bio || '',
          profilePhoto: response.data.profilePhoto || '',
          notificationEmail: response.data.notificationEmail !== false,
        });
      })
      .catch(() => setError('Unable to load profile.'));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const response = await api.put('/user/profile', form);
      setProfile(response.data);
      setEditing(false);
      setMessage('Profile updated successfully.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      const payload = {
        email: form.email,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      };
      await api.put('/user/password', payload);
      setMessage('Password updated successfully.');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      return;
    }
    try {
      await api.delete('/user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      setError('Unable to delete account.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <GlassCard title="Profile" subtitle="Manage your account details">
        {profile ? (
          <div className="space-y-6">
            {message && <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-100">{message}</div>}
            {error && <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-100">{error}</div>}

            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-white/10">
              <div className="w-24 h-24 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {form.profilePhoto ? (
                  <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  form.fullName ? form.fullName.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white">{profile.fullName}</h3>
                <p className="text-slate-400">{profile.email}</p>
                <p className="text-xs text-violet-400 mt-1 uppercase tracking-wider">Account Active</p>
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                <h4 className="text-lg text-white font-semibold border-b border-white/10 pb-2">Personal info</h4>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">Phone:</span>{profile.phone || 'Not specified'}</p>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">Location:</span>{profile.address || 'Not specified'}</p>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">Bio:</span>{profile.bio || 'Not specified'}</p>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                <h4 className="text-lg text-white font-semibold border-b border-white/10 pb-2">Links & Settings</h4>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">LinkedIn:</span>{profile.linkedinUrl || '–'}</p>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">GitHub:</span>{profile.githubUrl || '–'}</p>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">Portfolio:</span>{profile.portfolioUrl ? <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">{profile.portfolioUrl}</a> : '–'}</p>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">LeetCode:</span>{profile.leetcodeUrl ? <a href={profile.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">{profile.leetcodeUrl}</a> : '–'}</p>
                <p className="text-slate-300"><span className="text-slate-500 text-sm block">Email notifications:</span>{profile.notificationEmail ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>

            <button onClick={() => setEditing((prev) => !prev)} className="btn-primary px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold">
              {editing ? 'Cancel' : 'Edit profile'}
            </button>

            {editing && (
              <div className="space-y-6 pt-6 border-t border-white/10">
                <h4 className="text-xl font-bold text-white">Edit Profile Details</h4>
                <div className="grid xl:grid-cols-2 gap-4">
                  <label className="block text-slate-300">
                    Full name
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                  </label>
                  <label className="block text-slate-300">
                    Profile Photo
                    <div className="mt-2 flex items-center gap-4">
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/jpg, image/webp" 
                        onChange={handlePhotoUpload} 
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" 
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto && <span className="text-sm text-violet-400">Uploading...</span>}
                    </div>
                  </label>
                </div>
                <div className="grid xl:grid-cols-2 gap-4">
                  <label className="block text-slate-300">
                    Phone
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                  </label>
                  <label className="block text-slate-300">
                    Location
                    <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                  </label>
                </div>
                <div className="grid xl:grid-cols-2 gap-4">
                  <label className="block text-slate-300">
                    LinkedIn URL
                    <input type="url" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                  </label>
                  <label className="block text-slate-300">
                    GitHub URL
                    <input type="url" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                  </label>
                </div>
                <div className="grid xl:grid-cols-2 gap-4">
                  <label className="block text-slate-300">
                    Portfolio URL
                    <input type="url" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} placeholder="https://yourportfolio.com" className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                  </label>
                  <label className="block text-slate-300">
                    LeetCode URL
                    <input type="url" value={form.leetcodeUrl} onChange={(e) => setForm({ ...form, leetcodeUrl: e.target.value })} placeholder="https://leetcode.com/username" className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                  </label>
                </div>
                <label className="block text-slate-300">
                  Bio description
                  <textarea rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </label>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="notificationEmail" checked={form.notificationEmail} onChange={(e) => setForm({ ...form, notificationEmail: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-white/5 text-violet-600 focus:ring-0 focus:ring-offset-0" />
                  <label htmlFor="notificationEmail" className="text-slate-300 select-none">Send me email updates & alerts</label>
                </div>
                <button onClick={handleSave} className="btn-primary w-full py-3 text-white bg-violet-600 hover:bg-violet-500 rounded-2xl font-bold transition-all">
                  Save changes
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-300">Loading profile...</p>
        )}
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard title="Security" subtitle="Update account password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <label className="block text-slate-300">
              Old Password
              <div className="relative mt-2">
                <input type={showOldPassword ? 'text' : 'password'} required value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 pr-12" />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </label>
            <label className="block text-slate-300">
              New Password
              <div className="relative mt-2">
                <input type={showNewPassword ? 'text' : 'password'} required value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 pr-12" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </label>
            <label className="block text-slate-300">
              Confirm New Password
              <div className="relative mt-2">
                <input type={showConfirmPassword ? 'text' : 'password'} required value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 pr-12" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </label>
            <button type="submit" className="w-full py-3 text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-semibold transition-all">
              Change password
            </button>
          </form>
        </GlassCard>

        <GlassCard title="Close Account" subtitle="Permanently delete user profile" className="border-red-500/20">
          <div className="space-y-6">
            <p className="text-slate-400 text-sm leading-relaxed">
              Once you delete your account, there is no going back. All of your resumes, generated versions, activity logs, and matching results will be wiped from our databases.
            </p>
            <button onClick={handleDeleteAccount} className="w-full py-3 text-white bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-2xl font-semibold transition-all">
              Delete Account
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
