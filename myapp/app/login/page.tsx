'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
      </div>

      <div className={styles.card}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span>💊</span>
          <span>Pharma<strong>Care</strong></span>
        </Link>

        <div className={styles.header}>
          <h1>Welcome back</h1>
          <p>Sign in to your pharmacy dashboard</p>
        </div>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email Address</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="owner@pharmacy.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <span className={styles.spinner} /> : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className={styles.divider}><span>Demo Credentials</span></div>
        <div className={styles.demoBox}>
          <div className={styles.demoRow}>
            <span>Tenant Admin</span>
            <code>robert@medicare-central.com / 1234</code>
          </div>
        </div>

        <div className={styles.footer}>
          <p>Don&apos;t have an account? <Link href="/register">Register your pharmacy →</Link></p>
          <p><Link href="/super-admin/login">Super Admin portal →</Link></p>
        </div>
      </div>
    </div>
  );
}
