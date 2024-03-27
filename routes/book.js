const express = require('express')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const router = express.Router({mergeParams: true})

const bookController = require('../controllers/book')
///api/books

//Authentification non requise
router.get('/',bookController.getAllBooks)//fait
router.get('/bestrating',bookController.getBestRatedBooks)//fait
// router.get('/init',bookController.initDB)
router.get('/:id', bookController.getOneBook)//fait



//Authentification requise
router.post('/', auth, multer, bookController.addBook)//fait
router.put('/:id', auth, multer, bookController.modifyBook)//fait
router.delete('/:id', auth, bookController.deleteBook)//fait
router.post('/:id/rating', auth, bookController.rateBook)//fait

module.exports = router