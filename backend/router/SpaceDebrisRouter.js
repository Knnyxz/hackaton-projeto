// backend/router/SpaceDebrisRouter.js
const express = require('express');
const router = express.Router();
const Banco = require('../model/Banco');

class SpaceDebrisRouter {
    createRoutes() {
        // Get space debris count
        router.get('/count', async (req, res) => {
            try {
                const count = await Banco.getSpaceDebrisCount();
                res.json({ count });
            } catch (error) {
                console.error('Error getting debris count:', error);
                res.status(500).json({ error: 'Failed to get debris count' });
            }
        });

        // Get filtered space debris
        router.get('/filtered', async (req, res) => {
            try {
                const options = {};
                
                if (req.query.limit) options.limit = parseInt(req.query.limit);
                if (req.query.offset) options.offset = parseInt(req.query.offset);
                if (req.query.country) options.country = req.query.country;
                if (req.query.company) options.company = req.query.company;
                if (req.query.type !== undefined) options.type = parseInt(req.query.type);
                if (req.query.minMass) options.minMass = parseFloat(req.query.minMass);
                if (req.query.maxMass) options.maxMass = parseFloat(req.query.maxMass);
                if (req.query.search) options.search = req.query.search;
                
                const debris = await Banco.getSpaceDebrisFiltered(options);
                res.json(debris);
            } catch (error) {
                console.error('Error fetching filtered debris:', error);
                res.status(500).json({ error: 'Failed to fetch filtered debris' });
            }
        });

        // Get debris statistics
        router.get('/statistics', async (req, res) => {
            try {
                const stats = await Banco.getDebrisStatistics();
                res.json(stats);
            } catch (error) {
                console.error('Error getting debris statistics:', error);
                res.status(500).json({ error: 'Failed to get debris statistics' });
            }
        });

        // Get unique countries
        router.get('/countries', async (req, res) => {
            try {
                const countries = await Banco.getUniqueCountries();
                res.json(countries.filter(country => country && country !== 'null'));
            } catch (error) {
                console.error('Error getting countries:', error);
                res.status(500).json({ error: 'Failed to get countries' });
            }
        });

        // Get unique companies
        router.get('/companies', async (req, res) => {
            try {
                const companies = await Banco.getUniqueCompanies();
                res.json(companies.filter(company => company && company !== 'null'));
            } catch (error) {
                console.error('Error getting companies:', error);
                res.status(500).json({ error: 'Failed to get companies' });
            }
        });

        // Get space debris with pagination (main route)
        router.get('/', async (req, res) => {
            try {
                const limit = req.query.limit ? parseInt(req.query.limit) : null;
                const offset = req.query.offset ? parseInt(req.query.offset) : 0;
                
                const debris = await Banco.getSpaceDebris(limit, offset);
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