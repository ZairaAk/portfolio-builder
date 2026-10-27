/* ============================================
   DASHBOARD JavaScript
   ============================================ */

const API = '';
let currentUser = null;
let currentProfile = null;
let allProjects = [];

// ─── Auth Guard ───
const token = localStorage.getItem('folio_token');
const storedUser = localStorage.getItem('folio_user');
if (!token || !storedUser) {
  window.location.href = '/login.html';
} else {
  currentUser = JSON.parse(storedUser);
}

// ─── Helpers ───
function authHeaders() {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
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

function showAutosave(saving) {
  const el = document.getElementById('autosave-indicator');
  el.textContent = saving ? '⏳ Saving...' : '✓ Saved';
  if (!saving) setTimeout(() => { if (el.textContent === '✓ Saved') el.textContent = ''; }, 2000);
}

// ─── Panel Navigation ───
function showPanel(name) {
  document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`panel-${name}`).classList.add('active');
  document.querySelector(`[data-panel="${name}"]`).classList.add('active');
  document.getElementById('topbar-title').textContent = name.charAt(0).toUpperCase() + name.slice(1);

  // Load data on demand
  if (name === 'projects') loadProjects();
  if (name === 'skills') loadSkills();
  if (name === 'experience') loadExperience();
  if (name === 'education') loadEducation();
  if (name === 'appearance') loadAppearance();
}

// ─── Modal ───
function openModal(type, data = null) {
  const overlay = document.getElementById(`modal-${type}`);
  overlay.classList.add('open');

  if (type === 'project') {
    document.getElementById('project-modal-title').textContent = data ? 'Edit Project' : 'Add Project';
    document.getElementById('proj-edit-id').value = data?.id || '';
    document.getElementById('proj-title').value = data?.title || '';
    document.getElementById('proj-desc').value = data?.description || '';
    document.getElementById('proj-image-url').value = data?.image_url || '';
    document.getElementById('proj-live').value = data?.live_url || '';
    document.getElementById('proj-github').value = data?.github_url || '';
    document.getElementById('proj-tags').value = Array.isArray(data?.tags) ? data.tags.join(', ') : '';
  } else if (type === 'skill') {
    document.getElementById('skill-edit-id').value = data?.id || '';
    document.getElementById('skill-name').value = data?.name || '';
    document.getElementById('skill-category').value = data?.category || 'General';
    document.getElementById('skill-level').value = data?.level || 3;
  } else if (type === 'experience') {
    document.getElementById('exp-edit-id').value = data?.id || '';
    document.getElementById('exp-role').value = data?.role || '';
    document.getElementById('exp-company').value = data?.company || '';
    document.getElementById('exp-from').value = data?.from_date || '';
    document.getElementById('exp-to').value = data?.to_date || '';
    document.getElementById('exp-current').checked = data?.is_current === 1;
    document.getElementById('exp-desc').value = data?.description || '';
  } else if (type === 'education') {
    document.getElementById('edu-edit-id').value = data?.id || '';
    document.getElementById('edu-degree').value = data?.degree || '';
    document.getElementById('edu-institution').value = data?.institution || '';
    document.getElementById('edu-year').value = data?.year || '';
    document.getElementById('edu-desc').value = data?.description || '';
  }
}

function closeModal(type) {
  document.getElementById(`modal-${type}`).classList.remove('open');
}

