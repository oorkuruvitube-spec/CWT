import React, { useState } from 'react';

export default function StoriesSection({ caseStudies }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!caseStudies || caseStudies.length === 0) return null;

  const currentStudy = caseStudies[activeIdx];

  return (
    <section id="stories" className="cs-section cs-section-subtle">
      <div className="container-xl">
        <div className="cs-section-header">
          <div className="cs-micro-tag">PROVEN ENTERPRISE IMPACT</div>
          <h2 className="cs-section-title">
            Transformative Case Studies <br />
            <span className="text-royal">From Aviation to National Customs</span>
          </h2>
          <p className="cs-section-subtitle">
            Explore how Creative Web Technology delivers mission-critical architectures, Modern Data Platforms, and high-scale cloud systems.
          </p>
        </div>

        {/* Posh Segmented Tab Selector */}
        <div className="cs-case-tabs-row">
          {caseStudies.map((study, idx) => (
            <button
              key={study.id}
              className={`cs-case-tab-btn ${activeIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveIdx(idx)}
            >
              <span>{study.client}</span>
            </button>
          ))}
        </div>

        {/* Active Case Study Detail Card */}
        <div className="cs-posh-case-showcase">
          <div className="cs-case-media-col">
            <div className="cs-case-image-wrapper">
              <img 
                src={currentStudy.img} 
                alt={currentStudy.client} 
                className="cs-case-img"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/Media.png'; }}
              />
              <div className="cs-case-floating-stat">
                <span className="cs-stat-pulse"></span>
                <span>{currentStudy.stats}</span>
              </div>
            </div>
          </div>

          <div className="cs-case-content-col">
            <div className="cs-case-meta-tag">{currentStudy.tag}</div>
            
            <h3 className="cs-case-heading">
              {currentStudy.title}
            </h3>

            <div className="cs-case-block">
              <div className="cs-case-block-label label-challenge">The Challenge</div>
              <p className="cs-case-block-text">{currentStudy.challenge}</p>
            </div>

            <div className="cs-case-block">
              <div className="cs-case-block-label label-solution">Delivered Solution & Impact</div>
              <p className="cs-case-block-text solution-text">{currentStudy.solution}</p>
            </div>

            <div className="cs-case-tech-block">
              <div className="cs-case-tech-label">Technology Architecture</div>
              <div className="cs-case-tags">
                {currentStudy.techStack.map((tech, tIdx) => (
                  <span key={tIdx} className="cs-posh-tag">{tech}</span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
