const jswt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        //récupération du token d'identification (format : Bearer TOKEN)
        const token = req.headers.authorization.split(' ')[1]
        //décodage du token
        const decodedToken = jswt.verify(token, 'RANDOM_TOKEN_SECRET')
        const userId = decodedToken.userId
        console.log("userId")
        console.log(userId)
        req.auth = {
            userId: userId
        }
        next()
    }
    catch(error){
        res.status(401).json({error})
    }
}