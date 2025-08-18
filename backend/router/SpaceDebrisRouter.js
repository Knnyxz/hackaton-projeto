// backend/router/SpaceDebrisRouter.js
const express = require('express');
const router = express.Router();
const Banco = require('../model/Banco');

class SpaceDebrisRouter {
    createRoutes() {
        router.get('/', async (req, res) => {
            try {
                const debris = await Banco.getSpaceDebris();
                res.json(debris);
            } catch (error) {
                console.error('Error fetching space debris:', error);
                res.status(500).json({ error: 'Failed to get space debris data' });
            }
        });
        
        return router;
    }
}

module.exports = SpaceDebrisRouter;