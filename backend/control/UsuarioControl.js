const express = require('express');
const Usuario = require('../model/Usuario');
const jwtClass = require('../model/MeuTokenJWT');

module.exports = class UsuarioControl {
    async login(request, response) {

        const usuario = new Usuario();

        usuario.email = request.body.usuario.email
        usuario.senha = request.body.usuario.senha

        const logou = usuario.login();
        if (logou == true) {
            const objResposta = {
                cod: 1,
                status: logou,
                msg: 'logado com sucesso'
            };
            response.status(200).send(objResposta);
        } else {
            const objResposta = {
                cod: 2,
                status: isCreated,
                msg: "erro ao efetuar login"
            };
            response.status(401).send(objResposta);
        }
    }

    async readAll(request, response) {
        const usuario = new Usuario();
        const dadosUsuarios = await usuario.readAll();
        const objResposta = {
            cod: 1,
            status: true,
            usuarios: dadosUsuarios
        }
        response.status(200).send(objResposta);

    }

    async readById(request, response) {
        const usuario = new Usuario();
        const email = request.params.email

        usuario.email = email;

        const dadosUsuarios = await usuario.readByID();
        const objResposta = {
            cod: 1,
            status: true,
            usuarios: dadosUsuarios
        }
        response.status(200).send(objResposta);
    }

    async create(request, response) {
        const usuario = new Usuario();

        usuario.email = request.body.usuario.email;
        usuario.senha = request.body.usuario.senha;

        const cadastrou = await usuario.create();
        if (cadastrou == true) {
            const objResposta = {
                cod: 1,
                status: true,
                usuarios: [{
                    "usuario": {
                        "email": usuario.email
                    }
                }]
            }
            response.status(201).send(objResposta);
        } else {
            const objResposta = {
                cod: 1,
                status: false,
                msg: "Falha ao cadastrar funcionário",
                usuarios: [{
                    "usuario": {
                        "email": usuario.email
                    }
                }]
            }
            response.status(200).send(objResposta);
        }
    }

    async update(request, response) {

        const usuario = new Usuario();

        usuario.email = request.params.email;
        usuario.senha = request.body.usuario.senha;

        const atualizou = await usuario.update();
        if (atualizou == true) {
            const objResposta = {
                cod: 1,
                status: true,
                usuarios: [{
                    "usuario": {
                        "email": usuario.email
                    }
                }]
            }
            response.status(200).send(objResposta);
        } else {
            const objResposta = {
                cod: 1,
                status: false,
                msg: "Falha ao atualizar funcionário",
                usuarios: [{
                    "usuario": {
                        "email": usuario.email
                    }
                }]
            }
            response.status(200).send(objResposta);
        }
    }


    async delete(request, response) {

        const usuario = new Usuario();
        usuario.email = request.params.email;


        const excluiu = await usuario.delete();
        if (excluiu == true) {
            const objResposta = {
                cod: 1,
                status: true,
                msg: "Excluido com sucesso",
                usuarios: [{
                    "usuario": {
                        "email": usuario.email
                    }
                }]
            }
            response.status(200).send(objResposta);
        } else {
            const objResposta = {
                cod: 1,
                status: false,
                msg: "Falha ao excluir funcionário",
                usuarios: [{
                    "usuario": {
                        "email": usuario.email
                    }
                }]
            }
            response.status(200).send(objResposta);
        }
    }
};
