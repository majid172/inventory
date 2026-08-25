'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, BarChart3, ShieldCheck, Users, Zap, Globe, Star,
  ChevronRight, Check, ArrowRight, Bell, TrendingUp, Clock, Menu, X
} from 'lucide-react';
import styles from './landing.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_products: number;
  max_branches: number;
  max_sms: number;
  features: Record<string, unknown>;
}

const defaultPlans: Plan[] = [
  {
    id: 'starter', name: 'Starter', price_monthly: 49, price_yearly: 470,
    max_users: 3, max_products: 500, max_branches: 1, max_sms: 0,
    features: { posRegister: true, fefoExpiry: 'Basic', rxVerification: false, smsReceipts: false, purchaseOrders: false, support: 'Email Support' }
  },
  {
    id: 'pro', name: 'Pro', price_monthly: 149, price_yearly: 1430,
    max_users: 10, max_products: 5000, max_branches: 3, max_sms: 500,
    features: { posRegister: true, fefoExpiry: 'Advanced', rxVerification: true, smsReceipts: '500/mo', purchaseOrders: true, support: 'Priority Chat' }
  },
  {
    id: 'enterprise', name: 'Enterprise', price_monthly: 399, price_yearly: 3830,
    max_users: 999, max_products: 99999, max_branches: 99, max_sms: 9999,
    features: { posRegister: true, fefoExpiry: 'AI Reorder', rxVerification: true, smsReceipts: 'Unlimited', purchaseOrders: true, support: '24/7 Dedicated' }
  }
];

const featureRows = [
  { label: 'POS Cash Register',       starter: true,        pro: true,           enterprise: true },
  { label: 'Max Staff Users',         starter: '3 users',   pro: '10 users',     enterprise: 'Unlimited' },
  { label: 'Medicine Catalog',        starter: '500 items', pro: '5,000 items',  enterprise: 'Unlimited' },
  { label: 'Branch Outlets',          starter: '1 branch',  pro: '3 branches',   enterprise: 'Unlimited' },
  { label: 'Expiry (FEFO) Tracking',  starter: 'Basic',     pro: 'Advanced',     enterprise: 'AI-Powered' },
  { label: 'Rx Prescription Verify',  starter: false,       pro: true,           enterprise: true },
  { label: 'SMS Customer Receipts',   starter: false,       pro: '500/month',    enterprise: 'Unlimited' },
  { label: 'Purchase Orders',         starter: false,       pro: true,           enterprise: true },
  { label: 'Customer Support',        starter: 'Email',     pro: 'Priority Chat',enterprise: '24/7 Dedicated' },
];

const testimonials = [
  { name: 'Dr. Rashida Khan', role: 'Owner, MediPlus Pharmacy, Dhaka', text: 'PharmaCare transformed how we track expiry dates. The FEFO feature alone saved us from a major compliance issue.', stars: 5 },
  { name: 'Mohammad Hossain', role: 'Pharmacist, City Drug House', text: 'The POS is lightning fast. My cashier learned it in 30 minutes. Subscription billing is totally transparent.', stars: 5 },
  { name: 'Sarah Begum', role: 'Manager, HealthFirst Chain (3 branches)', text: 'Multi-branch support on the Enterprise plan means I can see all stores in one dashboard. Absolutely worth it.', stars: 5 },
];

