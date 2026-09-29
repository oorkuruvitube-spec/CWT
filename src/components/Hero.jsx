import React, { useState, useEffect } from 'react';

export default function Hero({ companyMetrics, clientSectors, featuredProjects }) {
  const projects = featuredProjects && featuredProjects.length > 0 ? featuredProjects : [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatically slide every 3.5 seconds, pause on hover
  useEffect(() => {
    if (projects.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projects.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [projects.length, isPaused, currentSlide]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const activeProject = projects[currentSlide] || null;

  return (
    <section id="home" className="cs-hero-section">
      <div className="container-xl">
        
        {/* Posh Glassmorphic Dual-Dot Badge */}
        <div className="cs-portal-badge">
          <span className="cs-badge-item">
            <span className="cs-badge-dot-wrap">
              <span className="cs-badge-dot"></span>
            </span>
            <span>Creative Web Technology</span>
          </span>
          <span className="cs-badge-item">
            <span className="cs-badge-dot-wrap">
              <span className="cs-badge-dot"></span>
            </span>
            <span>Together Across the World</span>
          </span>
        </div>

        {/* Elegant Editorial Title */}
        <h1 className="cs-hero-title">
          Beyond Business,<br />
          <span className="title-highlight">We Built Together</span>
        </h1>

        <p className="cs-hero-subtitle">
          5+ years of building high-performance tech teams, modern data platforms, and cloud solutions worldwide.
        </p>

        {/* Posh CTA Row */}
        <div className="cs-hero-cta-row">
          <a href="#services" className="cs-btn-hero-primary">
            <span>Explore Enterprise Solutions</span>
            <span>→</span>
          </a>
          <a href="#stories" className="cs-btn-hero-secondary">
            <span>Client Case Studies</span>
          </a>
          <a href="#why-us" className="cs-btn-hero-secondary">
            <span>Why Leaders Trust Us</span>
          </a>
        </div>

        {/* Team Photo Banner with Black Shade Overlay */}
        <div className="cs-hero-banner-wrapper">
          <img 
            src="/team.png" 
            alt="Creative Web Technology Engineering Team" 
            className="cs-hero-banner-img"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/team.png'; }}
          />
          <div className="cs-hero-banner-overlay">
            <div className="cs-hero-banner-content">
              <h2>Proven Impact for National & Global Leaders</h2>
              <p>Engineered Sri Lanka Customs' DAT & CDNS platforms for 30,000+ concurrent users, modernized Azure Data Platforms for Sri Lankan Airlines & Air Astana, and power Nordic healthcare for 100,000+ daily clinicians.</p>
            </div>
          </div>
        </div>

        {/* Posh Executive Metrics Ribbon */}
        <div className="cs-executive-stats-ribbon">
          {companyMetrics.map((metric, idx) => (
            <div key={metric.id || idx} className="cs-stat-item">
              <div className="cs-stat-number">{metric.num}</div>
              <div className="cs-stat-label">{metric.label}</div>
              <div className="cs-stat-subtext">{metric.detail}</div>
            </div>
          ))}
        </div>

        {/* Auto-Advancing Real Project Showcase Slider (Every 3.5s with Black Shade Overlay) */}
        {activeProject && (
          <div 
            className="cs-project-slider-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Image of the Project Slide */}
            <div className="cs-slider-bg-wrapper">
              <img 
                key={activeProject.id}
                src={activeProject.image} 
                alt={activeProject.title}
                className="cs-slider-bg-img"
                style={{ objectPosition: activeProject.objectPosition || 'right center' }}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/team.png'; }}
              />
            </div>

            {/* Black Shade Gradient Overlay */}
            <div className="cs-slider-shade-overlay">
              
              {/* Top Navigation Bar: Minimalist Posh Badges */}
              <div className="cs-slider-top-nav">
                <div className="cs-slider-top-badge">
                  <span className="cs-badge-dot" style={{ background: '#38bdf8' }}></span>
                  <span>ENTERPRISE SHOWCASE</span>
                  <span className="cs-slider-counter">0{currentSlide + 1} / 0{projects.length}</span>
                </div>

                <div className="cs-slider-client-badge">
                  {activeProject.client}
                </div>
              </div>

              {/* Bottom Content Area: Clean, Posh, High-Impact Summary */}
              <div className="cs-slider-bottom-content">
                
                <div className="cs-slider-sector-tag">
                  {activeProject.sector}
                </div>

                <h3 className="cs-slider-heading">
                  {activeProject.title}
                </h3>

                <p className="cs-slider-desc">
                  {activeProject.description}
                </p>

                {/* Sleek Highlight Chips */}
                <div className="cs-slider-chips-row">
                  {activeProject.impactStats && activeProject.impactStats.slice(0, 3).map((stat, sIdx) => (
                    <span key={sIdx} className="cs-slider-stat-chip">
                      <span className="cs-chip-check">✓</span>
                      <span>{stat}</span>
                    </span>
                  ))}
                </div>

                {/* Footer Controls: Sleek Progress Bar, Dots, and Arrows */}
                <div className="cs-slider-footer-controls">
                  <div className="cs-slider-progress-track">
                    <div 
                      key={currentSlide + (isPaused ? '-paused' : '-running')} 
                      className={`cs-slider-progress-bar ${isPaused ? 'paused' : 'running'}`}
                    ></div>
                  </div>

                  <div className="cs-slider-dots-group">
                    {projects.map((_, dIdx) => (
                      <button
                        key={dIdx}
                        className={`cs-slider-dot ${currentSlide === dIdx ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(dIdx);
                        }}
                        aria-label={`Go to slide ${dIdx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="cs-slider-arrows-group">
                    <button 
                      className="cs-slider-arrow-btn" 
                      onClick={handlePrev}
                      aria-label="Previous Slide"
                      title="Previous Project"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button 
                      className="cs-slider-arrow-btn" 
                      onClick={handleNext}
                      aria-label="Next Slide"
                      title="Next Project"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
