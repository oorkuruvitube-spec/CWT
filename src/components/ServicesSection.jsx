import React from 'react';

export default function ServicesSection({ services, proprietaryProducts }) {
  return (
    <section id="services" className="cs-section">
      <div className="container-xl">
        <div className="cs-section-header">
          <div className="cs-micro-tag">CORE CAPABILITIES</div>
          <h2 className="cs-section-title">
            Enterprise Engineering & <span className="text-royal">Data Modernization</span>
          </h2>
          <p className="cs-section-subtitle">
            From Modern Data Platforms on Azure to dedicated agile squads and clinical hospital systems, we deliver predictable, high-velocity engineering outcomes.
          </p>
        </div>

        {/* 6 Core Service Pillars */}
        <div className="cs-posh-services-grid">
          {services.map((srv, idx) => (
            <div key={idx} className="cs-posh-service-tile">
              <div className="cs-service-head">
                <div className="cs-posh-service-icon">{srv.icon}</div>
                <h3 className="cs-service-title">{srv.title}</h3>
              </div>
              <p className="cs-service-desc">{srv.desc}</p>
              <div className="cs-service-tags-wrap">
                {srv.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="cs-posh-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Proprietary IP & Innovation Showcase */}
        {proprietaryProducts && proprietaryProducts.length > 0 && (
          <div className="cs-posh-products-section">
            <div className="cs-section-header-compact">
              <div className="cs-micro-tag">PROPRIETARY R&D</div>
              <h3 className="cs-compact-title">
                Specialized Enterprise Platforms Built by Creative
              </h3>
              <p className="cs-compact-desc">
                Commercial-grade software assets engineered by our R&D teams to accelerate enterprise capability.
              </p>
            </div>

            <div className="cs-posh-products-grid">
              {proprietaryProducts.map((prod, pIdx) => (
                <div key={pIdx} className="cs-posh-product-card">
                  <div className="cs-product-top">
                    <div>
                      <span className="cs-product-badge">{prod.badge}</span>
                      <h4 className="cs-product-name">{prod.name}</h4>
                    </div>
                  </div>
                  <div className="cs-product-tagline">{prod.tagline}</div>
                  <p className="cs-product-desc">{prod.desc}</p>
                  <div className="cs-product-footer">
                    <span className="cs-product-link">
                      Enterprise Deployment Ready <span>→</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
