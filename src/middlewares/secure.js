const { decode } = require('../utils/jwt')

function checkAdmin() {
    return (req, res, next) => {
        if (req.headers.authorization) {
            const data = decode(req.headers.authorization)

            if (data && (data.admin === 1 || data.admin === true)) {
                req.body.idUsuario = data.id
                return next()
            }
        }

        const error = new Error('Privilegios insuficientes')
        error.status = 401
        next(error)
    }
}

module.exports = { checkAdmin }
