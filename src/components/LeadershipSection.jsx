import React, { useState } from 'react';

export default function LeadershipSection() {
  const [showInfographic, setShowInfographic] = useState(false);

  // Australia & Global Leadership
  const globalPrograms = [
    {
      company: "Telstra Australia",
      role: "Senior Program Manager / Project Director",
      period: "2011 – 2020",
      accent: "#0064d2",
      logo: (
        <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#e8f3ff" />
          <path d="M12 12h16v5h-5.5v13h-5V17H12v-5z" fill="#0064d2" />
          <circle cx="27" cy="14" r="2.5" fill="#00b4f0" />
        </svg>
      ),
      deliveries: [
        { name: "Australian Dept of Defence", value: "AUD 500M" },
        { name: "Australian Dept of Health", value: "AUD 250M" },
        { name: "Qantas Telecommunications", value: "AUD 150M" }
      ]
    },
    {
      company: "Westpac Banking Group",
      role: "Senior Program Manager",
      period: "2018 – 2019",
      accent: "#d32f2f",
      logo: (
        <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#fdecee" />
          <path d="M9 13l4 14 3.5-10 3.5 10 3.5-10 3.5 10 4-14h-4l-2 9-3.5-9h-3l-3.5 9-2-9H9z" fill="#d32f2f" />
        </svg>
      ),
      scope: "Enterprise payments, core banking compliance, and mission-critical platform modernization."
    },
    {
      company: "IBM Global Services",
      role: "Enterprise Project Manager",
      period: "2008 – 2011",
      accent: "#054ada",
      logo: (
        <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#edf4fc" />
          <text x="20" y="25" fontFamily="'Outfit', Arial, sans-serif" fontSize="13" fontWeight="900" fill="#054ada" textAnchor="middle" letterSpacing="1">IBM</text>
        </svg>
      ),
      scope: "Directed the AUD 250M Telstra Core Enterprise Business Modernization program."
    }
  ];

  // Sri Lanka & Enterprise Leadership
  const localLeadership = [
    {
      company: "Creative Web Technologies",
      role: "Director & Chief Executive Officer",
      period: "2020 – Present",
      accent: "#103e7c",
      logo: (
        <img 
          src="/cwt-logo.png" 
          alt="Creative Web Technologies" 
          style={{ maxHeight: '22px', maxWidth: '75px', objectFit: 'contain', display: 'block' }}
        />
      ),
      scope: "Directing enterprise Modern Data Platforms, cloud engineering, and executive foresight across international markets."
    },
    {
      company: "People's Bank Sri Lanka",
      role: "Head of Technical Services",
      period: "2004 – 2008",
      accent: "#b45309",
      logo: (
        <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#fef3c7" />
          <circle cx="20" cy="20" r="11" stroke="#b45309" strokeWidth="2" fill="none" />
          <path d="M16 16h8v2h-8zm0 3h8v2h-8zm0 3h5v2h-5z" fill="#b45309" />
        </svg>
      ),
      scope: "Governed country-wide core banking infrastructure, enterprise data centers, and network stability across 700+ branches."
    },
    {
      company: "Informatics Group",
      role: "Software Development & Business Development",
      period: "1987 – 2004",
      accent: "#0d9488",
      logo: (
        <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#ccfbf1" />
          <polygon points="20 10 30 20 20 30 10 20" stroke="#0d9488" strokeWidth="2.5" fill="none" />
        </svg>
      ),
      scope: "Led architectural design, custom enterprise solutions, and multinational business software modernization."
    }
  ];

  // Academic & Global Ventures
  const academicAndVentures = [
    {
      title: "Academic Pedigree",
      items: [
        { institution: "Keele University (UK)", year: "1981", detail: "Higher Education in Computing Science" },
        { institution: "University of Colombo", year: "1980", detail: "Foundational Systems & Numerical Mathematics" },
        { institution: "Ananda College (Colombo)", year: "1970", detail: "Distinguished Academic Heritage" }
      ]
    },
    {
      title: "Global Ventures Founded",
      items: [
        { name: "Creative Web Technologies", role: "Director / CEO (2020–Present)" },
        { name: "DeepSati (Australia)", role: "Co-Founder / CEO (AI & IoT Innovation)" },
        { name: "Elevate Agro", role: "Co-Founder / CEO (Agri-tech Automation)" }
      ]
    }
  ];

  return (
    <section id="leadership" className="cs-section cs-section-leadership">
      <div className="container-xl">
        
        {/* Compact, Posh Executive Card */}
        <div className="cs-posh-ceo-card">
          <div className="cs-posh-ceo-layout">
            
            {/* Executive Headshot */}
            <div className="cs-posh-ceo-avatar-wrap">
              <img 
                src="/team/kolitha_headshot_circle.png" 
                alt="Kolitha De Silva - CEO" 
                className="cs-posh-ceo-img"
              />
              <span className="cs-posh-ceo-badge">CEO</span>
            </div>

            {/* Core Info & Quote */}
            <div className="cs-posh-ceo-body">
              <div className="cs-posh-ceo-header">
                <div>
                  <h3 className="cs-posh-ceo-name">Kolitha De Silva</h3>
                  <p className="cs-posh-ceo-role">Director &amp; Chief Executive Officer</p>
                </div>
                
                {/* Pedigree Chips */}
                <div className="cs-posh-ceo-tags">
                  <span className="cs-posh-pedigree-tag">Ex-Telstra</span>
                  <span className="cs-posh-pedigree-tag">Ex-Westpac</span>
                  <span className="cs-posh-pedigree-tag">Ex-IBM</span>
                </div>
              </div>

              {/* Minimalist 1-sentence Brief */}
              <p className="cs-posh-ceo-brief">
                Over 35 years steering mission-critical technology governance, Tier-1 digital delivery, and enterprise modernization across Australia and Sri Lanka.
              </p>

              {/* Minimalist Stats Strip */}
              <div className="cs-posh-ceo-metrics">
                <div className="cs-posh-metric">
                  <span className="cs-posh-val">35+ Years</span>
                  <span className="cs-posh-lbl">IT Leadership</span>
                </div>
                <span className="cs-posh-sep">/</span>
                <div className="cs-posh-metric">
                  <span className="cs-posh-val">$1B+</span>
                  <span className="cs-posh-lbl">Enterprise Programs</span>
                </div>
                <span className="cs-posh-sep">/</span>
                <div className="cs-posh-metric">
                  <span className="cs-posh-val">Australia &amp; SL</span>
                  <span className="cs-posh-lbl">Executive Footprint</span>
                </div>
              </div>
            </div>

            {/* Roadmap Trigger */}
            <div className="cs-posh-ceo-action">
              <button 
                type="button" 
                onClick={() => setShowInfographic(!showInfographic)}
                className="cs-posh-roadmap-btn"
                aria-expanded={showInfographic}
              >
                {showInfographic ? "Close Roadmap" : "Career Roadmap"}
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ transform: showInfographic ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

          </div>

          {/* Clean, Organized, Multi-Card Expansion (No Busy Slide Image) */}
          {showInfographic && (
            <div className="cs-posh-roadmap-expansion">
              
              <div className="cs-roadmap-top-bar">
                <div>
                  <span className="cs-posh-tag" style={{ margin: 0 }}>LEADERSHIP TRACK RECORD</span>
                  <h4 className="cs-roadmap-title">Executive Career &amp; Delivery Portfolio</h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowInfographic(false)} 
                  className="cs-roadmap-close-btn"
                >
                  ✕ Close
                </button>
              </div>

              {/* 3 Structured Columns */}
              <div className="cs-roadmap-grid">
                
                {/* Column 1: Australia Tier-1 */}
                <div className="cs-roadmap-col">
                  <div className="cs-roadmap-col-header">
                    <span className="cs-flag-icon">🇦🇺</span>
                    <span>Australia Tier-1 Leadership</span>
                  </div>

                  <div className="cs-roadmap-items">
                    {globalPrograms.map((item, idx) => (
                      <div key={idx} className="cs-roadmap-item-card">
                        <div className="cs-roadmap-item-top">
                          <div className="cs-roadmap-logo-box">{item.logo}</div>
                          <div className="cs-roadmap-meta">
                            <h5 className="cs-roadmap-company">{item.company}</h5>
                            <span className="cs-roadmap-role">{item.role}</span>
                            <span className="cs-roadmap-period">{item.period}</span>
                          </div>
                        </div>

                        {item.deliveries && (
                          <div className="cs-roadmap-deliveries">
                            {item.deliveries.map((d, dIdx) => (
                              <div key={dIdx} className="cs-delivery-pill">
                                <span className="cs-delivery-name">{d.name}</span>
                                <span className="cs-delivery-val">{d.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.scope && (
                          <p className="cs-roadmap-scope">{item.scope}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Sri Lanka & Banking */}
                <div className="cs-roadmap-col">
                  <div className="cs-roadmap-col-header">
                    <span className="cs-flag-icon">🇱🇰</span>
                    <span>Enterprise Leadership &amp; Banking</span>
                  </div>

                  <div className="cs-roadmap-items">
                    {localLeadership.map((item, idx) => (
                      <div key={idx} className="cs-roadmap-item-card">
                        <div className="cs-roadmap-item-top">
                          <div className="cs-roadmap-logo-box">{item.logo}</div>
                          <div className="cs-roadmap-meta">
                            <h5 className="cs-roadmap-company">{item.company}</h5>
                            <span className="cs-roadmap-role">{item.role}</span>
                            <span className="cs-roadmap-period">{item.period}</span>
                          </div>
                        </div>
                        <p className="cs-roadmap-scope">{item.scope}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Pedigree & Ventures */}
                <div className="cs-roadmap-col">
                  <div className="cs-roadmap-col-header">
                    <span className="cs-flag-icon">🎓</span>
                    <span>Pedigree &amp; Global Ventures</span>
                  </div>

                  <div className="cs-roadmap-items">
                    
                    {/* Academic Pedigree Card */}
                    <div className="cs-roadmap-item-card">
                      <h5 className="cs-roadmap-category-title">Academic Foundations</h5>
                      <div className="cs-pedigree-list">
                        {academicAndVentures[0].items.map((it, iIdx) => (
                          <div key={iIdx} className="cs-pedigree-entry">
                            <div className="cs-pedigree-inst">
                              <strong>{it.institution}</strong>
                              <span className="cs-pedigree-yr">{it.year}</span>
                            </div>
                            <span className="cs-pedigree-det">{it.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Global Ventures Card */}
                    <div className="cs-roadmap-item-card">
                      <h5 className="cs-roadmap-category-title">Global Ventures Founded</h5>
                      <div className="cs-ventures-list">
                        {academicAndVentures[1].items.map((it, vIdx) => (
                          <div key={vIdx} className="cs-venture-entry">
                            <span className="cs-venture-name">{it.name}</span>
                            <span className="cs-venture-role">{it.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Client & Partner Trust Ribbon */}
              <div className="cs-roadmap-clients-row">
                <span className="cs-clients-row-label">ENTERPRISE CLIENTS &amp; PARTNERS</span>
                <div className="cs-clients-logos-strip">
                  <div className="cs-client-badge-item">
                    <img src="/team/image126.png" alt="Allianz" className="cs-partner-logo-img" />
                  </div>
                  <div className="cs-client-badge-item">
                    <img src="/team/image134.png" alt="Dilmah" className="cs-partner-logo-img" />
                  </div>
                  <div className="cs-client-badge-item">
                    <img src="/team/image185.png" alt="Bank of Maldives" className="cs-partner-logo-img" />
                  </div>
                  <div className="cs-client-badge-item">
                    <span className="cs-client-text-logo">QANTAS</span>
                  </div>
                  <div className="cs-client-badge-item">
                    <span className="cs-client-text-logo">AIR ASTANA</span>
                  </div>
                  <div className="cs-client-badge-item">
                    <span className="cs-client-text-logo">SRI LANKA CUSTOMS</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
