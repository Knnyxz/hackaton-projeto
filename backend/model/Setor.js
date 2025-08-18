// Importa o módulo Banco para realizar conexões com o banco de dados.
const Banco = require('./Banco');

// Define a classe Setor para representar a entidade Setor.
class Setor {
    // Construtor da classe Setor que inicializa as propriedades.
    constructor() {
        this._idSetor = null;  // ID do setor, inicialmente nulo.
        this._nomeSetor = null;  // Nome do setor, inicialmente uma string vazia.
    }

    // Método assíncrono para criar um novo setor no banco de dados.
    async create() {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'INSERT INTO setores (nome_setor) VALUES (?);';  // Query SQL para inserir o nome do setor.

        try {
            const [result] = await conexao.promise().execute(SQL, [this._nomeSetor]);  // Executa a query.
            this._idSetor = result.insertId;  // Armazena o ID gerado pelo banco de dados.
            return result.affectedRows > 0;  // Retorna true se a inserção afetou alguma linha.
        } catch (error) {
            console.error('Erro ao criar o setor:', error);  // Exibe erro no console se houver falha.
            return false;  // Retorna false caso ocorra um erro.
        }
    }

    // Método assíncrono para excluir um setor do banco de dados.
    async delete() {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'DELETE FROM setores WHERE id_setor = ?;';  // Query SQL para deletar um setor pelo ID.

        try {
            const [result] = await conexao.promise().execute(SQL, [this._idSetor]);  // Executa a query de exclusão.
            return result.affectedRows > 0;  // Retorna true se alguma linha foi afetada (setor deletado).
        } catch (error) {
            console.error('Erro ao excluir o setor:', error);  // Exibe erro no console se houver falha.
            return false;  // Retorna false caso ocorra um erro.
        }
    }

    // Método assíncrono para atualizar os dados de um setor no banco de dados.
    async update() {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'UPDATE setores SET nome_setor = ? WHERE id_setor = ?;';  // Query SQL para atualizar o nome de um setor.

        try {
            const [result] = await conexao.promise().execute(SQL, [this._nomeSetor, this._idSetor]);  // Executa a query de atualização.
            return result.affectedRows > 0;  // Retorna true se a atualização afetou alguma linha.
        } catch (error) {
            console.error('Erro ao atualizar o setor:', error);  // Exibe erro no console se houver falha.
            return false;  // Retorna false caso ocorra um erro.
        }
    }

    // Método assíncrono para verificar se um setor já existe no banco de dados.
    async isSetorByNomeSetor() {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'SELECT COUNT(*) AS qtd FROM setores WHERE nome_setor = ?;';  // Query SQL para contar setores com o mesmo nome.

        try {
            const [rows] = await conexao.promise().execute(SQL, [this._nomeSetor]);  // Executa a query.
            return rows[0].qtd > 0;  // Retorna true se houver algum setor com o mesmo nome.
        } catch (error) {
            console.error('Erro ao verificar o setor:', error);  // Exibe erro no console se houver falha.
            return false;  // Retorna false caso ocorra um erro.
        }
    }

    // Método assíncrono para verificar se um setor existe pelo ID.
    async isSetorById(idSetor) {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'SELECT COUNT(*) AS qtd FROM setores WHERE id_setor = ?;';  // Query SQL para contar setores pelo ID.

        try {
            const [rows] = await conexao.promise().execute(SQL, [idSetor]); // Executa a query.
            return rows[0].qtd > 0;  // Retorna true se houver algum setor com o mesmo ID.
        } catch (error) {
            console.error('Erro ao verificar o setor:', error);  // Exibe erro no console se houver falha.
            return false;  // Retorna false caso ocorra um erro.
        }
    }

    // Método assíncrono para ler todos os setores do banco de dados.
    async readAll() {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'SELECT * FROM setores ORDER BY nome_setor;';  // Query SQL para selecionar todos os setores ordenados pelo nome.

        try {
            const [rows] = await conexao.promise().execute(SQL);  // Executa a query de seleção.
            return rows;  // Retorna a lista de setores.
        } catch (error) {
            console.error('Erro ao ler setores:', error);  // Exibe erro no console se houver falha.
            return [];  // Retorna uma lista vazia caso ocorra um erro.
        }
    }

    // Método assíncrono para ler um setor pelo seu ID.
    async readByID() {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'SELECT * FROM setores WHERE id_setor = ?;';  // Query SQL para selecionar um setor pelo ID.

        try {
            const [rows] = await conexao.promise().execute(SQL, [this._idSetor]);  // Executa a query de seleção.
            return rows;  // Retorna o setor correspondente ao ID.
        } catch (error) {
            console.error('Erro ao ler setor pelo ID:', error);  // Exibe erro no console se houver falha.
            return null;  // Retorna null caso ocorra um erro.
        }
    }

    // Getter para obter o valor de idSetor.
    get idSetor() {
        return this._idSetor;
    }

    // Setter para definir o valor de idSetor.
    set idSetor(idSetor) {
        this._idSetor = idSetor;
        return this;  // Retorna a instância atual para permitir encadeamento de chamadas.
    }

    // Getter para obter o valor de nomeSetor.
    get nomeSetor() {
        return this._nomeSetor;
    }

    // Setter para definir o valor de nomeSetor.
    set nomeSetor(nomeSetor) {
        this._nomeSetor = nomeSetor;
        return this;  // Retorna a instância atual para permitir encadeamento de chamadas.
    }
}

// Exporta a classe Setor para que possa ser utilizada em outros módulos.
module.exports = Setor;