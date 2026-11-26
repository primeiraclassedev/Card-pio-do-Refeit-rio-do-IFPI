'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg('E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.');
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-4 px-3">
      <main className="w-100" style={{ maxWidth: '420px' }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="ifpi-header text-white text-center p-4">
            <div
              className="bg-white text-ifpi-green rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm"
              style={{ width: '56px', height: '56px' }}
            >
              <i className="bi bi-shield-lock-fill fs-3"></i>
            </div>
            <h1 className="h5 fw-bold mb-1">Área Administrativa</h1>
            <p className="small opacity-75 mb-0">Refeitório IFPI • Campus Teresina Central</p>
          </div>

          <div className="card-body p-4">
            {errorMsg && (
              <div className="alert alert-danger small py-2" role="alert">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label small fw-semibold text-secondary">
                  E-mail Institucional
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="admin@ifpi.edu.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label small fw-semibold text-secondary">
                  Senha
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-key text-muted"></i>
                  </span>
                  <input
                    type="password"
                    id="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn bg-ifpi-green text-white w-100 py-2 fw-semibold rounded-3 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Autenticando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-1"></i> Entrar no Painel
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top">
              <Link href="/" className="small text-decoration-none text-secondary">
                <i className="bi bi-arrow-left me-1"></i> Voltar para o cardápio público
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-muted small mt-3 mb-0">
          Primeira Classe - Desenvolvimento de Sistemas
        </p>
      </main>
    </div>
  );
}