const howItWorks = [
  { step: '01', icon: Package, title: 'Pick Your Plan', desc: 'Choose Starter, Pro, or Enterprise. Every plan includes a 14-day free trial — no credit card required.' },
  { step: '02', icon: Zap,     title: 'Register & Pay',  desc: 'Register your pharmacy in minutes. Secure payment via Stripe. Your account is activated instantly on success.' },
  { step: '03', icon: BarChart3, title: 'Go Live',       desc: 'Start adding medicines, running sales, and tracking expiry. Full inventory control from day one.' },
];

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/plans`)
      .then(r => r.json())
      .then(d => { if (d.success && d.plans?.length) setPlans(d.plans); })
      .catch(() => {});
  }, []);

  const getPrice = (plan: Plan) =>
    billing === 'yearly' ? plan.price_yearly : plan.price_monthly;

  const savings = (plan: Plan) =>
    Math.round(100 - (plan.price_yearly / (plan.price_monthly * 12)) * 100);

  return (
    <div className={styles.landing}>
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>💊</span>
            <span>Pharma<strong>Care</strong></span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">How it Works</a>
            <Link href="/login" className={styles.navLogin}>Log In</Link>
            <Link href="/register" className={styles.navCta}>Get Started Free</Link>
          </div>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing"  onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#how"      onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <Link href="/login"    onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className={styles.mobileCtaBtn}>Get Started Free →</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Trusted by 500+ Pharmacies Across Bangladesh
        </div>
        <h1 className={styles.heroTitle}>
          The <span className={styles.heroGradient}>Smart Pharmacy</span><br />
          Inventory Platform
        </h1>
        <p className={styles.heroSub}>
          Multi-tenant SaaS built for modern pharmacies. Full POS, FEFO expiry tracking,
          multi-branch, staff roles, and real-time reports — all in one subscription.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/register" className={styles.ctaPrimary}>
            Start Free 14-Day Trial <ArrowRight size={18} />
          </Link>
          <Link href="/super-admin/login" className={styles.ctaSecondary}>
            Admin Portal →
          </Link>
        </div>
        <div className={styles.heroStats}>
          {[['500+', 'Active Pharmacies'], ['99.9%', 'Uptime SLA'], ['50k+', 'Medicines Tracked'], ['24/7', 'Support']].map(([val, label]) => (
            <div key={label} className={styles.heroStat}>
              <span className={styles.heroStatVal}>{val}</span>
              <span className={styles.heroStatLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Dashboard preview card */}
        <div className={styles.heroPreview}>
          <div className={styles.previewBar}>
            <div className={styles.previewDots}><span /><span /><span /></div>
            <span className={styles.previewUrl}>dashboard.pharmacare.com</span>
          </div>
          <div className={styles.previewBody}>
            <div className={styles.previewKpis}>
              {[
                { icon: TrendingUp, label: "Today's Revenue", val: '৳12,480', up: '+8%', color: '#22c55e' },
                { icon: Package,    label: 'Total Products',  val: '1,284',   up: '+3 new', color: '#3b82f6' },
                { icon: Bell,       label: 'Low Stock Alerts',val: '7 items', up: 'Action needed', color: '#f59e0b' },
                { icon: Clock,      label: 'Near Expiry',     val: '12 batches',up: 'In 30 days',  color: '#ef4444' },
              ].map(kpi => (
                <div key={kpi.label} className={styles.previewKpi}>
                  <div className={styles.previewKpiIcon} style={{ background: kpi.color + '20' }}>
                    <kpi.icon size={18} color={kpi.color} />
                  </div>
                  <div>
                    <div className={styles.previewKpiVal}>{kpi.val}</div>
                    <div className={styles.previewKpiLabel}>{kpi.label}</div>
                    <div className={styles.previewKpiSub} style={{ color: kpi.color }}>{kpi.up}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Platform Features</div>
          <h2 className={styles.sectionTitle}>Everything a pharmacy needs</h2>
          <p className={styles.sectionSub}>Built specifically for Bangladesh&apos;s pharmacy market — in Bangla &amp; English.</p>
          <div className={styles.featuresGrid}>
            {[
              { icon: Package,     color:'#6366f1', title: 'Medicine Catalog',      desc: 'Track name, generic, category, manufacturer, batch, expiry, purchase & sale price per medicine.' },
              { icon: Zap,         color:'#f59e0b', title: 'POS Quick Sale',         desc: 'Lightning-fast point of sale. Barcode scan, customer search, cash/card/mobile payment, instant invoice.' },
              { icon: ShieldCheck, color:'#22c55e', title: 'FEFO Expiry Control',    desc: 'First Expired First Out batch tracking. Get alerts 90, 30, 7 days before expiry. Never lose a batch.' },
              { icon: Users,       color:'#3b82f6', title: 'Staff & Role Management',desc: 'Create Cashier, Pharmacist, Admin roles with granular permissions. Each role sees only what they need.' },
              { icon: Globe,       color:'#ec4899', title: 'Multi-Branch Support',   desc: 'Manage multiple pharmacy outlets from one account on the Enterprise plan. Unified reports.' },
              { icon: BarChart3,   color:'#14b8a6', title: 'Rich Reports',           desc: 'Daily/monthly sales, profit & loss, stock valuation, expiry report. Export anytime.' },
              { icon: TrendingUp,  color:'#8b5cf6', title: 'Subscription Billing',   desc: 'Monthly or yearly billing. Transparent invoices. Upgrade or downgrade any time. Grace period on expiry.' },
              { icon: Bell,        color:'#f97316', title: 'Smart Alerts',           desc: 'Low stock, near-expiry, subscription expiry, and due payment notifications in real-time.' },
            ].map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ background: f.color + '18', border: `1px solid ${f.color}30` }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how" className={styles.howSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Get Started</div>
          <h2 className={styles.sectionTitle}>Up and running in minutes</h2>
          <div className={styles.stepsGrid}>
            {howItWorks.map(step => (
              <div key={step.step} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.step}</div>
                <div className={styles.stepIcon}><step.icon size={28} color="#3b2013" /></div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Pricing</div>
          <h2 className={styles.sectionTitle}>Transparent, flat pricing</h2>
          <p className={styles.sectionSub}>No hidden fees. All plans include a 14-day free trial.</p>

          {/* Billing toggle */}
          <div className={styles.billingToggle}>
            <button
              className={billing === 'monthly' ? styles.toggleActive : styles.toggleBtn}
              onClick={() => setBilling('monthly')}>Monthly</button>
            <button
              className={billing === 'yearly' ? styles.toggleActive : styles.toggleBtn}
              onClick={() => setBilling('yearly')}>
              Yearly <span className={styles.savingsBadge}>Save up to 22%</span>
            </button>
          </div>

          <div className={styles.plansGrid}>
            {plans.map((plan, i) => {
              const isPro = plan.id === 'pro';
              return (
                <div key={plan.id} className={`${styles.planCard} ${isPro ? styles.planCardPopular : ''}`}>
                  {isPro && <div className={styles.popularBadge}>⚡ Most Popular</div>}
                  <div className={styles.planName}>{plan.name}</div>
                  <div className={styles.planPrice}>
                    <span className={styles.planCurrency}>$</span>
                    <span className={styles.planAmount}>{getPrice(plan)}</span>
                    <span className={styles.planPer}>/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                  {billing === 'yearly' && (
                    <div className={styles.yearlySaving}>Save {savings(plan)}% vs monthly</div>
                  )}
                  <div className={styles.planLimits}>
                    <span>👤 {plan.max_users >= 999 ? 'Unlimited' : plan.max_users} users</span>
                    <span>💊 {plan.max_products >= 99999 ? 'Unlimited' : plan.max_products.toLocaleString()} products</span>
                    <span>🏥 {plan.max_branches >= 99 ? 'Unlimited' : plan.max_branches} {plan.max_branches === 1 ? 'branch' : 'branches'}</span>
                  </div>
                  <ul className={styles.planFeatures}>
                    {Object.entries(plan.features || {}).map(([key, val]) => (
                      <li key={key} className={val === false ? styles.featureNo : ''}>
                        {val === false ? <X size={14} color="#94a3b8" /> : <Check size={14} color="#22c55e" />}
                        <span>{String(val === true ? key.replace(/([A-Z])/g, ' $1') : val)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/register?plan=${plan.id}&billing=${billing}`}
                    className={isPro ? styles.planCtaPrimary : styles.planCtaSecondary}>
                    Start Free Trial <ChevronRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Feature comparison table */}
          <div className={styles.compareTable}>
            <h3>Full Feature Comparison</h3>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    {plans.map(p => <th key={p.id} className={p.id === 'pro' ? styles.proCol : ''}>{p.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {featureRows.map(row => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      {(['starter','pro','enterprise'] as const).map(planId => {
                        const val = row[planId];
                        return (
                          <td key={planId} className={planId === 'pro' ? styles.proCol : ''}>
                            {val === true  ? <Check size={16} color="#22c55e" /> :
                             val === false ? <X     size={16} color="#94a3b8" /> :
                             <span className={styles.tableVal}>{val}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className={styles.testimonialSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Testimonials</div>
          <h2 className={styles.sectionTitle}>Loved by pharmacy owners</h2>
          <div className={styles.testimonialGrid}>
            {testimonials.map(t => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.stars}>{Array.from({length: t.stars}).map((_,i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}</div>
                <p className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <h2>Ready to modernize your pharmacy?</h2>
        <p>Join 500+ pharmacies already using PharmaCare. No credit card required for trial.</p>
        <div className={styles.ctaBannerBtns}>
          <Link href="/register" className={styles.ctaPrimary}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <Link href="/login" className={styles.ctaOutline}>Sign In to Existing Account</Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>💊</span>
              <span>Pharma<strong>Care</strong></span>
            </Link>
            <p>Multi-tenant pharmacy inventory SaaS. Built for Bangladesh&apos;s pharmacies.</p>
          </div>
          <div className={styles.footerLinks}>
            <div>
              <strong>Platform</strong>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link href="/register">Sign Up</Link>
              <Link href="/login">Log In</Link>
            </div>
            <div>
              <strong>Admin</strong>
              <Link href="/super-admin/login">Super Admin</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} PharmaCare SaaS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
