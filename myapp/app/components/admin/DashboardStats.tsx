'use client';

import React from 'react';
import { 
  Wallet, 
  Layers, 
  AlertTriangle, 
  AlertCircle, 
  Plus, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import styles from './DashboardStats.module.css';

export default function DashboardStats() {
  return (
    <div className={styles.dashboardContainer}>
      {/* Greeting Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.headerTitle}>Good Morning, Sarah</h1>
          <p className={styles.headerSubtitle}>Here is the status of your coffee shop inventory today.</p>
        </div>
        <button className={styles.newEntryBtn}>
          <Plus size={16} /> New Stock Entry
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className={styles.kpiGrid}>
        {/* Card 1: Total Value */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardIconBg}>
            <Wallet size={80} />
          </div>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.iconWrapper} ${styles.bgValue}`}>
              <Wallet size={18} />
            </div>
            <span className={`${styles.kpiCardBadge} ${styles.badgeValue}`}>
              <TrendingUp size={12} /> 2.4%
            </span>
          </div>
          <span className={styles.kpiCardLabel}>Total Value</span>
          <h2 className={styles.kpiCardValue}>$12,450</h2>
        </div>

        {/* Card 2: Total Ingredients */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardIconBg}>
            <Layers size={80} />
          </div>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.iconWrapper} ${styles.bgIngredients}`}>
              <Layers size={18} />
            </div>
            <span className={`${styles.kpiCardBadge} ${styles.badgeActive}`}>
              Active
            </span>
          </div>
          <span className={styles.kpiCardLabel}>Total Ingredients</span>
          <h2 className={styles.kpiCardValue}>42</h2>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className={`${styles.kpiCard} ${styles.kpiCardLeftLineAmber}`}>
          <div className={styles.kpiCardIconBg} style={{ color: '#fbbf24' }}>
            <AlertTriangle size={80} />
          </div>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.iconWrapper} ${styles.bgLowStock}`}>
              <AlertTriangle size={18} />
            </div>
            <span className={`${styles.kpiCardBadge} ${styles.badgeLowStock}`}>
              <TrendingUp size={12} /> 1
            </span>
          </div>
          <span className={styles.kpiCardLabel}>Low Stock Items</span>
          <h2 className={styles.kpiCardValue}>5</h2>
        </div>

        {/* Card 4: Out of Stock */}
        <div className={`${styles.kpiCard} ${styles.kpiCardLeftLineRose}`}>
          <div className={styles.kpiCardIconBg} style={{ color: '#f87171' }}>
            <AlertCircle size={80} />
          </div>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.iconWrapper} ${styles.bgOutOfStock}`}>
              <AlertCircle size={18} />
            </div>
            <span className={`${styles.kpiCardBadge} ${styles.badgeOutOfStock}`}>
              Requires Action
            </span>
          </div>
          <span className={styles.kpiCardLabel}>Out of Stock</span>
          <h2 className={styles.kpiCardValue}>2</h2>
        </div>
      </div>

      {/* Main Content Grid: Chart + Right Panel */}
      <div className={styles.mainGrid}>
        {/* Left Column: Inventory Value Overview Line Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Inventory Value Overview</h3>
            <div className={styles.chartSelect}>
              <span>Last 7 Days</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <svg viewBox="0 0 500 220" className="w-full h-auto overflow-visible">
              {/* Y Axis Gridlines & Labels */}
              <line x1="45" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1.5" />
              <text x="35" y="24" textAnchor="end" className="text-[9px] fill-slate-400 font-medium">$12,500</text>

              <line x1="45" y1="55" x2="490" y2="55" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1.5" />
              <text x="35" y="59" textAnchor="end" className="text-[9px] fill-slate-400 font-medium">$12,400</text>

              <line x1="45" y1="90" x2="490" y2="90" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1.5" />
              <text x="35" y="94" textAnchor="end" className="text-[9px] fill-slate-400 font-medium">$12,300</text>

              <line x1="45" y1="125" x2="490" y2="125" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1.5" />
              <text x="35" y="129" textAnchor="end" className="text-[9px] fill-slate-400 font-medium">$12,200</text>

              <line x1="45" y1="160" x2="490" y2="160" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1.5" />
              <text x="35" y="164" textAnchor="end" className="text-[9px] fill-slate-400 font-medium">$12,100</text>

              <line x1="45" y1="195" x2="490" y2="195" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1.5" />
              <text x="35" y="199" textAnchor="end" className="text-[9px] fill-slate-400 font-medium">$11,800</text>

              {/* Curved Line Gradient Fill */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b2013" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b2013" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M 60,160 C 100,120 130,125 160,125 C 190,125 220,160 250,195 C 280,195 310,20 350,25 C 390,30 420,60 450,60 C 470,60 485,25 490,25 L 490,195 L 60,195 Z" 
                fill="url(#chartGradient)" 
              />

              {/* Curved Line Stroke */}
              <path 
                d="M 60,160 C 100,120 130,125 160,125 C 190,125 220,160 250,195 C 280,195 310,20 350,25 C 390,30 420,60 450,60 C 470,60 485,25 490,25" 
                fill="none" 
                stroke="#3b2013" 
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Dots with Soft Shadow Effect */}
              <g filter="drop-shadow(0px 2px 2px rgba(59,32,19,0.3))">
                <circle cx="60" cy="160" r="4.5" fill="#3b2013" stroke="#fff" strokeWidth="2" />
                <circle cx="160" cy="125" r="4.5" fill="#3b2013" stroke="#fff" strokeWidth="2" />
                <circle cx="250" cy="195" r="4.5" fill="#3b2013" stroke="#fff" strokeWidth="2" />
                <circle cx="350" cy="25" r="4.5" fill="#3b2013" stroke="#fff" strokeWidth="2" />
                <circle cx="450" cy="60" r="4.5" fill="#3b2013" stroke="#fff" strokeWidth="2" />
                <circle cx="490" cy="25" r="4.5" fill="#3b2013" stroke="#fff" strokeWidth="2" />
              </g>

              {/* X Axis Labels */}
              <text x="60" y="215" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Mon</text>
              <text x="130" y="215" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Tue</text>
              <text x="200" y="215" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Wed</text>
              <text x="270" y="215" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Thu</text>
              <text x="340" y="215" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Fri</text>
              <text x="410" y="215" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Sat</text>
              <text x="490" y="215" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Sun</text>
            </svg>
          </div>
        </div>

        {/* Right Column: Mini Stats + Donut Chart */}
        <div className={styles.statsPanel}>
          {/* Top Row: Usage & Wastage */}
          <div className={styles.miniStatsGrid}>
            <div className={styles.miniCard}>
              <span className={`${styles.miniLabel} ${styles.miniLabelOlive}`}>Today's Usage</span>
              <div className={styles.miniValue}>$342.50</div>
              <span className={`${styles.miniBadge} ${styles.miniBadgeGreen}`}>
                <TrendingDown size={12} /> vs yesterday
              </span>
            </div>

            <div className={styles.miniCard}>
              <span className={`${styles.miniLabel} ${styles.miniLabelRose}`}>Monthly Wastage</span>
              <div className={`${styles.miniValue} ${styles.miniValueRose}`}>$128.00</div>
              <span className={`${styles.miniBadge} ${styles.miniBadgeRose}`}>
                <TrendingUp size={12} /> Needs attention
              </span>
            </div>
          </div>

          {/* Donut Chart Card */}
          <div className={styles.donutCard}>
            <h3 className={styles.donutTitle}>Stock Status</h3>
            
            <div className={styles.donutContainer}>
              <svg viewBox="0 0 160 160" className="w-40 h-40">
                {/* Background Ring */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#f8fafc" strokeWidth="20" />

                {/* In Stock (Green) - ~75% */}
                <circle 
                  cx="80" cy="80" r="60" fill="none" 
                  stroke="#7f8472" strokeWidth="20" 
                  strokeDasharray="282 377" 
                  strokeDashoffset="0"
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />

                {/* Low Stock (Yellow) - ~15% */}
                <circle 
                  cx="80" cy="80" r="60" fill="none" 
                  stroke="#fbbf24" strokeWidth="20" 
                  strokeDasharray="55 377" 
                  strokeDashoffset="-285"
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />

                {/* Out of Stock (Pink/Red) - ~10% */}
                <circle 
                  cx="80" cy="80" r="60" fill="none" 
                  stroke="#3b2013" strokeWidth="20" 
                  strokeDasharray="35 377" 
                  strokeDashoffset="-342"
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />
              </svg>
              {/* Center Text */}
              <div className={styles.donutCenterText}>
                <span className={styles.donutNumber}>49</span>
                <span className={styles.donutLabel}>Total</span>
              </div>
            </div>

            <div className={styles.donutLegends}>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.dotOlive}`}></span>
                In Stock
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.dotYellow}`}></span>
                Low Stock
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.dotBrown}`}></span>
                Out of Stock
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
