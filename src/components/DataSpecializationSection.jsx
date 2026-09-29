import React from 'react';

export default function DataSpecializationSection() {
  const techPillars = [
    {
      category: "LAKEHOUSE & STORAGE",
      title: "Delta Lake & Cloud Lakehouse",
      description: "Enterprise lakehouse foundations unifying multi-source ERP, SQL, and transactional data with Delta ACID compliance, schema validation, and partitioned storage.",
      highlights: ["Azure Data Lake (ADLS)", "Delta Lake", "Apache Spark"],
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cs-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      )
    },
    {
      category: "PIPELINE ORCHESTRATION",
      title: "Automated Ingestion & ELT",
      description: "High-throughput batch and streaming ingestion pipelines with automated orchestration, data validation, zero-loss masking, and strict compliance governance.",
      highlights: ["Azure Data Factory", "Azure Synapse ELT", "Streaming Ingestion"],
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cs-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="6" height="6" rx="1"></rect>
          <rect x="16" y="3" width="6" height="6" rx="1"></rect>
          <rect x="9" y="15" width="6" height="6" rx="1"></rect>
          <path d="M5 9v3a2 2 0 0 0 2 2h5"></path>
          <path d="M19 9v3a2 2 0 0 1-2 2h-5"></path>
        </svg>
      )
    },
    {
      category: "SEMANTIC ANALYTICS & BI",
      title: "Semantic Modeling & Executive BI",
      description: "High-performance columnar analytics compute, enterprise semantic modeling, and embedded real-time dashboards delivering sub-second executive intelligence.",
      highlights: ["Power BI Embedded", "DAX Semantic Models", "Interactive Dashboards"],
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cs-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    }
  ];

  const methodologySteps = [
    { num: "01", name: "Ingestion", sub: "Automated ELT" },
    { num: "02", name: "Lakehouse", sub: "Delta Lake & Masking" },
    { num: "03", name: "Analytics", sub: "Synapse & Databricks" },
    { num: "04", name: "Intelligence", sub: "Executive Power BI" }
  ];

  return (
    <section id="specialization" className="cs-section cs-section-data-special">
      <div className="container-xl">
        
        {/* Compact Posh Section Header */}
        <div className="cs-posh-header">
          <span className="cs-posh-tag">CORE SPECIALIZATION</span>
          <h2 className="cs-posh-title">
            Where We Excel: <span className="text-royal">Modern Data Engineering</span>
          </h2>
          <p className="cs-posh-subtitle">
            Architecting enterprise Modern Data Platforms (MDP) with automated ELT, high-velocity lakehouses, and sub-second executive analytics.
          </p>
        </div>

        {/* 3 Compact Posh Tech Cards in CWT Theme */}
        <div className="cs-posh-grid">
          {techPillars.map((pillar, idx) => (
            <div key={idx} className="cs-posh-card">
              <div className="cs-posh-card-top">
                <span className="cs-posh-client-badge">
                  {pillar.category}
                </span>
                <div className="cs-posh-icon-box">
                  {pillar.icon}
                </div>
              </div>

              <h3 className="cs-posh-card-title">{pillar.title}</h3>
              <p className="cs-posh-card-desc">{pillar.description}</p>
              
              <div className="cs-posh-chips-row">
                {pillar.highlights.map((h, hIdx) => (
                  <span key={hIdx} className="cs-posh-chip">{h}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Posh MDP Architecture Strip */}
        <div className="cs-posh-mdp-strip">
          <div className="cs-posh-mdp-header">
            <div className="cs-posh-mdp-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="cs-posh-mdp-meta">
              <span className="cs-posh-mdp-tag">MDP LIFECYCLE</span>
              <span className="cs-posh-mdp-heading">End-to-End Enterprise Architecture</span>
            </div>
          </div>

          <div className="cs-posh-mdp-flow">
            {methodologySteps.map((m, sIdx) => (
              <React.Fragment key={sIdx}>
                <div className="cs-posh-mdp-step-card">
                  <span className="cs-posh-mdp-badge">{m.num}</span>
                  <div className="cs-posh-mdp-step-info">
                    <span className="cs-posh-mdp-name">{m.name}</span>
                    <span className="cs-posh-mdp-sub">{m.sub}</span>
                  </div>
                </div>
                {sIdx < methodologySteps.length - 1 && (
                  <div className="cs-posh-mdp-chevron" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
