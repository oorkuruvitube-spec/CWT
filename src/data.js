export const INITIAL_DATA = {
  currentUser: "emp_ceo", // Real Admin: Kolitha De Silva
  
  employees: [
    {
      id: "emp_ceo",
      name: "Kolitha De Silva",
      role: "Chief Executive Officer & MD",
      level: 1,
      levelName: "Executive / C-Suite",
      department: "Executive Leadership",
      email: "kolitha@gmail.com",
      password: "1234",
      avatar: "/team/kolitha_headshot_circle.png",
      canAssign: true,
      bio: "25+ years driving global enterprise architectures across Australia, UK, and Sri Lanka."
    }
  ],

  projects: [
    { id: "proj-customs", name: "Sri Lanka Customs DAT & CDNS", client: "Sri Lanka Customs", tag: "Customs & Trade" },
    { id: "proj-aviation", name: "Aviation Modern Data Platform", client: "Sri Lankan Airlines", tag: "Aviation & Synapse" },
    { id: "proj-allianz", name: "Allianz DataSphere Lakehouse", client: "Allianz Lanka", tag: "Insurance & Risk" },
    { id: "proj-dilmah", name: "Multi-Company ERP Lakehouse", client: "Dilmah Tea", tag: "FMCG ERP" },
    { id: "proj-healthcare", name: "Nordic EPR Clinical Platform", client: "Cambio Healthcare", tag: "E-Health" },
    { id: "proj-banking", name: "High-Velocity Banking ELT", client: "Bank of Maldives", tag: "FinTech & Banking" }
  ],

  tasks: [],

  dailyUpdates: [],

  // Velocity & Quality Sprints data per employee (calculated dynamically from real tasks)
  performanceHistory: {},


  // Real Corporate Metrics from 3_Company-Profile (Slide 3, 6, 7, 40, 43)
  companyMetrics: [
    {
      id: "metric-1",
      num: "5+",
      label: "Years of Engineering Excellence",
      detail: "Delivering high-ROI enterprise platforms and dedicated teams globally",
      colorClass: "kpi-blue",
      badgeClass: "dat-badge-blue",
      iconSvg: "calendar"
    },
    {
      id: "metric-2",
      num: "700+",
      label: "Engineers Under Management",
      detail: "Geographically dispersed agile teams across Sri Lanka & Europe",
      colorClass: "kpi-teal",
      badgeClass: "dat-badge-teal",
      iconSvg: "users"
    },
    {
      id: "metric-3",
      num: "100k+",
      label: "Daily Active Healthcare Users",
      detail: "Powering hospital patient records across Norway & Sweden (DIPS & Cambio)",
      colorClass: "kpi-purple",
      badgeClass: "dat-badge-purple",
      iconSvg: "activity"
    },
    {
      id: "metric-4",
      num: "30k+",
      label: "Concurrent Enterprise Users",
      detail: "Mission-critical customs clearance & trade intelligence (Sri Lanka Customs)",
      colorClass: "kpi-orange",
      badgeClass: "dat-badge-orange",
      iconSvg: "shield"
    }
  ],

  // Industries / Client Sectors from Slide 11
  clientSectors: [
    { name: "Airlines & Aviation", icon: "✈️", clients: "Sri Lankan Airlines, Air Astana" },
    { name: "Banking & Finance", icon: "🏦", clients: "Bank of Maldives, Amana Bank" },
    { name: "Insurance", icon: "🛡️", clients: "Allianz Lanka, Forte Insurance" },
    { name: "Customs & Logistics", icon: "📦", clients: "Sri Lanka Customs (DAT & CDNS)" },
    { name: "Healthcare & E-Health", icon: "🏥", clients: "Cambio Healthcare, DIPS AS" },
    { name: "FMCG & Manufacturing", icon: "🍃", clients: "Dilmah Tea, Global Brands" }
  ],

  // Real Enterprise Projects for the Auto-Advancing Showcase Slider (Slide 29, 31, 34, 40, 43, 52)
  featuredProjects: [
    {
      id: "proj-customs",
      sector: "Customs & Trade Logistics",
      client: "Sri Lanka Customs",
      title: "National Trade Intelligence & Customs Platform",
      badge: "30,000+ Concurrent Traders • 16 Dashboards",
      description: "Secures 30,000+ daily traders with real-time CusDec tracking and 16 automated revenue intelligence dashboards.",
      impactStats: ["30k+ Traders", "16 Dashboards", "ASYCUDA Unified"],
      techStack: ["SQL Server", "Power BI", "ASP.NET", "ASYCUDA ETL"],
      image: "/projects/customs.jpg",
      objectPosition: "right center"
    },
    {
      id: "proj-airlines",
      sector: "Airlines & Aviation",
      client: "Sri Lankan Airlines & Air Astana",
      title: "Aviation Modern Data Platform & Cloud Native AKS",
      badge: "Turnaround: Days to Minutes • Azure Databricks",
      description: "Compressed turnaround times from days into minutes using Azure Synapse, Databricks, and microservices.",
      impactStats: ["Days to Minutes", "Azure Synapse & Databricks", "Kubernetes AKS"],
      techStack: ["Azure Synapse", "Databricks", "Azure Data Lake", "AKS"],
      image: "/projects/airlines.jpg",
      objectPosition: "right center"
    },
    {
      id: "proj-allianz",
      sector: "Global Insurance",
      client: "Allianz Lanka",
      title: "Allianz DataSphere — Real-Time Insurance Analytics",
      badge: "Near Real-Time Reporting • Scalable Risk Governance",
      description: "Unified multi-source core policy systems into an Azure lakehouse for automated risk governance and executive reporting.",
      impactStats: ["Near Real-Time", "Lakehouse Architecture", "Risk Compliance"],
      techStack: ["Azure Synapse", "Power BI", "Data Lakehouse"],
      image: "/projects/allianz.jpg",
      objectPosition: "right center"
    },
    {
      id: "proj-dilmah",
      sector: "FMCG & Manufacturing",
      client: "Dilmah Tea",
      title: "Multi-Company ERP Lakehouse & P&L Intelligence",
      badge: "Multi-Company Integration • Centralized Reports",
      description: "Consolidated subsidiary ERP financials into an automated Azure Lakehouse with dynamic Power BI reporting.",
      impactStats: ["Multi-Company ERP", "Automated Lakehouse", "Dynamic P&L"],
      techStack: ["Azure Lakehouse", "Azure Synapse", "Power BI"],
      image: "/projects/dilmah.jpg",
      objectPosition: "right center"
    },
    {
      id: "proj-healthcare",
      sector: "Healthcare & E-Health",
      client: "Cambio & DIPS AS",
      title: "Nordic Hospital Systems & Electronic Patient Records",
      badge: "100,000+ Daily Clinicians • 15+ Years Nordic R&D",
      description: "Powering mission-critical electronic patient records for 100,000+ clinicians daily across Sweden and Norway.",
      impactStats: ["100k+ Clinicians", "5 University Hospitals", "300+ Engineers"],
      techStack: ["EPR / EMR Systems", "Nordic E-Health Standards", "Microservices"],
      image: "/projects/healthcare.jpg",
      objectPosition: "right center"
    },
    {
      id: "proj-banking",
      sector: "Banking & Financial Services",
      client: "Bank of Maldives (BML)",
      title: "High-Velocity Core Banking Azure ELT Platform",
      badge: "8TB+ SQL Warehouse • 105 Automated Reports",
      description: "Accelerated an 8TB+ core banking warehouse with automated daily ELT processing and 105 executive reports.",
      impactStats: ["8TB+ Warehouse", "55GB Daily Data", "105 Automated Reports"],
      techStack: ["Azure Data Platform", "SQL Server", "Power BI"],
      image: "/projects/banking.jpg",
      objectPosition: "right center"
    }
  ],

  // Why Companies Trust Us from Slide 3, 15, 19
  trustItems: [
    {
      icon: "🏆",
      title: "5+ Years Proven Track Record",
      desc: "Delivering industry-best modern data platforms and cloud architectures with proven low TCO and high ROI for global enterprise clients."
    },
    {
      icon: "⭐",
      title: "Microsoft Solutions Partner",
      desc: "Certified Azure Engineers and Microsoft MVPs specializing in Data Analytics, DevOps, Data Platform, Application Development, and Enterprise Integration."
    },
    {
      icon: "🌍",
      title: "Nordic & Global Delivery Model",
      desc: "Headquartered in Colombo with our deepest market presence in Scandinavia (Sweden, Norway, Denmark) and the UK. Trusted for long-term dedicated engineering squads."
    },
    {
      icon: "🔒",
      title: "ISO-Certified Bank-Grade Security",
      desc: "ISO 9001:2015 and ISO 27001 certified. We enforce European GDPR compliance, data masking, and strict security governance for government and financial clients."
    }
  ],

  // Core Service Pillars from Slide 17, 18, 20-25
  services: [
    {
      icon: "📊",
      title: "Modern Data Platforms & Analytics",
      desc: "Turn enterprise data into real-time executive intelligence using Azure Synapse, Databricks, and Power BI.",
      tags: ["Azure Synapse", "Databricks", "Power BI"]
    },
    {
      icon: "👥",
      title: "Dedicated Software Engineering Teams",
      desc: "High-velocity dedicated agile squads integrated seamlessly into your workflow to accelerate delivery.",
      tags: ["Dedicated Squads", ".NET / React", "Microservices"]
    },
    {
      icon: "☁️",
      title: "Cloud Native & DevOps Engineering",
      desc: "Resilient multi-cloud architectures across Azure, AWS, and OCI with automated CI/CD and 24/7 SRE.",
      tags: ["Kubernetes AKS", "Multi-Cloud", "DevOps & SRE"]
    },
    {
      icon: "⚙️",
      title: "IFS ERP Consultancy & Integration",
      desc: "End-to-end IFS Applications consulting, version upgrades, custom REST adapters, and cloud migration.",
      tags: ["IFS Applications", "ERP Migration", "API Integration"]
    },
    {
      icon: "🏥",
      title: "Healthcare & E-Health Solutions",
      desc: "15+ years engineering electronic patient record platforms serving 100,000+ Nordic clinicians daily.",
      tags: ["EHR / EMR", "Nordic E-Health", "Clinical Workflows"]
    },
    {
      icon: "🤖",
      title: "Enterprise AI & Proprietary IP",
      desc: "Enterprise AI search and workforce enablement with proprietary platforms Kuha, LayUp, and DREView.",
      tags: ["Kuha AI Search", "LayUp LMS", "DREView"]
    }
  ],

  // Proprietary Products Showcase (Slide 8, 18)
  proprietaryProducts: [
    {
      name: "Kuha",
      tagline: "Knowledge Unification for Hyper Analytics",
      desc: "Enterprise AI search engine delivering instant, secure document discovery across Legal, HR, and Finance.",
      badge: "AI & Search"
    },
    {
      name: "Layup",
      tagline: "Gamified, Social-Driven Corporate LMS",
      desc: "Gamified, multi-tenant corporate learning platform built to drive continuous workforce skill development.",
      badge: "EdTech & LMS"
    },
    {
      name: "DREView",
      tagline: "SQL Data Warehouse Workload Monitor",
      desc: "Real-time SQL data warehouse monitoring on a single pane of glass to diagnose query bottlenecks instantly.",
      badge: "Performance & DWH"
    }
  ],

  // Real Enterprise Projects & Case Studies from Slide 29, 31, 34, 40, 43
  caseStudies: [
    {
      id: "sl-customs",
      client: "Sri Lanka Customs",
      title: "DAT & CDNS National Trade Transformation",
      tag: "CASE STUDY • CUSTOMS & LOGISTICS",
      stats: "30,000+ Concurrent Traders • 16 Power BI Dashboards",
      challenge: "Legacy ASYCUDA, EREG, ECCR, and RMDB systems were siloed, requiring traders to make physical visits and leaving senior officials without unified real-time risk intelligence.",
      solution: "Engineered two mission-critical platforms: DAT (Data Analytics Tool) on SQL Server & Power BI with 16 interactive dashboards for revenue and fraud detection; and CDNS (Customer Document Notification System) with OTP security supporting over 30,000 concurrent users for online CusDec tracking.",
      techStack: ["SQL Server", "Power BI", "ASP.NET", "ASYCUDA ETL", "OTP Security"],
      img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "airlines",
      client: "Sri Lankan Airlines & Air Astana",
      title: "Modern Data Platform & Cloud Native Transformation",
      tag: "CASE STUDY • AVIATION & MDP",
      stats: "Decisions in Minutes vs. Days • AKS Microservices",
      challenge: "Airline legacy data warehouses prevented timely operational insights, while scaling monolithic applications hindered flight scheduling and digital booking reliability.",
      solution: "Modernized data warehouse into an Azure Modern Data Platform with Azure Data Lake, Databricks, and Synapse Analytics. Migrated Air Astana to cloud-native microservices orchestrated on Azure Kubernetes Service (AKS) with API Management.",
      techStack: ["Azure Synapse", "Databricks", "Azure Data Lake", "AKS", "DevOps"],
      img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "allianz",
      client: "Allianz Lanka",
      title: "Allianz DataSphere — Unified Insurance Analytics",
      tag: "CASE STUDY • INSURANCE & ANALYTICS",
      stats: "Near Real-Time Reporting • Scalable Governance",
      challenge: "Fragmented core insurance files and multiple external systems caused severe delays in generating statutory insurance reports and executive underwriting analytics.",
      solution: "Implemented Azure Synapse and Power BI to seamlessly integrate disparate data sources into 'Allianz DataSphere', delivering near real-time operational reporting, strict compliance, and scalable risk models.",
      techStack: ["Azure Synapse Analytics", "Power BI", "Data Lakehouse", "Data Governance"],
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "dilmah",
      client: "Dilmah Tea",
      title: "Lakehouse Optimization of Multi-Company ERP Financials",
      tag: "CASE STUDY • FMCG & ERP",
      stats: "Multi-Company Integration • Dynamic Financial Reporting",
      challenge: "Custom ERP servicing multiple global subsidiary companies required centralized financial consolidation and dynamic executive management reporting without manual spreadsheets.",
      solution: "Constructed an Azure Lakehouse with automated ETL pipelines to extract, clean, and centralize complex financial data, visualizing real-time group performance via tailored Power BI dashboards.",
      techStack: ["Azure Lakehouse", "Azure Synapse", "Power BI", "Custom ERP ETL"],
      img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80"
    }
  ]
};
