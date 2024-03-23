//modele de Book
const Book = require('../models/Book');
//file system
const fs = require('fs')
//JsonWebToken, token d'authentification
// const jswt = require('jsonwebtoken')

exports.getAllBooks = (req,res,next) => {
     Book.find().then((books) => {
        res.status(200).json(books)
     })
}
exports.getOneBook = (req,res,next) => {
    Book.findOne({_id: req.params.id})
    .then((book) => res.status(200).json(book))
    .catch((error)=> res.status(500).json({error}))

}
exports.getBestRatedBooks = (req,res,next) => {
    Book.find().then((books) => {
        // res.status(200).json(books)
        let bestBooks = new Array(Book);
        books.map(book =>
            {
                console.log(book.averageRating)
                console.log(book.averageRating)
            })
     })
     .catch(error => res.status(500).json({error}))
    // console.log("ici")
    let bestBooks = ['livre 1','livre 2','livre 3']
    res.status(200).json(bestBooks)
}
exports.addBook = (req,res,next) => {
    const bookObject = JSON.parse(req.body.book)
    //supprime l'Id de l'objet et de l'utilitsateur, 
    delete bookObject._id; //sera généré par MongoDB
    delete bookObject._userId;//sera ajouter dans le contructeur du livre
    //Constructeur du nouveau livre
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    //Sauvegarde du nouveau livre dans la BDD
    book.save()
    .then(() => {
        res.status(201).json({message : 'livre enregistré'})
    })
    .catch(error => res.status(500).json({error}))
}
exports.modifyBook = (req,res,next) => {
    const bookObject = req.file?{
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }:{...req.body}
    //suppression du userId venant du client
    //pour eviter toute réappropriation du livre
    console.log("avant : ")
    console.log(bookObject)
    delete bookObject._userId
    console.log("après : ")
    console.log(bookObject)
    Book.findOne({_id: req.params.id})
    .then((book) =>{
        //si le livre à été posté par un autre utilisateur, il n'as pas le droit de le modifier
        if(book.userId != req.auth.userId)
            res.status(401).json({message: 'not authirized'})
        else{
            Book.updateOne({_id: req.params.id},{...bookObject, _id:req.params.id})
            .then(()=> res.status(200).json({message:'livre mis à jour'}))
            .catch(error => res.status(401).json({error}))
        }
    })
    .catch(error => res.status(400).json({error}))
}
exports.deleteBook = (req,res,next) => {
    Book.findOne({_id: req.params.id})
    .then((book) =>{
        //si le livre à été posté par un autre utilisateur, il n'as pas le droit de le modifier
        if(book.userId != req.auth.userId)
            res.status(401).json({message: 'not authirized'})
        else{
            const filename = book.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, ()=> {
                Book.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({message: 'Livre supprimé'}))
                .catch(error => res.status(401).json({error}))
            })
        }
    })
    .catch(error => res.status(400).json({error}))
}
exports.rateBook = (req,res,next) => {
    const newRate = {userId:req.auth.userId,grade:req.body.rating}
    Book.findOne({_id: req.params.id})
    .then((book) => {
        book.ratings.push(newRate)
        let sumRates = 0;
        for(let i = 0;i < book.ratings.length;i++)
        {
            sumRates += book.ratings[i].grade
        }
        book.averageRating = Math.floor(sumRates / book.ratings.length)
        Book.updateOne({_id: req.params.id},{
            ratings: book.ratings,
            averageRating: book.averageRating
        })
        .then(() => res.status(200).json(book))
        .catch(error => res.status(401).json({error}))
    })
    .catch(error => res.status(400).json({error}))
}