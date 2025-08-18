    const express = require("express");
    const UserRoteador = require("./backend/router/UsuarioRouter");
    const iaRoteador = require('./backend/router/chatRouter');
    const { connectToDatabase } = require('./backend/model/db');
    require('dotenv').config();  
    const cors = require('cors');


    module.exports = class Servidor {
        constructor() {
            this._porta = process.env.PORT;
            this._app = express();
            this._app.use(cors());
            this._app.use(express.json({ limit: '100mb' })); 
            this._app.use(express.urlencoded({ extended: true, limit: '100mb' })); 
            
            this._iaRoteador = new iaRoteador();
            this._userRoteador = new UserRoteador();
            
            this.configurarRotas();
        }

        configurarRotas = () => {
            this._app.use("/ia", this._iaRoteador.criarRotas());
            this._app.use("/user", this._userRoteador.criarRotas());
        }

        iniciar = async () => {
            try {
                await connectToDatabase();
                
                // Extrair informações do MongoDB da URL
                const mongoUrl = process.env.MONGODB_URI;
                let mongoInfo = '';
                if (mongoUrl) {
                    try {
                        const url = new URL(mongoUrl);
                        const mongoHost = url.hostname;
                        const mongoPort = url.port || '27017';
                        mongoInfo = ` | MongoDB: ${mongoHost}:${mongoPort}`;
                    } catch (urlError) {
                        mongoInfo = ' | MongoDB: URL inválida';
                    }
                }
                
                this._app.listen(this._porta, () => {
                    console.log(`Servidor rodando em http://localhost:${this._porta}/${mongoInfo}`);
                });
            } catch (error) {
                console.error('Erro ao iniciar o servidor:', error.message);
            }
        }
    }
