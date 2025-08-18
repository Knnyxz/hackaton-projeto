const express = require('express');

const SetorControl = require('../control/SetorControl');
const SetorMiddleware = require('../middleware/SetorMiddleware');
const JWTMiddleware = require('../middleware/JWTMiddleware');

module.exports = class SetorRouter {

    constructor() {
        this._router = express.Router();
        this._jwtMiddleware = new JWTMiddleware();
        this._setorControl = new SetorControl();
        this._setorMiddleware = new SetorMiddleware();
    }

    createRoutes() {
        const multer = require('multer');
        const upload = multer({ dest: 'uploads/' }); // Configura o multer para armazenar os arquivos na pasta 'uploads'

        this.router.get('/',
            this.jwtMiddleware.validate,
            this.setorControl.readAll // Método para ler todos os setores
        );

        this.router.get('/:id_setor',
            this.jwtMiddleware.validate,
            this.setorControl.readById // Método para ler um setor por ID
        );

        this.router.post('/',
            this.jwtMiddleware.validate,
            this.setorMiddleware.validar_NomeSetor, // Validação do nome do setor
            this.setorMiddleware.isNot_setorByNomeSetor, // Verifica se o setor já existe pelo nome
            this.setorControl.create // Método para criar um novo setor
        );

        this.router.delete('/:id_setor',
            this.jwtMiddleware.validate,
            this.setorControl.delete // Método para excluir um setor
        );

        this.router.put('/:id_setor',
            this.jwtMiddleware.validate,
            this.setorControl.update // Método para atualizar um setor
        );

        this.router.post('/json', 
            upload.single('variavelArquivo'), 
            this.setorControl.createByJSON
        );

        return this.router;
    }

    get router() {
        return this._router;
    }

    set router(newRouter) {
        this._router = newRouter;
    }

    get jwtMiddleware() {
        return this._jwtMiddleware;
    }

    set jwtMiddleware(newJwtMiddleware) {
        this._jwtMiddleware = newJwtMiddleware;
    }

    get setorControl() {
        return this._setorControl;
    }

    set setorControl(newSetorControl) {
        this._setorControl = newSetorControl;
    }

    get setorMiddleware() {
        return this._setorMiddleware;
    }

    set setorMiddleware(newSetorMiddleware) {
        this._setorMiddleware = newSetorMiddleware;
    }
}