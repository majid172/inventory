"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic Settings States
  const [storeName, setStoreName] = useState("Enterprise StarterKit");
  const [supportEmail, setSupportEmail] = useState("support@enterprise.com");
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)");
  const [currency, setCurrency] = useState("USD ($)");
  const [primaryColor, setPrimaryColor] = useState("#3b2013");

  // Email Config States
  const [smtpHost, setSmtpHost] = useState("smtp.enterprise.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [mailUser, setMailUser] = useState("notifications@enterprise.com");

  // SMS Config States
  const [smsGateway, setSmsGateway] = useState("Twilio");
  const [smsApiKey, setSmsApiKey] = useState("SK-XXXXXXXXXXXXXXXXXXXX");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Changes saved successfully!");
  };

  const handleReset = () => {
    if (activeTab === "basic") {
      setStoreName("Enterprise StarterKit");
      setSupportEmail("support@enterprise.com");
      setTimezone("UTC (Coordinated Universal Time)");
      setCurrency("USD ($)");
      setPrimaryColor("#3b2013");
    } else if (activeTab === "email") {
      setSmtpHost("smtp.enterprise.com");
      setSmtpPort("587");
      setMailUser("notifications@enterprise.com");
    } else {
      setSmsGateway("Twilio");
      setSmsApiKey("SK-XXXXXXXXXXXXXXXXXXXX");
    }
  };

  return (
    <div className="settings-container">
      {/* Settings Title */}
      <div>
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your application preferences and configurations.</p>
      </div>

      {/* Main Settings Panel */}
      <div className="settings-layout">
        {/* Left Tabs Box */}
        <div className="settings-tabs-box">
          <button
            onClick={() => setActiveTab("basic")}
            className={`settings-tab-btn ${activeTab === "basic" ? "isActive" : ""}`}
          >
            Basic/General Setting
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`settings-tab-btn ${activeTab === "email" ? "isActive" : ""}`}
          >
            Email Config
          </button>
          <button
            onClick={() => setActiveTab("sms")}
            className={`settings-tab-btn ${activeTab === "sms" ? "isActive" : ""}`}
          >
            SMS Config
          </button>
        </div>

        {/* Right Form Card */}
        <form onSubmit={handleSave} className="settings-form-card">
          {/* Card Header */}
          <div className="settings-card-header">
            <h2 className="settings-card-title">
              {activeTab === "basic" && "General Information"}
              {activeTab === "email" && "Email SMTP Configuration"}
              {activeTab === "sms" && "SMS Gateway Configuration"}
            </h2>
          </div>

          {/* Card Body */}
          <div className="settings-card-body">
            {activeTab === "basic" && (
              <div className="settings-form-grid">
                <div className="settings-field-group">
                  <label className="settings-field-label">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="settings-input"
                  />
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="settings-input"
                  />
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">Timezone</label>
                  <div className="settings-select-wrapper">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="settings-select"
                      style={{ appearance: 'none' }}
                    >
                      <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                      <option value="EST (Eastern Standard Time)">EST (Eastern Standard Time)</option>
                      <option value="GMT (Greenwich Mean Time)">GMT (Greenwich Mean Time)</option>
                      <option value="BST (Bangladesh Standard Time)">BST (Bangladesh Standard Time)</option>
                    </select>
                    <div className="settings-select-arrow">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">Currency</label>
                  <div className="settings-select-wrapper">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="settings-select"
                      style={{ appearance: 'none' }}
                    >
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                      <option value="BDT (৳)">BDT (৳)</option>
                    </select>
                    <div className="settings-select-arrow">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">Primary Theme Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="border border-slate-300 rounded p-0.5 w-10 h-8 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3b2013"
                      className="settings-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="settings-form-grid">
                <div className="settings-field-group">
                  <label className="settings-field-label">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="settings-input"
                  />
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">SMTP Port</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="settings-input"
                  />
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">Username/Email</label>
                  <input
                    type="text"
                    value={mailUser}
                    onChange={(e) => setMailUser(e.target.value)}
                    className="settings-input"
                  />
                </div>
              </div>
            )}

            {activeTab === "sms" && (
              <div className="settings-form-grid">
                <div className="settings-field-group">
                  <label className="settings-field-label">SMS Gateway</label>
                  <input
                    type="text"
                    value={smsGateway}
                    onChange={(e) => setSmsGateway(e.target.value)}
                    className="settings-input"
                  />
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">API Key</label>
                  <input
                    type="password"
                    value={smsApiKey}
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    className="settings-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="settings-card-footer">
            <button
              type="button"
              onClick={handleReset}
              className="settings-btn-reset"
            >
              Reset
            </button>
            <button
              type="submit"
              className="settings-btn-save"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
