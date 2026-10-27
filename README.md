# Folio — Portfolio Builder Platform

> **Build your developer portfolio in minutes. Share it with one link.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-4B6BB5?style=for-the-badge)](https://portfolio-builder-XXXX.onrender.com)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-Watch%20Now-C8463A?style=for-the-badge)](https://youtu.be/DEMO_LINK_HERE)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-1A1A18?style=for-the-badge&logo=github)](https://github.com/ZairaAk/portfolio-builder)

---

## 📸 Preview

> _Demo video and screenshots coming soon_

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email + password login, JWT-based sessions |
| 👤 **Profile** | Name, tagline, bio, location, social links, avatar upload |
| 💼 **Projects** | Add projects with images, tags, live + GitHub links; drag to reorder |
| ⚡ **Skills** | Track skills with proficiency levels, grouped by category |
| 🏢 **Experience** | Work history with company, role, date range |
| 🎓 **Education** | Academic background with institution and year |
| 🎨 **3 Templates** | Editorial, Minimal, Bold — switch any time |
| 🎯 **Accent Colors** | 6 curated accent colors to personalize your portfolio |
| 🌐 **Public Portfolio** | Each user gets `/u/username` — no login required to view |
| 📊 **View Analytics** | Track how many people have visited your portfolio |
| 🔗 **Share Button** | One-click copy to clipboard |
| 📤 **Publish Toggle** | Control when your portfolio goes live |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3 (custom design system), JavaScript (ES6+) |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite via `better-sqlite3` (zero-config, file-based) |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` |
| **File Uploads** | `multer` |
| **Deployment** | Render.com (Web Service + Persistent Disk) |

---

## 🎨 Design Inspiration

The UI is inspired by **editorial print design** — minimalist yet expressive:
- Warm cream backgrounds (`#F5F2ED`)
- **DM Serif Display** for editorial headings
- **Caveat** for hand-lettered accents
- Geometric color-block accents (blue, red, ochre, green)
- Generous whitespace, thin line separators

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Local Setup

```bash
# Clone the repository
git clone https://github.com/ZairaAk/portfolio-builder.git
cd portfolio-builder

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and set your JWT_SECRET

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Environment Variables

```env
PORT=3000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

## 🗄 Database Schema

```sql
users         -- id, username, email, password_hash, created_at
profiles      -- id, user_id, name, tagline, bio, avatar_url, template, accent_color, views, is_published
projects      -- id, user_id, title, description, image_url, tags, live_url, github_url, sort_order
skills        -- id, user_id, name, level (1-5), category, sort_order
experiences   -- id, user_id, role, company, from_date, to_date, is_current, description
education     -- id, user_id, degree, institution, year, description
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |

### Portfolio Data (🔒 Protected)
| Method | Endpoint | Description |
|---|---|---|
| GET/PATCH | `/api/profile` | Read/update profile |
| GET/POST | `/api/projects` | List/create projects |
| PATCH/DELETE | `/api/projects/:id` | Update/delete project |
| POST | `/api/projects/reorder` | Reorder projects |
| GET/POST | `/api/skills` | List/create skills |
| GET/POST | `/api/experience` | List/create experience |
| GET/POST | `/api/education` | List/create education |

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/public/:username` | Get public portfolio data |

### File Uploads (🔒 Protected)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/avatar` | Upload profile photo |
| POST | `/api/upload/project-image` | Upload project image |

---

## ☁️ Deployment

This app is deployed on **Render.com**.

### Deploy Your Own

1. Fork this repository
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set environment variables:
   - `JWT_SECRET` = any random string
   - `NODE_ENV` = production
5. The `render.yaml` handles everything else automatically

> SQLite data is persisted using Render's Persistent Disk (1GB free).

---

## 📁 Project Structure

```
portfolio-builder/
├── server/
│   ├── index.js              # Express app + routes setup
│   ├── db.js                 # SQLite init + schema
│   ├── middleware/auth.js    # JWT auth middleware
│   └── routes/
│       ├── auth.js           # Register / Login / Me
│       ├── profile.js        # Profile CRUD
│       ├── projects.js       # Projects CRUD + reorder
│       ├── skills.js         # Skills CRUD
│       ├── experience.js     # Experience CRUD
│       ├── education.js      # Education CRUD
│       └── public.js         # Public portfolio endpoint
├── public/
│   ├── index.html            # Landing page
│   ├── login.html            # Auth page
│   ├── dashboard.html        # Portfolio editor
│   ├── portfolio.html        # Public portfolio view
│   ├── css/
│   │   ├── main.css          # Global design system
│   │   ├── landing.css       # Landing styles
│   │   ├── dashboard.css     # Dashboard styles
│   │   └── portfolio.css     # Portfolio page styles
│   └── js/
│       ├── dashboard.js      # Dashboard logic
│       └── portfolio.js      # Portfolio renderer
├── uploads/                  # User-uploaded images
├── data/                     # SQLite database (gitignored)
├── render.yaml               # Render.com deployment config
├── .env                      # Environment variables
└── README.md
```

---

## 📹 Demo Video

> 🎬 **[Watch the demo video here](https://youtu.be/DEMO_LINK_HERE)**

The demo covers:
1. Creating an account and setting up a profile
2. Adding projects with images and tags
3. Adding skills, experience, and education
4. Switching templates and accent colors
5. Publishing and sharing the portfolio

---

## 👩‍💻 About

Built as an end-term project by **Zaira Akhtar**.

**Key engineering highlights:**
- JWT authentication with bcrypt password hashing
- RESTful API with full CRUD for all entities
- SQLite with WAL mode and foreign key constraints
- Drag-and-drop reordering via HTML5 Drag API
- File upload handling with size/type validation
- Public portfolio with view count analytics
- Three distinct portfolio templates rendered client-side
- Single Express server serves both API and static frontend

---

*Made with ❤️ using Node.js, Express, SQLite, and vanilla JavaScript.*
