const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/user')
const booksRoutes = require('./routes/book')
const MongoDBURI = require('./.env/MongoDBURI')

const app = express();

//connexion à mongoDB
mongoose.connect(MongoDBURI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
//Accès au body des requetes
app.use(express.json());
//Résoud le CORS policy
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//Ajout des routes
app.use('/api/auth',authRoutes)
app.use('/api/books',booksRoutes)
//Gestion des images
app.use('/images', express.static(path.join(__dirname,'images')))

module.exports = app;