import React from 'react';

export default function Footer() {
  return (
    <footer className="cs-footer">
      <div className="cs-footer-inner">
        <div className="cs-footer-top">
          
          {/* Brand Info */}
          <div className="cs-footer-brand">
            <img 
              src="/cwt-logo.png" 
              alt="Creative Web Technologies"
              className="cs-footer-logo-img"
            />
            <p className="cs-footer-desc">
              Creative Web Technologies (CWT) architects enterprise Modern Data Platforms (MDP), high-velocity cloud lakehouses, automated data engineering pipelines, and intelligent executive analytics.
            </p>
            <div className="cs-footer-socials">
              <a href="https://www.linkedin.com/company/creative-web-technology/" target="_blank" rel="noreferrer" className="cs-social-icon" title="LinkedIn">in</a>
              <a href="https://www.facebook.com/CreativeWebTechnology" target="_blank" rel="noreferrer" className="cs-social-icon" title="Facebook">fb</a>
              <a href="https://www.instagram.com/creative_web_technology/" target="_blank" rel="noreferrer" className="cs-social-icon" title="Instagram">ig</a>
              <a href="https://www.youtube.com/@creativewebtechnology" target="_blank" rel="noreferrer" className="cs-social-icon" title="YouTube">yt</a>
            </div>
          </div>

          {/* Services Column - CWT Core Specializations */}
          <div className="cs-footer-col">
            <h4>Solutions &amp; Capabilities</h4>
            <ul className="cs-footer-links">
              <li><a href="#specialization">Modern Data Platforms (MDP)</a></li>
              <li><a href="#specialization">Azure Lakehouse &amp; Delta Lake</a></li>
              <li><a href="#specialization">Automated Ingestion &amp; ELT</a></li>
              <li><a href="#specialization">Synapse &amp; Databricks Compute</a></li>
              <li><a href="#specialization">Executive Power BI Dashboards</a></li>
              <li><a href="#specialization">Data Governance &amp; Security</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="cs-footer-col">
            <h4>Creative Web Technologies</h4>
            <ul className="cs-footer-links">
              <li><a href="#page-home">About CWT</a></li>
              <li><a href="#specialization">Core Specialization</a></li>
              <li><a href="#leadership">Executive Leadership</a></li>
              <li><a href="#specialization">MDP Architecture Lifecycle</a></li>
              <li><a href="#specialization">Enterprise Security</a></li>
              <li><a href="mailto:info@creativewebtechnology.com">Contact Data Architects</a></li>
            </ul>
          </div>

          {/* Locations & Delivery Footprint */}
          <div className="cs-footer-col">
            <h4>Locations &amp; Footprint</h4>
            <ul className="cs-footer-links">
              <li style={{ color: '#d0d5dd', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                📍 <strong>Global Engineering Headquarters:</strong><br />
                Colombo 03, Sri Lanka
              </li>
              <li style={{ color: '#d0d5dd', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                🌏 <strong>Strategic Enterprise Engagements:</strong><br />
                Australia, Central Asia &amp; Maldives
              </li>
              <li style={{ color: '#98a2b3', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                ISO 9001:2015 &amp; ISO 27001:2013 Certified
              </li>
            </ul>
          </div>

        </div>

        <div className="cs-footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Creative Web Technologies (Pvt) Ltd. All Rights Reserved. Enterprise Modern Data Platforms.
          </div>
          <div className="cs-footer-bottom-links">
            <a href="#page-home">Privacy Policy</a>
            <a href="#page-home">Terms of Service</a>
            <a href="#page-home">Data Governance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
