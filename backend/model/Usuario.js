// Importa o módulo Banco para realizar conexões com o banco de dados.
const Banco = require('./Banco');

// Define a classe Usuarios para representar a entidade Usuarios.
class Usuario {
    // Construtor da classe Usuarios que inicializa as propriedades.
    constructor() {
        this._email = null;  // Email do Usuário.
        this._senha = null;  // Senha do Usuário.
    }

    // Método assíncrono para criar um novo Usuário no banco de dados.
    async create() {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.
        const SQL = 'INSERT INTO Usuarios (email, senha) VALUES (?, MD5(?));';

        try {
            const [result] = await conexao.promise().execute(SQL, [this._email, this._senha]);
            this._ = result.insertId;  // Armazena o ID gerado pelo banco de dados.
            return result.affectedRows > 0;  // Retorna true se a inserção foi bem-sucedida.
        } catch (error) {
            console.error('Erro ao criar o Usuário:', error);
            return false;
        }
    }

    // Método assíncrono para excluir um Usuário do banco de dados.
    async delete() {
        const conexao = Banco.getConexao();
        const SQL = 'DELETE FROM Usuarios WHERE email = ?;';

        try {
            const [result] = await conexao.promise().execute(SQL, [this._email]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao excluir o Usuário:', error);
            return false;
        }
    }

    // Método assíncrono para atualizar os dados de um Usuário no banco de dados.
    async update() {
        const conexao = Banco.getConexao();
        const SQL = 'UPDATE Usuarios SET senha = md5(?) WHERE email = ?;';
        try {
            const [result] = await conexao.promise().execute(SQL, [this._senha, this._email]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao atualizar o Usuário:', error);
            return false;
        }
    }

    // Método assíncrono para ler todos os Usuários do banco de dados.
    async readAll() {
        const conexao = Banco.getConexao();
        const SQL = 'SELECT * FROM Usuarios ORDER BY email;';

        try {
            const [rows] = await conexao.promise().execute(SQL);
            return rows;
        } catch (error) {
            console.error('Erro ao ler Usuários:', error);
            return [];
        }
    }

    // Método assíncrono para ler um Usuário pelo seu ID.
    async readByID() {

        const conexao = Banco.getConexao();
        const SQL = 'SELECT * FROM Usuarios WHERE email = ?;';
        try {
            const [rows] = await conexao.promise().execute(SQL, [this._email]);
            return rows;
        } catch (error) {
            console.error('Erro ao ler Usuário pelo ID:', error);
            return null;
        }
    }

    async isUsuarioByEmail(email) {
        const conexao = Banco.getConexao();  // Obtém a conexão com o banco de dados.

        const SQL = 'SELECT COUNT(*) AS qtd FROM Usuarios WHERE email = ?;';  
        try {
            const [rows] = await conexao.promise().execute(SQL, [email]);  // Executa a query.
            return rows[0].qtd > 0;  // Retorna true se houver algum email no banco
        } catch (error) {
            console.error('Erro ao verificar o email:', error);  // Exibe erro no console se houver falha.
            return false;  // Retorna false caso ocorra um erro.
        }
    }
    async login() {
        const conexao = Banco.getConexao(); // Obtém a conexão com o banco de dados.
        const SQL = `
            SELECT COUNT(*) AS qtd, email
            FROM Usuarios 
            WHERE email = ? AND senha = MD5(?);
        `; // Query SQL para selecionar o Usuário com base no email e senha.

        try {
            // Prepara e executa a consulta SQL com parâmetros.
            const [rows] = await conexao.promise().execute(SQL, [this._email, this._senha]);

            if (rows.length > 0 && rows[0].qtd === 1) {
                const tupla = rows[0];
                // Configura os atributos do Usuário.
                this._email = tupla.email;

                return true; // Login bem-sucedido.
            }

            return false; // Login falhou.
        } catch (error) {
            console.error('Erro ao realizar o login:', error); // Exibe erro no console se houver falha.
            return false; // Retorna false caso ocorra um erro.
        }
    }

    // Getters e setters para as propriedades da classe.

    get email() {
        return this._email;
    }

    set email(email) {
        this._email = email;

    }

    get senha() {
        return this._senha;
    }

    set senha(senha) {
        this._senha = senha;

    }
}

// Exporta a classe Usuarios para que possa ser utilizada em outros módulos.
module.exports = Usuario;
