const { MongoClient } = require('mongodb');
const axios = require('axios');
require('dotenv').config();

let isUpdating = false;

class Banco {
    static db = null;
    static client = null;

    static async connectToDatabase() {
        if (Banco.db) return Banco.db;
        
        try {
            const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
            Banco.client = new MongoClient(url);
            await Banco.client.connect();
            Banco.db = Banco.client.db(process.env.DB_NAME || 'loja');
            console.log('Conectado ao MongoDB');
            return Banco.db;
        } catch (err) {
            console.error('Erro ao conectar ao MongoDB:', err);
            throw err;
        }
    }
}

module.exports = Banco;