# Vela

## File structure
Vela/
│
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
