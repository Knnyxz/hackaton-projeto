const express = require('express');
const UsuarioMiddleware = require('../middleware/UsuarioMiddleware');
const UsuarioControl = require('../control/UsuarioControl');
const JwtMiddleware = require('../middleware/JWTMiddleware');

module.exports = class UsuarioRouter {
    constructor() {
        this._router = express.Router();
        this._usuarioMiddleware = new UsuarioMiddleware();
        this._jwtMiddleware = new JwtMiddleware();
        this.usuarioControl = new UsuarioControl();
    }
    createRoutes() {
        this.router.get('/',
            this.jwtMiddleware.validate,
            this.usuarioControl.readAll
        );

        this.router.get('/:email',
            this.jwtMiddleware.validate,
            this.usuarioControl.readById
        );

        this.router.post('/',
            this.jwtMiddleware.validate,
            this.usuarioMiddleware.validate_emailUsuario,
            this.usuarioMiddleware.validate_senhaUsuario,
            this.usuarioMiddleware.isNotEmailCadastrado,
            this.usuarioControl.create
        );

        this.router.delete('/:email',
            this.jwtMiddleware.validate,
            this.usuarioControl.delete
        );

        this.router.put('/:email',
            this.jwtMiddleware.validate,
            this.usuarioMiddleware.validate_emailUsuario,
            this.usuarioMiddleware.validate_senhaUsuario,
            this.usuarioControl.update
        );

        return this._router;
    }

    get router() {
        return this._router;
    }

    set router(newRouter) {
        this._router = newRouter;
    }

    // Getter e Setter para _usuarioMiddleware
    get usuarioMiddleware() {
        return this._usuarioMiddleware;
    }

    set usuarioMiddleware(newUsuarioMiddleware) {
        this._usuarioMiddleware = newUsuarioMiddleware;
    }

    // Getter e Setter para _usuarioControl
    get usuarioControl() {
        return this._usuarioControl;
    }

    set usuarioControl(newUsuarioControl) {
        this._usuarioControl = newUsuarioControl;
    }

    // Getter e Setter para _JWTMiddleware
    get jwtMiddleware() {
        return this._jwtMiddleware;
    }

    set jwtMiddleware(newJWTMiddleware) {
        this._jwtMiddleware = newJWTMiddleware;
    }
}
