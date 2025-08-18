// Importa o módulo express para criação de APIs.
const express = require('express');
// Importa o modelo Setor para realizar operações relacionadas à entidade Setor.
const Setor = require('../model/Setor');

// Exporta a classe SetorControl, que controla as operações de CRUD (Create, Read, Update, Delete) para o Setor.
module.exports = class SetorControl {
    // Método assíncrono para criar um novo setor.
    async create(request, response) {
        // Cria uma nova instância do modelo Setor.
        const setor = new Setor();
        // Atribui o nome do setor passado no corpo da requisição (request body) à instância criada.
        setor.nomeSetor = request.body.setor.nome_setor;
        // Chama o método create() do modelo Setor para inserir o novo setor no banco de dados.
        const isCreated = await setor.create();
        // Cria um objeto de resposta contendo o código, status e a mensagem de sucesso ou erro.
        const objResposta = {
            cod: 1,
            status: isCreated,
            msg: isCreated ? 'Setor criado com sucesso' : 'Erro ao criar o setor'
        };
        // Envia a resposta HTTP com status 200 e o objeto de resposta.
        response.status(200).send(objResposta);
    }

    async createByJSON(request, response) {
        console.log('Request body:', request.body);
        // Verifica se o arquivo foi enviado
        if (!request.body) {
            return response.status(400).send({
                cod: 0,
                status: false,
                msg: "Nenhum arquivo foi enviado."
            });
        }
    
        const setoresCriados = [];
    
        try {
            // Since request.body is already an object, we don't need to parse it
            const jsonData = request.body; // Remove JSON.parse here
    
            // Verifica se o JSON contém um array de setores
            if (!jsonData.setores || !Array.isArray(jsonData.setores)) {
                return response.status(400).send({
                    cod: 0,
                    status: false,
                    msg: "Formato do JSON inválido. Esperado um array de setores."
                });
            }
    
            // Itera sobre cada setor no array
            for (const item of jsonData.setores) {
                const setor = new Setor();
                setor.nomeSetor = item.nome_setor; // Atribui o nome do setor
    
                // Chama o método create() do modelo Setor para inserir o novo setor no banco de dados
                const isCreated = await setor.create();
                setoresCriados.push({
                    nome_setor: setor.nomeSetor,
                    created: isCreated
                });
            }
    
            // Cria um objeto de resposta com o resultado da criação
            const objResposta = {
                cod: 1,
                status: true,
                msg: 'Setores cadastrados com sucesso',
                setores: setoresCriados
            };
    
            // Envia a resposta HTTP com status 201 e o objeto de resposta
            response.status(201).send(objResposta);
        } catch (error) {
            console.error('Erro ao processar o arquivo JSON:', error);
            return response.status(500).send({
                cod: 0,
                status: false,
                msg: "Erro ao processar o arquivo JSON.",
                error: error.message
            });
        }
    }

    // Método assíncrono para excluir um setor existente.
    async delete(request, response) {
        // Cria uma nova instância do modelo Setor.
        const setor = new Setor();
        // Atribui o ID do setor passado como parâmetro na URL (request params) à instância criada.
        setor.idSetor = request.params.id_setor;
        // Chama o método delete() do modelo Setor para excluir o setor do banco de dados.
        const isDeleted = await setor.delete();
        // Cria um objeto de resposta com o código, status e a mensagem de sucesso ou erro.
        const objResposta = {
            cod: 1,
            status: isDeleted,
            msg: isDeleted ? 'Setor excluído com sucesso' : 'Erro ao excluir o setor'
        };
        // Envia a resposta HTTP com status 200 e o objeto de resposta.
        response.status(200).send(objResposta);
    }

    // Método assíncrono para atualizar um setor existente.
    async update(request, response) {
        // Cria uma nova instância do modelo Setor.
        const setor = new Setor();
        // Atribui o ID e o nome do setor passados na URL e no corpo da requisição, respectivamente.
        setor.idSetor = request.params.id_setor;
        setor.nomeSetor = request.body.setor.nome_setor;
        // Chama o método update() do modelo Setor para atualizar o setor no banco de dados.
        const isUpdated = await setor.update();
        // Cria um objeto de resposta com o código, status e a mensagem de sucesso ou erro.
        const objResposta = {
            cod: 1,
            status: isUpdated,
            msg: isUpdated ? 'Setor atualizado com sucesso' : 'Erro ao atualizar o setor'
        };
        // Envia a resposta HTTP com status 200 e o objeto de resposta.
        response.status(200).send(objResposta);
    }

    // Método assíncrono para obter todos os setores.
    async readAll(request, response) {
        // Cria uma nova instância do modelo Setor.
        const setor = new Setor();
        // Chama o método readAll() para buscar todos os setores no banco de dados.
        const resultado = await setor.readAll();
        // Cria um objeto de resposta contendo o código, status, mensagem e a lista de setores.
        const objResposta = {
            cod: 1,
            status: true,
            msg: 'Executado com sucesso',
            setores: resultado
        };
        // Envia a resposta HTTP com status 200 e o objeto de resposta.
        response.status(200).send(objResposta);
    }

    // Método para buscar um setor pelo ID
    async readById(request, response) {
        // Cria uma nova instância do modelo Setor.
        const setor = new Setor();
        // Atribui o ID do setor passado como parâmetro na URL (request params) à instância criada.
        setor.idSetor = request.params.id_setor;

        // Chama o método readByID() para buscar o setor pelo ID no banco de dados.
        const resultado = await setor.readByID();
        // Cria um objeto de resposta contendo o código, status, mensagem e o setor encontrado (ou não).
        const objResposta = {
            cod: 1,
            status: true,
            msg: resultado ? 'Setor encontrado' : 'Setor não encontrado',
            setor: resultado
        };
        // Envia a resposta HTTP com status 200 e o objeto de resposta.
        response.status(200).send(objResposta);
    }
};