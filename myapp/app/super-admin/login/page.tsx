'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import styles from './superlogin.module.css';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { superAdminLogin, isLoading } = useAuthStore();
  const [email, setEmail] = useState('admin@pharmasaas.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await superAdminLogin(email, password);
    if (result.success) {
      router.push('/super-admin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.card}>
        <div className={styles.shieldWrap}>
          <Shield size={32} color="#fff" />
        </div>
        <h1>Super Admin Portal</h1>
        <p>Platform management access. Restricted access only.</p>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.pwWrap}>
              <input type={showPw ? 'text' : 'password'} placeholder="admin123" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
            </div>
          </div>
          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? <span className={styles.spinner}/> : <>Access Platform Panel →</>}
          </button>
        </form>

        <div className={styles.hint}>
          Demo: <code>admin@pharmasaas.com</code> / <code>admin123</code>
        </div>

        <Link href="/" className={styles.backLink}>← Back to Landing Page</Link>
      </div>
    </div>
  );
}
