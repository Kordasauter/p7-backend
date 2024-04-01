const User = require('../models/User');
const bcrypt = require('bcrypt')
const jswt = require('jsonwebtoken')

exports.addUser = (req,res,next) => {
    
    let forbiddenChars = new RegExp(/[\'&é~"#{\(\[|è`\\ç^à\)\]=}\*¨$£¤ù%µ§:\/;,\?<>]/)

    //si un caractère spécial est trouvé dans le mail
    if(forbiddenChars.test(req.body.email))
        res.status(400).json({message:'format d\'e-mail non valide'})
    else
    {
        if(req.body.email.split('@').length == 2 )
        {
            if(req.body.email.split('@')[1].split('.').length == 2)
            {
                //hash du mot de passe
                bcrypt.hash(req.body.password,10)
                .then(hash => {
                    const user = new User({
                        email: req.body.email,
                        password: hash
                    })
                    user.save()
                    .then (()=> {
                        res.status(201).json({message : 'Utilisateur '+ user.email +' crée'})
                    })
                    .catch(error => res.status(400).json({error}))
                })
                .catch(error => res.status(500).json({error}))
            }
            else
                res.status(400).json({message:'format d\'e-mail non valide'})
        }
        else
            res.status(400).json({message:'format d\'e-mail non valide'})
        //         console.log(req.body.email.split('@')[1].split('.').length)
        // res.status(201).json({message : 'ok'})
    }

    //hash du mot de passe
    // bcrypt.hash(req.body.password,10)
    // .then(hash => {
    //     const user = new User({
    //         email: req.body.email,
    //         password: hash
    //     })
    //     user.save()
    //     .then (()=> {
    //         res.status(201).json({message : 'Utilisateur '+ user.email +' crée'})
    //     })
    //     .catch(error => res.status(400).json({error}))
    // })
    // .catch(error => res.status(500).json({error}))
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