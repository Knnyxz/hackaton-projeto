// Importa o módulo express para criação de APIs.
const express = require('express');
const Usuario = require('../model/Usuario');
const MeuTokenJWT = require('../model/MeuTokenJWT');

module.exports = class LoginControl {

    async login(request, response) {

        console.log(request);
        const usuario = new Usuario();
        if(request.body.usuario == null){
            const objResposta = {
                status: false,
                cod: 1,
                msg: 'logado sem sucesso',

                usuario: null
            }
            return response.status(401).send(objResposta);
        }
        usuario.email = request.body.usuario.email;
        usuario.senha = request.body.usuario.senha;

        const logou = await usuario.login();

        if (logou == true) {
            const payloadToken = {
                email: usuario.email,
            }
            const jwt = new MeuTokenJWT();
            const token_string = jwt.gerarToken(payloadToken);

            const objResposta = {
                status: true,
                cod: 1,
                msg: 'logado com sucesso',

                usuario: {
                    email: usuario.email
                },

                token: token_string,

            }
            return response.status(200).send(objResposta);
        }else{
            const objResposta={
                status:false,
                msg:'usuário ou senha inválidos'
            }
            return response.status(401).send(objResposta);
        }


    }


};
