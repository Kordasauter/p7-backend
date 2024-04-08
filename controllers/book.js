//modele de Book
const Book = require('../models/Book');
//file system
const fs = require('fs')

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
    //sort = tri dans l'ordre décroissant
    //https://www.w3schools.com/nodejs/nodejs_mongodb_sort.asp
    //limit = limite le nombre d'élement retourné
    //https://www.w3schools.com/nodejs/nodejs_mongodb_limit.asp
    Book.find().sort({averageRating: -1}).limit(3)
    .then((books) => {
        res.status(200).json(books)
     })
     .catch(error => res.status(500).json({error}))
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
    delete bookObject._userId
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
    //Si la note n'est pas comprise entre 0 et 5 elle n'est pas valide
    if((newRate.grade >= 0) && (newRate.grade <= 5))
    {
        Book.findOne({_id: req.params.id})
        .then((book) => {
            let sumRates = 0
            let validRating = true;
            //vérifie si l'utilisateur n'as jamais saisie de note pour ce livre
            for(let i = 0;i < book.ratings.length;i++)
            {
                sumRates += book.ratings[i].grade
                //si l'userId de l'utilisateur est déjà présent dans les livre on invalide la note
                if(book.ratings[i].userId == req.auth.userId)
                    validRating = false
            }
            if(validRating)
            {
                //ajout de la note au livre
                book.ratings.push(newRate)
                //ajout de la note à la somme des notes
                sumRates += newRate.grade
                //calcul de la moyenne
                book.averageRating = sumRates / book.ratings.length
                book.averageRating = book.averageRating.toFixed(1)
                //sauvegarde de la nouvelle note et de la note moyenne du livre 
                Book.updateOne({_id: req.params.id},{
                    ratings: book.ratings,
                    averageRating: book.averageRating
                })
                .then(() => res.status(200).json(book))
                .catch(error => res.status(401).json({error}))
            }
            else
                res.status(400).json({message:'livre déjà noté'})
        })
        .catch(error => res.status(400).json({error}))
    }
    else
        res.status(400).json({message:'note non valide'})
}