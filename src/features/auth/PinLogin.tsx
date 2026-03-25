import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, LogIn } from 'lucide-react';
import { db } from '../../db/database';
import { useAuthStore } from './auth.store';
import { useToastStore } from '../../stores/toast.store';

export default function PinLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);

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
      setError('Enter at least 4 digits');
      return;
    }

    try {
      const user = await db.users.where('pin').equals(pin).first();
      if (!user) {
        setError('Invalid PIN');
        setPin('');
        return;
      }

      login(user);
      addToast(`Welcome, ${user.name}`);

      // Navigate to role-based home
      switch (user.role) {
        case 'operator':
          navigate('/machines');
          break;
        case 'mechanic':
          navigate('/repairs');
          break;
        case 'supervisor':
          navigate('/dashboard');
          break;
        default:
          navigate('/machines');
      }
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6">
      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-text-primary">CCT FieldOps</h1>
        <p className="text-text-secondary mt-2 text-sm">Enter your PIN to continue</p>
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
        Sign In
      </button>
    </div>
  );
}
