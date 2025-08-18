const jwt = require('jsonwebtoken');

module.exports = class MeuTokenJWT {
    constructor() {
        this._key = "sua-chave-secreta"; 
        this._alg = 'HS256';
        this._type = 'JWT';
        this._iss = 'http://localhost';
        this._aud = 'http://localhost';
        this._sub = "acesso_sistema";
        this._duracaoToken = 3600 * 24; 
    }

    gerarToken(parametroClaims) {
        const headers = {
            alg: this._alg,
            typ: this._type
        };

        const payload = {
            iss: this._iss,
            aud: this._aud,
            sub: this._sub,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this._duracaoToken,
            nbf: Math.floor(Date.now() / 1000),
            jti: require('crypto').randomBytes(16).toString('hex'),
            email: parametroClaims.email,
            name: parametroClaims.name,
            id: parametroClaims.id
        };


        return jwt.sign(payload, this._key, { algorithm: this._alg, header: headers });
    }

    validarToken(stringToken) {
        if (!stringToken || stringToken.trim() === "") {
            return false;
        }
        const token = stringToken.replace("Bearer ", "").trim();
        try {
            const decoded = jwt.verify(token, this._key, { algorithms: [this._alg] });
            this.payload = decoded;
            return true;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                console.error("Token expirado");
            } else if (err instanceof jwt.JsonWebTokenError) {
                console.error("Token inválido");
            } else {
                console.error("Erro geral", err);
            }
            return false;
        }
    }

    getPayload() {
        return this.payload;
    }

    verificarToken(token) {
        if (!token || token.trim() === "") {
            throw new Error("Token não fornecido");
        }
        
        try {
            const tokenLimpo = token.replace("Bearer ", "").trim();
            const decoded = jwt.verify(tokenLimpo, this._key, { algorithms: [this._alg] });
            return decoded;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new Error("Token expirado");
            } else if (err instanceof jwt.JsonWebTokenError) {
                throw new Error("Token inválido");
            } else {
                throw new Error("Erro ao verificar token");
            }
        }
    }
}