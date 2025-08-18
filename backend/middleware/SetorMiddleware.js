// Importa o modelo Setor para verificar se o nome já existe no banco de dados.
const Setor = require('../model/Setor');

// Exporta a classe SetorMiddleware, que contém funções de validação para as requisições.
module.exports = class SetorMiddleware {
    // Método para validar o nome do setor antes de prosseguir com a criação ou atualização.
    async validar_NomeSetor(request, response, next) {
        if(request.body.setor == null){
            const objResposta = {
                status: false,
                msg: "Setor NULL."
            };
            return response.status(400).send(objResposta);
        }
        // Recupera o nome do setor enviado no corpo da requisição (request body).
        const nome_setor = request.body.setor.nome_setor;

        // Verifica se o nome do setor tem menos de 3 caracteres.
        if (nome_setor.length < 3) {
            // Se o nome for inválido, cria um objeto de resposta com o status falso e a mensagem de erro.
            const objResposta = {
                status: false,
                msg: "O nome deve ter mais do que 3 letras"
            };
            // Envia a resposta com status HTTP 400 e a mensagem de erro.
            return response.status(400).send(objResposta);
        } else {
            // Caso o nome seja válido, chama o próximo middleware ou a rota definida.
            next(); // Chama o próximo middleware ou rota
        }
    }

    // Método assíncrono para verificar se já existe um setor com o mesmo nome cadastrado.
    async isNot_setorByNomeSetor(request, response, next) {
        if(request.body.setor == null){
            const objResposta = {
                status: false,
                msg: "Setor NULL."
            };
            return response.status(400).send(objResposta);
        }
        // Recupera o nome do setor enviado no corpo da requisição (request body).
        const nome_setor = request.body.setor.nome_setor;

        // Cria uma nova instância do modelo Setor.
        const objSetor = new Setor();
        // Define o nome do setor na instância do modelo.
        objSetor.nome_setor = nome_setor;

        // Verifica se o setor já existe no banco de dados chamando o método isSetorByNomeSetor().
        const setorExiste = await objSetor.isSetorByNomeSetor();

        // Se o setor já existir no banco de dados, cria um objeto de resposta com o status falso e uma mensagem de erro.
        if (!setorExiste) {
            next(); // Chama o próximo middleware ou rota
        } else {
            const objResposta = {
                status: false,
                msg: "Não é possível cadastrar um setor com o mesmo nome de um setor existente"
            };
            return response.status(400).send(objResposta);
        }
    }

    // Método assíncrono para verificar se um setor existe pelo ID.
    async isSetorById(request, response, next) {
        if(request.body.setor == null){
            const objResposta = {
                status: false,
                msg: "Setor NULL."
            };
            return response.status(400).send(objResposta);
        }
        const idSetor = request.params.id_categoria;

        const objSetor = new Setor();

        const setorExiste = await objSetor.isSetorById(idSetor);

        if (setorExiste) {
            next();
        } else {
            const objResposta = {
                status: false,
                msg: "Setor não existe"
            };

            return response.status(400).send(objResposta);
        }
    }
};