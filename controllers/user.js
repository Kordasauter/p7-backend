const User = require('../models/User');
const bcrypt = require('bcrypt')
const jswt = require('jsonwebtoken')

exports.addUser = (req,res,next) => {
    //hash du mot de passe
    // console.log(req.body)
    bcrypt.hash(req.body.password,10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        })
        user.save()
        .then (()=> {
            res.status(201).json({message : 'Utilisateur '+ user.email +' crée'})
            console.log('mail : ' + user.email + ' / password : '+ user.password)
        })
        .catch(error => res.status(400).json({error}))
    })
    .catch(error => res.status(500).json({error}))
}

exports.logUser = (req,res,next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(user === null){
            res.status(401).json({message:'E-mail et/ou mot de passe incorrecte'})
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid)
                    res.status(401).json({message:'E-mail et/ou mot de passe incorrecte'})
                else{
                    console.log(user)
                    res.status(200).json({
                        userId : user._id,
                        // token: 'TOKEN'
                        token: jswt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h'}
                        )
                    })}
            })
            .catch(error => {res.status(500).json({error})})
        }
    })
    .catch(error => res.status(500).json({error}))
}