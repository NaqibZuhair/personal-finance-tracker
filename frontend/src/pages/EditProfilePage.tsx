import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import PageHeader from '../components/ui/PageHeader';
import ButtonLink from '../components/ui/ButtonLink';
import Button from '../components/ui/Button';
import ErrorAlert from '../components/ui/ErrorAlert';

type ProfileUpdateResponse = {
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    waPhone: string | null;
  };
};

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [waPhone, setWaPhone] = useState(user?.waPhone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await apiClient<ProfileUpdateResponse>('/auth/profile', {
        method: 'PUT',
        body: {
          name,
          waPhone: waPhone ? waPhone.trim() : null,
        },
      });

      updateUser(response.data);
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update profile information',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit Profile Information"
          description="Update your personal identification and WhatsApp notification number."
        />
        <ButtonLink to="/profile" variant="secondary">
          Back to Profile
        </ButtonLink>
      </div>

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-400">
              Email address cannot be changed once registered.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              WhatsApp Number (Optional)
            </label>
            <input
              type="tel"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              placeholder="e.g., 08123456789 or 628123456789"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Used for OTP password resets and interacting with the AI financial assistant via WhatsApp.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <ButtonLink to="/profile" variant="secondary" className="px-5 py-2.5">
              Cancel
            </ButtonLink>
            <Button type="submit" disabled={isLoading} className="px-6 py-2.5">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