// Click outside to close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ─── PROFILE ───
async function loadProfile() {
  try {
    const profile = await apiFetch('/api/profile');
    currentProfile = profile;

    document.getElementById('p-name').value = profile.name || '';
    document.getElementById('p-tagline').value = profile.tagline || '';
    document.getElementById('p-bio').value = profile.bio || '';
    document.getElementById('p-location').value = profile.location || '';
    document.getElementById('p-website').value = profile.website || '';
    document.getElementById('p-github').value = profile.github || '';
    document.getElementById('p-linkedin').value = profile.linkedin || '';
    document.getElementById('p-twitter').value = profile.twitter || '';

    // Sidebar
    const name = profile.name || currentUser.username;
    document.getElementById('sidebar-name').textContent = name;
    document.getElementById('sidebar-username').textContent = `@${currentUser.username}`;

    // Avatar
    if (profile.avatar_url) {
      const img = document.getElementById('avatar-preview');
      img.src = profile.avatar_url;
      img.style.display = 'block';
      document.getElementById('avatar-placeholder-large').style.display = 'none';
      // Also update sidebar avatar
      const sidebarAvatar = document.getElementById('sidebar-avatar');
      sidebarAvatar.innerHTML = `<img src="${profile.avatar_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />`;
    } else {
      const initials = name.slice(0, 1).toUpperCase();
      document.getElementById('avatar-placeholder-large').textContent = initials;
      document.getElementById('sidebar-avatar').textContent = initials;
    }

    // Publish toggle
    const toggle = document.getElementById('publish-toggle');
    toggle.checked = profile.is_published === 1;
    document.getElementById('publish-status').textContent = profile.is_published === 1 ? 'On' : 'Off';

    // Portfolio link
    const link = document.getElementById('view-portfolio-link');
    link.href = `/u/${currentUser.username}`;
  } catch (err) {
    toast('Failed to load profile: ' + err.message, 'error');
  }
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('save-profile-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  showAutosave(true);

  try {
    await apiFetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: document.getElementById('p-name').value,
        tagline: document.getElementById('p-tagline').value,
        bio: document.getElementById('p-bio').value,
        location: document.getElementById('p-location').value,
        website: document.getElementById('p-website').value,
        github: document.getElementById('p-github').value,
        linkedin: document.getElementById('p-linkedin').value,
        twitter: document.getElementById('p-twitter').value,
      })
    });
    showAutosave(false);
    toast('Profile saved!', 'success');
    loadProfile();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Profile';
  }
});

async function uploadAvatar(input) {
  if (!input.files[0]) return;
  const formData = new FormData();
  formData.append('avatar', input.files[0]);

  try {
    const res = await fetch(`${API}/api/upload/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const img = document.getElementById('avatar-preview');
    img.src = data.url;
    img.style.display = 'block';
    document.getElementById('avatar-placeholder-large').style.display = 'none';
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    sidebarAvatar.innerHTML = `<img src="${data.url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />`;
    toast('Photo updated!', 'success');
  } catch (err) {
    toast('Upload failed: ' + err.message, 'error');
  }
}

// ─── PUBLISH TOGGLE ───
async function togglePublish(checked) {
  try {
    await apiFetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ is_published: checked ? 1 : 0 })
    });
    document.getElementById('publish-status').textContent = checked ? 'On' : 'Off';
    toast(checked ? '🎉 Portfolio published!' : 'Portfolio unpublished', checked ? 'success' : 'info');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
    document.getElementById('publish-toggle').checked = !checked;
  }
}

// ─── PROJECTS ───
async function loadProjects() {
  try {
    allProjects = await apiFetch('/api/projects');
    renderProjects();
  } catch (err) {
    toast('Failed to load projects', 'error');
  }
}

