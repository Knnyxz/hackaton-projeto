// backend/router/SpaceDebrisRouter.js
const express = require('express');
const router = express.Router();
const SpaceDebris = require('../model/SpaceDebris'); // Changed from Banco to SpaceDebris

class SpaceDebrisRouter {
    createRoutes() {
        // Get space debris count
        router.get('/count', async (req, res) => {
            try {
                const count = await SpaceDebris.getSpaceDebrisCount(); // Changed from Banco
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
                
                const debris = await SpaceDebris.getSpaceDebrisFiltered(options); // Changed from Banco
                res.json(debris);
            } catch (error) {
                console.error('Error fetching filtered debris:', error);
                res.status(500).json({ error: 'Failed to fetch filtered debris' });
            }
        });

        // Get debris statistics
        router.get('/statistics', async (req, res) => {
            try {
                const db = await SpaceDebris.connectToDatabase();
                const collection = db.collection('space_debris');
                
                // Get total count
                const totalCount = await collection.countDocuments();
                
                // Count by type
                const byType = await collection.aggregate([
                    { 
                        $group: { 
                            _id: '$type', 
                            count: { $sum: 1 },
                            totalMass: { $sum: '$massKg' }
                        } 
                    },
                    {
                        $project: {
                            type: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ['$_id', 1] }, then: 'Satellite' },
                                        { case: { $eq: ['$_id', 2] }, then: 'Rocket Body' },
                                        { case: { $eq: ['$_id', 3] }, then: 'Debris' },
                                        { case: { $eq: ['$_id', 4] }, then: 'Other' }
                                    ],
                                    default: 'Unknown'
                                }
                            },
                            count: 1,
                            totalMass: 1,
                            avgMass: { $divide: ['$totalMass', '$count'] }
                        }
                    }
                ]).toArray();
                
                // Count by country (top 10)
                const byCountry = await collection.aggregate([
                    { $group: { _id: '$country', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray();
                
                // Count by company (top 10)
                const byCompany = await collection.aggregate([
                    { $group: { _id: '$company', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray();
                
                // Mass statistics
                const massStats = await collection.aggregate([
                    {
                        $match: {
                            massKg: { $exists: true, $ne: null }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalMass: { $sum: '$massKg' },
                            avgMass: { $avg: '$massKg' },
                            minMass: { $min: '$massKg' },
                            maxMass: { $max: '$massKg' },
                            countWithMass: { $sum: 1 }
                        }
                    }
                ]).toArray();
                
                // Launch year distribution (last 10 years)
                const currentYear = new Date().getFullYear();
                
                // First, get all launch dates to extract years
                const allDebris = await collection.find({ 
                    launchDate: { $exists: true, $ne: null } 
                }).project({ launchDate: 1 }).toArray();
                
                // Extract years from launch dates (handling various formats)
                const yearCounts = {};
                allDebris.forEach(debris => {
                    if (debris.launchDate) {
                        // Try to extract year from various date formats
                        let yearMatch = debris.launchDate.match(/(\d{4})/);
                        if (yearMatch) {
                            const year = parseInt(yearMatch[1]);
                            if (year >= currentYear - 10 && year <= currentYear) {
                                yearCounts[year] = (yearCounts[year] || 0) + 1;
                            }
                        }
                    }
                });
                
                // Convert to array format
                const launchYears = Object.keys(yearCounts).map(year => ({
                    _id: parseInt(year),
                    count: yearCounts[year]
                })).sort((a, b) => a._id - b._id);
                
                // Size distribution
                const sizeDistribution = await collection.aggregate([
                    {
                        $match: {
                            massKg: { $exists: true, $ne: null }
                        }
                    },
                    {
                        $bucket: {
                            groupBy: '$massKg',
                            boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
                            default: "Other",
                            output: {
                                count: { $sum: 1 },
                                avgMass: { $avg: '$massKg' }
                            }
                        }
                    }
                ]).toArray();
                
                // Status distribution
                const statusDistribution = await collection.aggregate([
                    { 
                        $match: {
                            status: { $exists: true, $ne: null }
                        }
                    },
                    { 
                        $group: { 
                            _id: '$status', 
                            count: { $sum: 1 } 
                        } 
                    },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ]).toArray();
                
                // Get debris by orbit type (simplified classification)
                // Since we don't have altitude data, we'll use a simplified approach
                // Most satellites are in LEO, some in GEO, few in MEO
                const totalSatellites = await collection.countDocuments({ type: 1 });
                const totalDebris = await collection.countDocuments({ type: 3 });
                const totalRocketBodies = await collection.countDocuments({ type: 2 });
                
                // Approximate distribution based on typical orbital patterns
                const orbitDistribution = [
                    {
                        _id: 0, // LEO
                        count: Math.round((totalSatellites + totalDebris + totalRocketBodies) * 0.75), // ~75% in LEO
                        orbitType: 'LEO'
                    },
                    {
                        _id: 2000, // MEO
                        count: Math.round((totalSatellites + totalDebris + totalRocketBodies) * 0.15), // ~15% in MEO
                        orbitType: 'MEO'
                    },
                    {
                        _id: 35786, // GEO
                        count: Math.round((totalSatellites + totalDebris + totalRocketBodies) * 0.10), // ~10% in GEO
                        orbitType: 'GEO'
                    }
                ];
                
                res.json({
                    totalCount,
                    byType,
                    byCountry,
                    byCompany,
                    massStats: massStats[0] || {},
                    launchYears,
                    sizeDistribution,
                    statusDistribution,
                    orbitDistribution,
                    lastUpdated: new Date()
                });
            } catch (error) {
                console.error('Error getting statistics:', error);
                res.status(500).json({ error: 'Failed to get statistics' });
            }
        });

        // Get unique countries
        router.get('/countries', async (req, res) => {
            try {
                const countries = await SpaceDebris.getUniqueCountries(); // Changed from Banco
                res.json(countries.filter(country => country && country !== 'null'));
            } catch (error) {
                console.error('Error getting countries:', error);
                res.status(500).json({ error: 'Failed to get countries' });
            }
        });

        // Get unique companies
        router.get('/companies', async (req, res) => {
            try {
                const companies = await SpaceDebris.getUniqueCompanies(); // Changed from Banco
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
                
                const debris = await SpaceDebris.getSpaceDebris(limit, offset); // Changed from Banco
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