import React from 'react';

export default function ConsultationSection() {
  return (
    <section className="cs-section" style={{ paddingTop: '1rem', paddingBottom: '4.5rem' }}>
      <div className="container-xl">
        <div className="cs-posh-cta-card">
          <div className="cs-cta-badge">
            <span className="cs-badge-dot" style={{ background: '#38bdf8' }}></span>
            <span>Enterprise Data Architecture</span>
          </div>
          
          <h2 className="cs-cta-heading">
            Ready to Architect Your Modern Data Platform?
          </h2>
          
          <p className="cs-cta-subtext">
            Partner with Creative Web Technologies' leading data engineering architects. Unify fragmented data silos, automate enterprise ELT lakehouse pipelines, and unlock real-time executive foresight.
          </p>

          <div className="cs-cta-btn-row">
            <a href="#specialization" className="cs-btn-cta-light">
              <span>Explore Data Engineering</span>
              <span>→</span>
            </a>
            <a href="mailto:info@creativewebtechnology.com" className="cs-btn-cta-outline">
              <span>Contact Data Architects</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
