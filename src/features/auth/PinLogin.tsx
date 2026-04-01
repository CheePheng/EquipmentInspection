import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, LogIn } from 'lucide-react';
import { queryByField } from '../../db/firestore';
import { useAuthStore } from './auth.store';
import { useToastStore } from '../../stores/toast.store';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { useTranslation } from '../../i18n/useTranslation';

export default function PinLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useTranslation();

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError(t('login.pinTooShort'));
      return;
    }

    try {
      const users = await queryByField<any>('users', 'pin', pin);
      const user = users[0] ?? null;
      if (!user) {
        setError(t('login.invalidPin'));
        setPin('');
        return;
      }

      login(user);
      addToast(`Welcome, ${user.name}`);

      // Navigate to role-based home
      switch (user.role) {
        case 'worker':
          navigate('/machines');
          break;
        case 'supervisor':
          navigate('/dashboard');
          break;
        default:
          navigate('/machines');
      }
    } catch {
      setError(t('login.failed'));
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 relative">
      {/* Language toggle — top-right */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      {/* Logo / Title */}
      <div className="mb-10 text-center">
        {/* Brand name with amber accent */}
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-amber-primary">CCT</span>
          <span className="text-text-primary ml-2">Field Ops</span>
        </h1>
        {/* Subtle amber glow behind title */}
        <div className="w-24 h-1 bg-amber-primary/60 rounded-full mx-auto mt-3 shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
        {/* Subtitle */}
        <p className="text-text-secondary mt-4 text-sm tracking-wide">
          {t('login.subtitle')}
        </p>
        {/* PIN prompt */}
        <p className="text-text-muted mt-2 text-xs">
          {t('login.enterPin')}
        </p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-3 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? 'bg-amber-primary border-amber-primary scale-110'
                : 'border-border bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-status-critical text-sm mb-4">{error}</p>
      )}

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-6">
        {digits.map((digit, i) => {
          if (digit === '') return <div key={i} />;
          if (digit === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="h-14 rounded-xl bg-slate-dark flex items-center justify-center active:bg-elevated transition-colors"
              >
                <Delete className="w-5 h-5 text-text-secondary" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-xl bg-slate-dark text-text-primary text-xl font-medium active:bg-elevated transition-colors"
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={pin.length < 4}
        className="w-full max-w-[280px] h-12 rounded-xl bg-amber-primary text-obsidian font-semibold flex items-center justify-center gap-2 disabled:opacity-40 active:bg-amber-pressed transition-colors"
      >
        <LogIn className="w-5 h-5" />
        {t('login.signIn')}
      </button>
    </div>
  );
}
