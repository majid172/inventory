'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft, ArrowRight, Building2, CreditCard, User, CheckCircle } from 'lucide-react';
import styles from './register.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, unknown>;
}

const defaultPlans: Plan[] = [
  { id: 'starter', name: 'Starter', price_monthly: 49, price_yearly: 470, features: {} },
  { id: 'pro',     name: 'Pro',     price_monthly: 149, price_yearly: 1430, features: {} },
  { id: 'enterprise', name: 'Enterprise', price_monthly: 399, price_yearly: 3830, features: {} },
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [billing, setBilling] = useState<'monthly'|'yearly'>((params.get('billing') as 'monthly'|'yearly') || 'monthly');
  const [selectedPlan, setSelectedPlan] = useState(params.get('plan') || 'pro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tenantId, setTenantId] = useState<number | null>(null);

  const [form, setForm] = useState({
    storeName: '', ownerName: '', email: '', phone: '', address: '', password: '', confirm: ''
  });

  useEffect(() => {
    fetch(`${API}/plans`).then(r => r.json()).then(d => {
      if (d.success && d.plans?.length) setPlans(d.plans);
    }).catch(() => {});
  }, []);

  const plan = plans.find(p => p.id === selectedPlan) || plans[1];
  const price = billing === 'yearly' ? plan?.price_yearly : plan?.price_monthly;

  const stepTitles = ['Choose Plan', 'Business Info', 'Payment', 'Success'];

  // Step 2: Submit registration
  const handleRegister = async () => {
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/register-tenant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: form.storeName, ownerName: form.ownerName,
          email: form.email, phone: form.phone, address: form.address,
          password: form.password, planId: selectedPlan, billingCycle: billing
        })
      });
      const data = await res.json();
      if (data.success) {
        setTenantId(data.tenantId);
        setStep(3);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch { setError('Network error. Please try again.'); }
    setIsLoading(false);
  };

  // Step 3: Simulate payment (in prod: Stripe redirect)
  const handlePayment = async () => {
    setIsLoading(true); setError('');
    // Simulate payment success — in production, redirect to Stripe Checkout
    await new Promise(r => setTimeout(r, 1500));
    // Activate tenant
    try {
      await fetch(`${API}/super-admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'trial', subscription_end: new Date(Date.now() + 14*86400000).toISOString().split('T')[0] })
      });
    } catch {}
    setStep(4);
    setIsLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}><div className={styles.bgBlob} /></div>

      {/* Header */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.logo}>💊 Pharma<strong>Care</strong></Link>
        <Link href="/login" className={styles.loginLink}>Already subscribed? Sign In →</Link>
      </div>

      <div className={styles.container}>
        {/* Progress stepper */}
        <div className={styles.stepper}>
          {stepTitles.map((title, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={title} className={`${styles.stepItem} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}>
                <div className={styles.stepCircle}>
                  {done ? <Check size={14} /> : num}
                </div>
                <span className={styles.stepLabel}>{title}</span>
                {i < stepTitles.length - 1 && <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Plan Selection ── */}
        {step === 1 && (
          <div className={styles.card}>
            <h2>Choose Your Plan</h2>
            <p className={styles.stepSub}>Start with a 14-day free trial. No credit card required yet.</p>

            <div className={styles.billingSwitch}>
              <button className={billing==='monthly' ? styles.switchActive : styles.switchBtn} onClick={() => setBilling('monthly')}>Monthly</button>
              <button className={billing==='yearly'  ? styles.switchActive : styles.switchBtn} onClick={() => setBilling('yearly')}>
                Yearly <span className={styles.saveBadge}>Save 20%</span>
              </button>
            </div>

            <div className={styles.plansRow}>
              {plans.map(p => (
                <div key={p.id}
                  className={`${styles.planOption} ${selectedPlan === p.id ? styles.planSelected : ''}`}
                  onClick={() => setSelectedPlan(p.id)}>
                  <div className={styles.planCheckbox}>
                    {selectedPlan === p.id ? <Check size={12} /> : null}
                  </div>
                  <div className={styles.planInfo}>
                    <div className={styles.planOptionName}>{p.name}</div>
                    <div className={styles.planOptionPrice}>
                      ${billing === 'yearly' ? p.price_yearly : p.price_monthly}
                      <span>/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                    </div>
                  </div>
                  {p.id === 'pro' && <span className={styles.popularTag}>Popular</span>}
                </div>
              ))}
            </div>

            <button className={styles.nextBtn} onClick={() => setStep(2)}>
              Continue with {plan?.name} Plan <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 2: Business Info ── */}
        {step === 2 && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
            <h2>Your Pharmacy Details</h2>
            <p className={styles.stepSub}>Tell us about your pharmacy. This will be your account identity.</p>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}><Building2 size={16} /> Business Information</div>
                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label>Pharmacy / Business Name *</label>
                    <input placeholder="e.g. MediCare Central Pharmacy" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <label>Business Address</label>
                    <input placeholder="123 Pharmacy Lane, Dhaka" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}><User size={16} /> Owner / Admin Account</div>
                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label>Owner Full Name *</label>
                    <input placeholder="Dr. Rahman Khan" value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <label>Email Address *</label>
                    <input type="email" placeholder="owner@pharmacy.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <label>Phone Number</label>
                    <input placeholder="+880 17..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className={styles.field}>
                    <label>Password *</label>
                    <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <label>Confirm Password *</label>
                    <input type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
                  </div>
                </div>
              </div>
            </div>

            <button
              className={styles.nextBtn}
              onClick={handleRegister}
              disabled={isLoading || !form.storeName || !form.ownerName || !form.email || !form.password}>
              {isLoading ? <span className={styles.spinner} /> : <>Continue to Payment <ArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ── Step 3: Payment ── */}
        {step === 3 && (
          <div className={styles.card}>
            <button className={styles.backBtn} onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
            <h2>Complete Your Subscription</h2>
            <p className={styles.stepSub}>Your 14-day free trial starts today. Cancel any time before trial ends.</p>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>Plan</span>
                <strong>{plan?.name}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Billing Cycle</span>
                <strong>{billing === 'yearly' ? 'Yearly' : 'Monthly'}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Trial Period</span>
                <strong>14 days FREE</strong>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Due After Trial</span>
                <strong>${price}/{billing === 'yearly' ? 'year' : 'month'}</strong>
              </div>
            </div>

            <div className={styles.paymentBox}>
              <div className={styles.paymentIcon}><CreditCard size={24} color="#3b2013" /></div>
              <div className={styles.paymentInfo}>
                <strong>Stripe Secure Payment</strong>
                <p>Your card will only be charged after the 14-day trial ends. You can cancel anytime before then.</p>
              </div>
            </div>

            <div className={styles.cardFields}>
              <div className={styles.field}>
                <label>Card Number</label>
                <input placeholder="4242 4242 4242 4242" />
              </div>
              <div className={styles.cardRow}>
                <div className={styles.field}>
                  <label>Expiry</label>
                  <input placeholder="MM/YY" />
                </div>
                <div className={styles.field}>
                  <label>CVC</label>
                  <input placeholder="123" />
                </div>
              </div>
            </div>

            <button className={styles.nextBtn} onClick={handlePayment} disabled={isLoading}>
              {isLoading ? <span className={styles.spinner} /> : 'Start Free Trial →'}
            </button>
            <p className={styles.secureNote}>🔒 Secured by Stripe. 256-bit SSL encryption.</p>
          </div>
        )}

        {/* ── Step 4: Success ── */}
        {step === 4 && (
          <div className={`${styles.card} ${styles.successCard}`}>
            <div className={styles.successIcon}><CheckCircle size={56} color="#22c55e" /></div>
            <h2>You&apos;re all set! 🎉</h2>
            <p>Your pharmacy account has been created. Your 14-day free trial is now active.</p>
            <div className={styles.successDetails}>
              <div><strong>Plan:</strong> {plan?.name}</div>
              <div><strong>Email:</strong> {form.email}</div>
              <div><strong>Trial Ends:</strong> {new Date(Date.now() + 14*86400000).toLocaleDateString()}</div>
            </div>
            <button className={styles.nextBtn} onClick={() => router.push('/login')}>
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<div>Loading...</div>}><RegisterForm /></Suspense>;
}
