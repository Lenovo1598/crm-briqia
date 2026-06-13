'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar la contraseña');

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña actual</label>
        <input
          type={inputType}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nueva contraseña</label>
        <input
          type={inputType}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar nueva contraseña</label>
        <input
          type={inputType}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowPasswords((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
      >
        {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
        {showPasswords ? 'Ocultar' : 'Mostrar'} contraseñas
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Contraseña actualizada correctamente</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}
