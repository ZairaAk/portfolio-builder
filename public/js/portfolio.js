/* ============================================
   PUBLIC PORTFOLIO JavaScript
   Renders the portfolio based on template
   ============================================ */

const root = document.getElementById('portfolio-root');

// Get username from URL: /u/:username
const pathParts = window.location.pathname.split('/');
const username = pathParts[pathParts.indexOf('u') + 1];

if (!username) {
  root.innerHTML = `<div class="not-published"><div class="not-published-emoji">🔍</div><h2>Portfolio not found</h2><a href="/" class="btn">Go home</a></div>`;
} else {
  loadPortfolio();
}

async function loadPortfolio() {
  try {
    const res = await fetch(`/api/public/${username}`);
    const data = await res.json();

    if (!res.ok) {
      root.innerHTML = `
        <div class="not-published">
          <div class="not-published-emoji">🚧</div>
          <h2>${data.error || 'Portfolio not available'}</h2>
          <p style="color:var(--ink-muted);max-width:40ch;text-align:center;">${data.error === 'This portfolio is not published yet' ? 'This person hasn\'t published their portfolio yet. Check back soon!' : 'The portfolio you\'re looking for doesn\'t exist.'}</p>
          <a href="/" class="btn">Go home</a>
        </div>`;
      return;
    }

    renderPortfolio(data);
  } catch (err) {
    root.innerHTML = `<div class="not-published"><div class="not-published-emoji">⚠️</div><h2>Error loading portfolio</h2><a href="/" class="btn">Go home</a></div>`;
  }
}