function renderProjects() {
  const container = document.getElementById('projects-list');
  if (!allProjects.length) {
    container.innerHTML = `<div style="color:var(--ink-muted);font-size:0.9rem;padding:1rem;text-align:center;border:1px dashed var(--border);border-radius:6px;">No projects yet. Add your first one!</div>`;
    return;
  }
  container.innerHTML = allProjects.map(p => `
    <div class="project-dash-card" draggable="true" data-id="${p.id}">
      <div class="drag-handle">⠿</div>
      ${p.image_url
        ? `<img src="${p.image_url}" class="project-thumb" alt="${p.title}" onerror="this.style.display='none'" />`
        : `<div class="project-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">📁</div>`}
      <div class="project-info">
        <div class="title">${p.title}</div>
        <div class="desc">${p.description || 'No description'}</div>
        ${p.tags?.length ? `<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
      </div>
      <div class="project-actions">
        <button class="btn btn-sm" onclick='editProject(${JSON.stringify(p)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProject('${p.id}')">Delete</button>
      </div>
    </div>
  `).join('');
  initDragDrop();
}

async function saveProject() {
  const editId = document.getElementById('proj-edit-id').value;
  const title = document.getElementById('proj-title').value.trim();
  if (!title) { toast('Title is required', 'error'); return; }

  let image_url = document.getElementById('proj-image-url').value.trim();
  const imageFile = document.getElementById('proj-image-file').files[0];

  if (imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await fetch(`${API}/api/upload/project-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) image_url = data.url;
    } catch (e) { /* ignore, use url */ }
  }

  const tags = document.getElementById('proj-tags').value
    .split(',').map(t => t.trim()).filter(Boolean);

  const body = {
    title,
    description: document.getElementById('proj-desc').value,
    image_url,
    live_url: document.getElementById('proj-live').value,
    github_url: document.getElementById('proj-github').value,
    tags
  };

  try {
    if (editId) {
      await apiFetch(`/api/projects/${editId}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast('Project updated!', 'success');
    } else {
      await apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(body) });
      toast('Project added!', 'success');
    }
    closeModal('project');
    loadProjects();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

function editProject(p) {
  openModal('project', p);
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  try {
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    toast('Project deleted', 'info');
    loadProjects();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

// ─── Drag & Drop Reorder ───
function initDragDrop() {
  const list = document.getElementById('projects-list');
  let dragEl = null;

  list.querySelectorAll('.project-dash-card').forEach(card => {
    card.addEventListener('dragstart', () => {
      dragEl = card;
      setTimeout(() => card.classList.add('dragging'), 0);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      reorderProjects();
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterEl = getDragAfterElement(list, e.clientY);
      if (afterEl == null) list.appendChild(dragEl);
      else list.insertBefore(dragEl, afterEl);
    });
  });
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.project-dash-card:not(.dragging)')];
  return els.reduce((closest, el) => {
    const box = el.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: el };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function reorderProjects() {
  const cards = document.querySelectorAll('.project-dash-card');
  const order = [...cards].map((c, i) => ({ id: c.dataset.id, sort_order: i }));
  try {
    await apiFetch('/api/projects/reorder', { method: 'POST', body: JSON.stringify({ order }) });
  } catch (e) { /* silent */ }
}

// ─── SKILLS ───
async function loadSkills() {
  try {
    const skills = await apiFetch('/api/skills');
    const container = document.getElementById('skills-list');
    if (!skills.length) {
      container.innerHTML = `<div style="color:var(--ink-muted);font-size:0.9rem;padding:1rem;grid-column:span 2;text-align:center;border:1px dashed var(--border);border-radius:6px;">No skills yet. Add your first one!</div>`;
      return;
    }
    container.innerHTML = skills.map(s => `
      <div class="skill-dash-item">
        <div class="skill-name-cat">
          <div class="name">${s.name}</div>
          <div class="cat">${s.category}</div>
        </div>
        <div class="skill-dots">${[1,2,3,4,5].map(i => `<div class="skill-dot ${i <= s.level ? 'filled' : ''}"></div>`).join('')}</div>
        <div style="display:flex;gap:4px;margin-left:0.5rem;">
          <button class="btn btn-sm" onclick='openModal("skill", ${JSON.stringify(s)})' style="padding:0.3rem 0.6rem;">✎</button>
          <button class="btn btn-sm btn-danger" onclick="deleteSkill('${s.id}')" style="padding:0.3rem 0.6rem;">✕</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    toast('Failed to load skills', 'error');
  }
}

async function saveSkill() {
  const editId = document.getElementById('skill-edit-id').value;
  const name = document.getElementById('skill-name').value.trim();
  if (!name) { toast('Skill name required', 'error'); return; }

  const body = {
    name,
    category: document.getElementById('skill-category').value || 'General',
    level: parseInt(document.getElementById('skill-level').value) || 3
  };

  try {
    if (editId) {
      await apiFetch(`/api/skills/${editId}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast('Skill updated!', 'success');
    } else {
      await apiFetch('/api/skills', { method: 'POST', body: JSON.stringify(body) });
      toast('Skill added!', 'success');
    }
    closeModal('skill');
    loadSkills();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

async function deleteSkill(id) {
  if (!confirm('Delete this skill?')) return;
  try {
    await apiFetch(`/api/skills/${id}`, { method: 'DELETE' });
    loadSkills();
    toast('Skill deleted', 'info');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

// ─── EXPERIENCE ───
async function loadExperience() {
  try {
    const exps = await apiFetch('/api/experience');
    const container = document.getElementById('experience-list');
    if (!exps.length) {
      container.innerHTML = `<div style="color:var(--ink-muted);font-size:0.9rem;padding:1rem;border:1px dashed var(--border);border-radius:6px;text-align:center;">No experience added yet.</div>`;
      return;
    }
    container.innerHTML = exps.map(e => `
      <div class="timeline-item">
        <div class="timeline-info">
          <div class="role-title">${e.role}</div>
          <div class="company-inst">${e.company}</div>
          <div class="dates">${e.from_date || ''}${e.is_current ? ' – Present' : e.to_date ? ` – ${e.to_date}` : ''}</div>
        </div>
        <div style="display:flex;gap:0.5rem;flex-shrink:0;">
          <button class="btn btn-sm" onclick='openModal("experience", ${JSON.stringify(e)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteExperience('${e.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    toast('Failed to load experience', 'error');
  }
}

async function saveExperience() {
  const editId = document.getElementById('exp-edit-id').value;
  const role = document.getElementById('exp-role').value.trim();
  const company = document.getElementById('exp-company').value.trim();
  if (!role || !company) { toast('Role and company are required', 'error'); return; }

  const body = {
    role, company,
    from_date: document.getElementById('exp-from').value,
    to_date: document.getElementById('exp-to').value,
    is_current: document.getElementById('exp-current').checked,
    description: document.getElementById('exp-desc').value
  };

  try {
    if (editId) {
      await apiFetch(`/api/experience/${editId}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast('Experience updated!', 'success');
    } else {
      await apiFetch('/api/experience', { method: 'POST', body: JSON.stringify(body) });
      toast('Experience added!', 'success');
    }
    closeModal('experience');
    loadExperience();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

async function deleteExperience(id) {
  if (!confirm('Delete this experience?')) return;
  try {
    await apiFetch(`/api/experience/${id}`, { method: 'DELETE' });
    loadExperience();
    toast('Deleted', 'info');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

// ─── EDUCATION ───
async function loadEducation() {
  try {
    const edus = await apiFetch('/api/education');
    const container = document.getElementById('education-list');
    if (!edus.length) {
      container.innerHTML = `<div style="color:var(--ink-muted);font-size:0.9rem;padding:1rem;border:1px dashed var(--border);border-radius:6px;text-align:center;">No education added yet.</div>`;
      return;
    }
    container.innerHTML = edus.map(e => `
      <div class="timeline-item">
        <div class="timeline-info">
          <div class="role-title">${e.degree}</div>
          <div class="company-inst">${e.institution}</div>
          <div class="dates">${e.year || ''}</div>
        </div>
        <div style="display:flex;gap:0.5rem;flex-shrink:0;">
          <button class="btn btn-sm" onclick='openModal("education", ${JSON.stringify(e)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEducation('${e.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    toast('Failed to load education', 'error');
  }
}

async function saveEducation() {
  const editId = document.getElementById('edu-edit-id').value;
  const degree = document.getElementById('edu-degree').value.trim();
  const institution = document.getElementById('edu-institution').value.trim();
  if (!degree || !institution) { toast('Degree and institution required', 'error'); return; }

  const body = {
    degree, institution,
    year: document.getElementById('edu-year').value,
    description: document.getElementById('edu-desc').value
  };

  try {
    if (editId) {
      await apiFetch(`/api/education/${editId}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast('Education updated!', 'success');
    } else {
      await apiFetch('/api/education', { method: 'POST', body: JSON.stringify(body) });
      toast('Education added!', 'success');
    }
    closeModal('education');
    loadEducation();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

async function deleteEducation(id) {
  if (!confirm('Delete this education?')) return;
  try {
    await apiFetch(`/api/education/${id}`, { method: 'DELETE' });
    loadEducation();
    toast('Deleted', 'info');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

// ─── APPEARANCE ───
function loadAppearance() {
  if (!currentProfile) return;
  const tmpl = currentProfile.template || 'editorial';
  document.querySelectorAll('.template-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.template === tmpl);
  });
  const color = currentProfile.accent_color || '#4B6BB5';
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.color === color);
  });
}

function selectTemplate(tmpl) {
  document.querySelectorAll('.template-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.template === tmpl);
  });
}

function selectColor(color, el) {
  document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('selected'));
  el.classList.add('selected');
}

async function saveAppearance() {
  const template = document.querySelector('.template-option.selected')?.dataset.template || 'editorial';
  const accent_color = document.querySelector('.color-swatch.selected')?.dataset.color || '#4B6BB5';
  try {
    await apiFetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ template, accent_color })
    });
    currentProfile = { ...currentProfile, template, accent_color };
    toast('Appearance saved!', 'success');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

// ─── LOGOUT ───
function logout() {
  localStorage.removeItem('folio_token');
  localStorage.removeItem('folio_user');
  window.location.href = '/';
}

// ─── INIT ───
loadProfile();
