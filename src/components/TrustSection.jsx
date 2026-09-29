import React from 'react';

export default function TrustSection({ trustItems }) {
  return (
    <section id="why-us" className="cs-section cs-section-subtle">
      <div className="container-xl">
        <div className="cs-section-header">
          <div className="cs-micro-tag">WHY CREATIVE WEB TECHNOLOGY</div>
          <h2 className="cs-section-title">
            Why Leading Global Enterprises <span className="text-royal">Trust Us</span>
          </h2>
          <p className="cs-section-subtitle">
            Backed by 5+ years of software engineering excellence, 700+ tech specialists, and deep Nordic client roots, we deliver resilient digital transformation with assured ROI.
          </p>
        </div>

        {/* 4 Clean, Simple & Posh Value Proposition Cards */}
        <div className="cs-trust-cards-grid">
          {trustItems.map((item, idx) => (
            <div key={idx} className="cs-posh-trust-card">
              <div className="cs-posh-trust-icon-box">
                {item.icon}
              </div>
              <h3 className="cs-posh-trust-title">{item.title}</h3>
              <p className="cs-posh-trust-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Accreditations & Multi-Cloud Architecture Strip */}
        <div className="cs-accreditation-ribbon">
          <div className="cs-accreditation-col">
            <div className="cs-accreditation-header">
              <span className="cs-gold-star">⭐</span>
              <h4>Microsoft Solutions Partner</h4>
            </div>
            <p className="cs-accreditation-desc">
              Microsoft Partner Network endorsed competencies with certified Azure Engineers across core enterprise disciplines:
            </p>
            <div className="cs-pill-wrap">
              {["Data Analytics", "DevOps", "Application Development", "Data Platform", "Application Integration"].map((skill, sIdx) => (
                <span key={sIdx} className="cs-pill-tag">
                  <span className="cs-check">✓</span> {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="cs-accreditation-divider"></div>

          <div className="cs-accreditation-col">
            <div className="cs-accreditation-header">
              <span className="cs-cloud-icon">☁️</span>
              <h4>Multi-Cloud & Hybrid Infrastructure</h4>
            </div>
            <p className="cs-accreditation-desc">
              Enterprise architectural flexibility spanning public clouds, private on-premises environments, and hybrid deployments:
            </p>
            <div className="cs-pill-wrap">
              {["Microsoft Azure", "Amazon Web Services (AWS)", "Oracle Cloud (OCI)", "Hybrid & On-Premises"].map((cloud, cIdx) => (
                <span key={cIdx} className="cs-pill-tag cs-pill-tag-alt">
                  {cloud}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
