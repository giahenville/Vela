# Vela

**Vela** is a basic full-stack web application with a static HTML/CSS/JavaScript frontend and an Express.js backend. It serves static assets and exposes simple API routes — great as a starting point for more complex apps.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/vela.git
   cd vela
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server in development mode:

   ```bash
   npm run dev
   ```

   Or in production mode:

   ```bash
   npm start
   ```

4. Open your browser and go to:  
   [http://localhost:3000](http://localhost:3000)

---

## 📁 File Structure

```
Vela/
├── public/                # Static files served directly (frontend assets)
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── index.html         # Your main HTML file
│
├── src/                   # Source code
│   └── routes/
│       └── api.js         # Express route handlers
│
├── views/                 # (Optional) For templating engines like EJS or Pug
│   └── layout.ejs
│
├── .gitignore
├── package.json
├── README.md
└── server.js              # Entry point for the Express backend
```

---

## 📦 Scripts

| Script     | Description                     |
|------------|---------------------------------|
| `start`    | Runs the app with Node.js       |
| `dev`      | Runs the app with `nodemon`     |

---

## 📌 Notes

- Static files (HTML, CSS, JS) are served from the `/public` directory.
- Backend routes are located under `/src/routes`.
- You can expand the project with templating engines, database integration, or API endpoints.

---

## 📝 License

This project is licensed under the MIT License.
