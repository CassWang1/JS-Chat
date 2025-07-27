# JS Chat

A real-time, single-forum chat application built with **React** and **Express.js**.  
It uses stateless **JWT** sessions, polls the server every few seconds for new data, and stores messages in **MongoDB**. The UI is a responsive SPA designed with accessibility and internationalisation (i18n) in mind.

---

## ✨ Key Features
| Area | Highlights |
|------|------------|
| **Real-time chat** | Polling API (~5 s interval) keeps messages & active-users list fresh without WebSockets |
| **Authentication** | Username-only login, JWT cookies, multi-session support (one user ↔ many devices) |
| **Message feed** | Shows sender, timestamp; prevents empty posts; username “dog” is blocked for fun |
| **Active users** | Deduplicated list—user appears once even if they have several open sessions |
| **i18n-ready UI** | Text pulled from a localisation layer; context-aware filters for RTL / LTR layouts |
| **Error handling** | Clear in-app notifications for network/service issues |
| **Security** | Input allow-listing, HTTPS ready, no passwords stored, HTTP-only cookies |

---

## 🛠 Tech Stack
| Layer      | Tools & Libraries |
|------------|------------------|
| **Frontend** | React (Hooks, Context API), Vite, CSS Modules |
| **Backend**  | Node.js, Express.js, cookie-parser, jsonwebtoken |
| **Database** | MongoDB with indexes tuned for chat-style reads/writes |
| **DevOps**   | Docker, GitHub Actions CI/CD, Render / AWS for hosting |

---

## 🚀 Quick Start

```bash
# clone & install
git clone https://github.com/your-user/js-chat.git
cd js-chat
npm install

# create environment file
cp .env.example .env           # then add JWT_SECRET and MONGODB_URI

# run in dev mode
npm run dev                    # concurrently starts client & server

# build & start production server
npm run build                  # bundles React
npm start                      # serves dist/ and API at http://localhost:3000
