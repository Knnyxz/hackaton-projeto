
const MeuTokenJWT = require('../model/MeuTokenJWT');

module.exports = class JwtMiddleware {

    validate(request, response, next) {
        const authHeader = request.headers['authorization'];

        // Verifica se o cabeçalho Authorization existe e começa com "Bearer "
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Extrai o token removendo "Bearer " do início da string
            const token = authHeader.split(' ')[1];

            const objMeuTokenJWT = new MeuTokenJWT();
            if (objMeuTokenJWT.validarToken(token) == true) {
                next();
            } else {
                response.status(401).json({ status: false, msg: 'Token não fornecido ou inválido' });
            }

        } else {
            // Se não houver token, retorna uma mensagem de erro
            response.status(401).json({ status: false, msg: 'Token não fornecido ou inválido' });
        }

    }

}