function renderPortfolio({ profile, projects, skills, experiences, education, username: uname }) {
  const template = profile.template || 'editorial';
  const accentColor = profile.accent_color || '#4B6BB5';

  // Update page meta
  document.getElementById('page-title').textContent = `${profile.name || uname} — Portfolio`;
  document.getElementById('page-desc').setAttribute('content', profile.tagline || '');
  document.getElementById('og-title').setAttribute('content', `${profile.name || uname}'s Portfolio`);
  document.getElementById('og-desc').setAttribute('content', profile.tagline || profile.bio?.slice(0, 160) || '');

  // Inject accent color CSS variable
  document.documentElement.style.setProperty('--accent', accentColor);

  const templateClass = `portfolio-${template}`;
  const isDark = template === 'bold';

  // Group skills by category
  const skillsByCategory = {};
  skills.forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });

  const avatarHtml = profile.avatar_url
    ? `<img src="${profile.avatar_url}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'var(--border)'};" alt="${profile.name || uname}" />`
    : `<div style="width:80px;height:80px;border-radius:50%;background:${accentColor};display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:2rem;color:white;flex-shrink:0;">${(profile.name || uname).slice(0,1).toUpperCase()}</div>`;

  const socialLinks = [
    profile.github && { label: 'GitHub', url: profile.github, icon: '⌥' },
    profile.linkedin && { label: 'LinkedIn', url: profile.linkedin, icon: 'in' },
    profile.twitter && { label: 'Twitter', url: profile.twitter, icon: '𝕏' },
    profile.website && { label: 'Website', url: profile.website, icon: '↗' },
  ].filter(Boolean);

  const projectsHtml = projects.length ? `
    <section class="portfolio-section" id="projects">
      <div class="container">
        <div class="section-header">
          <div class="section-header-left">
            <div class="part-num" style="font-family:var(--font-hand);color:${isDark ? 'rgba(245,242,237,0.4)' : 'var(--ink-muted)'};margin-bottom:0.5rem;">Part. 01</div>
            <h2 style="${isDark ? 'color:var(--cream)' : ''}">Projects</h2>
          </div>
          <div style="font-family:var(--font-hand);font-size:1.1rem;color:${isDark ? 'rgba(245,242,237,0.3)' : 'var(--ink-muted)'};">${projects.length} work${projects.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="projects-portfolio-grid">
          ${projects.map(p => `
            <div class="project-portfolio-card reveal">
              ${p.image_url
                ? `<img src="${p.image_url}" class="project-img" alt="${p.title}" />`
                : `<div class="project-img-placeholder" style="background:${isDark ? '#242420' : 'var(--cream-dark)'};">📁</div>`}
              <div class="project-card-body">
                <h3 class="project-card-title" style="${isDark ? 'color:var(--cream)' : ''}">${p.title}</h3>
                ${p.description ? `<p class="project-card-desc" style="${isDark ? 'color:rgba(245,242,237,0.6)' : ''}">${p.description}</p>` : ''}
                ${p.tags?.length ? `<div class="project-card-tags">${p.tags.map(t => `<span class="tag" style="${isDark ? 'border-color:rgba(255,255,255,0.15);color:rgba(245,242,237,0.5)' : ''}">${t}</span>`).join('')}</div>` : ''}
                <div class="project-card-links">
                  ${p.live_url ? `<a href="${p.live_url}" target="_blank" class="project-link" style="color:${accentColor};">Live ↗</a>` : ''}
                  ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="project-link" style="color:${isDark ? 'rgba(245,242,237,0.6)' : 'var(--ink-muted)'};">GitHub ↗</a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  const skillsHtml = skills.length ? `
    <section class="portfolio-section" id="skills">
      <div class="container">
        <div class="section-header">
          <div class="section-header-left">
            <div class="part-num" style="font-family:var(--font-hand);color:${isDark ? 'rgba(245,242,237,0.4)' : 'var(--ink-muted)'};margin-bottom:0.5rem;">Part. 02</div>
            <h2 style="${isDark ? 'color:var(--cream)' : ''}">Skills</h2>
          </div>
        </div>
        <div class="skills-categories">
          ${Object.entries(skillsByCategory).map(([cat, catSkills]) => `
            <div class="reveal">
              <div class="skill-category-title" style="${isDark ? 'color:rgba(245,242,237,0.4)' : ''}">${cat}</div>
              <div class="skills-row">
                ${catSkills.map(s => `
                  <div class="skill-pill" style="${isDark ? 'background:#242420;border-color:rgba(255,255,255,0.1);color:var(--cream)' : ''}">
                    <div class="skill-dots">
                      ${[1,2,3,4,5].map(i => `<div class="skill-dot ${i <= s.level ? 'filled' : ''}" style="${i <= s.level ? `background:${accentColor};border-color:${accentColor}` : ''}"></div>`).join('')}
                    </div>
                    ${s.name}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  const experienceHtml = experiences.length ? `
    <section class="portfolio-section" id="experience">
      <div class="container">
        <div class="section-header">
          <div class="section-header-left">
            <div class="part-num" style="font-family:var(--font-hand);color:${isDark ? 'rgba(245,242,237,0.4)' : 'var(--ink-muted)'};margin-bottom:0.5rem;">Part. 03</div>
            <h2 style="${isDark ? 'color:var(--cream)' : ''}">Experience</h2>
          </div>
        </div>
        <div class="timeline reveal">
          ${experiences.map(e => `
            <div class="timeline-entry">
              <div class="timeline-date" style="${isDark ? 'color:rgba(245,242,237,0.4)' : ''}">
                ${e.from_date || ''}${e.is_current ? ' – Present' : e.to_date ? ` – ${e.to_date}` : ''}
              </div>
              <h3 class="timeline-title" style="${isDark ? 'color:var(--cream)' : ''}">${e.role}</h3>
              <div class="timeline-sub" style="color:${accentColor}">${e.company}</div>
              ${e.description ? `<p class="timeline-desc" style="${isDark ? 'color:rgba(245,242,237,0.6)' : ''}">${e.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  const educationHtml = education.length ? `
    <section class="portfolio-section" id="education">
      <div class="container">
        <div class="section-header">
          <div class="section-header-left">
            <div class="part-num" style="font-family:var(--font-hand);color:${isDark ? 'rgba(245,242,237,0.4)' : 'var(--ink-muted)'};margin-bottom:0.5rem;">Part. 04</div>
            <h2 style="${isDark ? 'color:var(--cream)' : ''}">Education</h2>
          </div>
        </div>
        <div class="timeline reveal">
          ${education.map(e => `
            <div class="timeline-entry">
              <div class="timeline-date" style="${isDark ? 'color:rgba(245,242,237,0.4)' : ''}">${e.year || ''}</div>
              <h3 class="timeline-title" style="${isDark ? 'color:var(--cream)' : ''}">${e.degree}</h3>
              <div class="timeline-sub" style="color:${accentColor}">${e.institution}</div>
              ${e.description ? `<p class="timeline-desc" style="${isDark ? 'color:rgba(245,242,237,0.6)' : ''}">${e.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  const html = `
    <div class="${templateClass}">

      <!-- Nav -->
      <nav class="portfolio-nav ${isDark ? 'dark-nav' : ''}" id="portfolio-nav">
        <div style="font-family:var(--font-serif);font-size:1.1rem;${isDark ? 'color:var(--cream)' : ''}">
          ${profile.name || uname}
        </div>
        <ul class="portfolio-nav-links">
          ${projects.length ? `<li><a href="#projects" style="${isDark ? 'color:rgba(245,242,237,0.6)' : ''}">Projects</a></li>` : ''}
          ${skills.length ? `<li><a href="#skills" style="${isDark ? 'color:rgba(245,242,237,0.6)' : ''}">Skills</a></li>` : ''}
          ${experiences.length ? `<li><a href="#experience" style="${isDark ? 'color:rgba(245,242,237,0.6)' : ''}">Experience</a></li>` : ''}
        </ul>
        <button class="share-btn" onclick="sharePortfolio()" style="${isDark ? 'border-color:rgba(255,255,255,0.2);color:rgba(245,242,237,0.6)' : ''}">
          ↗ Share
        </button>
      </nav>

      <!-- Hero -->
      <header class="editorial-hero">
        <div class="editorial-hero-left">
          <div class="editorial-part-label">
            <span class="line-accent" style="background:${accentColor};width:24px;height:2px;display:inline-block;"></span>
            Portfolio
          </div>
          <h1 class="portfolio-name" style="${isDark ? 'color:var(--cream)' : ''}">${profile.name || uname}</h1>
          <p class="portfolio-tagline">${profile.tagline || ''}</p>
          ${profile.location ? `<p style="font-size:0.8rem;color:${isDark ? 'rgba(245,242,237,0.4)' : 'var(--ink-muted)'};margin-top:0.75rem;">📍 ${profile.location}</p>` : ''}
          ${socialLinks.length ? `
            <div class="editorial-links">
              ${socialLinks.map(l => `<a href="${l.url}" target="_blank" class="editorial-link" style="${isDark ? 'color:var(--cream)' : ''}">${l.icon} ${l.label}</a>`).join('')}
            </div>
          ` : ''}
          <div class="editorial-stat" style="margin-top:2rem;">
            <span class="num" style="${isDark ? 'color:var(--cream)' : ''}">${profile.views}</span>
            <span class="label" style="${isDark ? 'color:rgba(245,242,237,0.4)' : ''}">portfolio views</span>
          </div>
        </div>
        <div class="editorial-hero-right">
          <div style="display:flex;flex-direction:column;gap:1.5rem;">
            ${avatarHtml}
            ${profile.bio ? `<p style="font-size:1rem;line-height:1.75;font-weight:300;color:${isDark ? 'rgba(245,242,237,0.7)' : 'var(--ink-light)'};max-width:44ch;">${profile.bio}</p>` : ''}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:0.5rem;">
              <div style="width:12px;height:12px;background:${accentColor};border-radius:2px;"></div>
              <div style="width:12px;height:12px;background:var(--red);border-radius:2px;"></div>
              <div style="width:12px;height:12px;background:var(--yellow);border-radius:2px;"></div>
              <div style="width:12px;height:12px;background:var(--green);border-radius:2px;"></div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Sections -->
      ${projectsHtml}
      ${skillsHtml}
      ${experienceHtml}
      ${educationHtml}

      <!-- Contact -->
      <section class="contact-section">
        <div class="container">
          <div class="section-label" style="justify-content:center;${isDark ? 'color:rgba(245,242,237,0.4)' : ''}">Get in touch</div>
          <h2 style="${isDark ? 'color:var(--cream)' : ''}">Let's work<br /><em>together.</em></h2>
          <a href="mailto:${profile.email || ''}" class="contact-email-large" style="${isDark ? 'color:var(--cream)' : ''}">${profile.email || (uname + '@email.com')}</a>
          ${socialLinks.length ? `
            <div class="editorial-links" style="justify-content:center;margin-top:0;">
              ${socialLinks.map(l => `<a href="${l.url}" target="_blank" class="editorial-link" style="${isDark ? 'color:rgba(245,242,237,0.7)' : ''}">${l.icon} ${l.label}</a>`).join('')}
            </div>
          ` : ''}
        </div>
      </section>

      <!-- Footer -->
      <footer class="portfolio-footer" style="${isDark ? 'border-top-color:rgba(255,255,255,0.1)' : ''}">
        <div class="container">
          <p class="made-with" style="${isDark ? 'color:rgba(245,242,237,0.3)' : ''}">
            Built with <a href="/" style="color:${accentColor};">Folio</a> ✦
          </p>
        </div>
      </footer>
    </div>
  `;

  root.innerHTML = html;

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Navbar scroll
  const nav = document.getElementById('portfolio-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

function sharePortfolio() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      toast('Link copied to clipboard!', 'success');
    });
  } else {
    prompt('Copy this link:', url);
  }
}

function toast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}
