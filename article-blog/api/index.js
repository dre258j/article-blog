const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: true
}));

const USER = { username: 'admin', password: '1234' };

function loadPosts() {
  const filePath = path.join(__dirname, '../posts.json');
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  return JSON.parse(fs.readFileSync(filePath));
}

app.get('/', (req, res) => {
  const posts = loadPosts().reverse();
  res.render('index', { posts });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard');
});

app.get('/new', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('new-post');
});

app.post('/new', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { title, content } = req.body;
  const posts = loadPosts();
  posts.push({ title, content, date: new Date().toLocaleString() });
  fs.writeFileSync(path.join(__dirname, '../posts.json'), JSON.stringify(posts, null, 2));
  res.redirect('/');
});

module.exports = app;