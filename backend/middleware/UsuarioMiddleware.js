
const Usuario = require('../model/Usuario');

module.exports = class UsuarioMiddleware {


    async isNotEmailCadastrado(request, response, next) {

        if(request.body.usuario == null){
            const objResposta = {
                status: false,
                msg: "Usuario NULL."
            };
            return response.status(400).send(objResposta);
        }
        const email = request.body.usuario.email;
        const usuario = new Usuario();
        const is = await usuario.isUsuarioByEmail(email);

        if (is == false) {
            next();
        } else {
            const objResposta = {
                status: false,
                msg: "Já existe um usuário cadastrado com este e-mail"
            }

            response.status(400).send(objResposta);
        }
    }

    async validate_emailUsuario(request, response, next) {

        if(request.body.usuario == null && request.params.email == null){
            const objResposta = {
                status: false,
                msg: "Usuario NULL."
            };
            return response.status(400).send(objResposta);
        }
        const email = request.params.email == null ? request.body.usuario.email : request.params.email;

        // Verifica se o e-mail contém "@" e "."
        const atIndex = email.indexOf('@');
        const dotIndex = email.lastIndexOf('.');

        // Verifica se o "@" vem antes do ".", se ambos existem e se há caracteres suficientes antes e depois
        if (atIndex < 1 || dotIndex < atIndex + 2 || dotIndex + 2 >= email.length) {
            const objResposta = {
                status: false,
                msg: "E-mail inválido. Por favor, insira um e-mail válido."
            };
            return response.status(400).send(objResposta);
        }

        // Se todas as verificações passarem, o e-mail é considerado válido
        next();
    }


    async validate_senhaUsuario(request, response, next) {
        if(request.body.usuario == null){
            const objResposta = {
                status: false,
                msg: "Usuario NULL."
            };
            return response.status(400).send(objResposta);
        }

        const senha = request.body.usuario.senha;

        // Verifica se a senha tem pelo menos 6 caracteres
        if (senha.length < 6) {
            return response.status(400).send({
                status: false,
                msg: "A senha deve ter no mínimo 6 caracteres."
            });
        }

        // Verifica se a senha contém pelo menos uma letra
        let temLetra = false;
        for (let i = 0; i < senha.length; i++) {
            if (isNaN(senha[i])) {  // isNaN verifica se o caractere não é um número
                temLetra = true;
                break;
            }
        }

        if (!temLetra) {
            return response.status(400).send({
                status: false,
                msg: "A senha deve conter pelo menos uma letra."
            });
        }

        // Verifica se a senha contém pelo menos um caractere especial
        const caracteresEspeciais = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~";
        let temCaractereEspecial = false;

        for (let i = 0; i < senha.length; i++) {
            if (caracteresEspeciais.includes(senha[i])) {
                temCaractereEspecial = true;
                break;
            }
        }

        if (!temCaractereEspecial) {
            return response.status(400).send({
                status: false,
                msg: "A senha deve conter pelo menos um caractere especial."
            });
        }

        // Se a senha atender a todos os critérios, continua para o próximo middleware
        next();
    }


}
