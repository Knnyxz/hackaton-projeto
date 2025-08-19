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

    static async needsUpdate() {
        if (isUpdating) return false;
        
        const db = await Banco.connectToDatabase();
        const metadata = await db.collection('space_metadata').findOne({ type: 'debris' });
        
        if (!metadata) {
            await db.collection('space_metadata').insertOne({
                type: 'debris',
                lastUpdated: new Date(0)
            });
            return true;
        }
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return metadata.lastUpdated < oneWeekAgo;
    }

    static async updateSpaceDebris() {
        if (isUpdating) return;
        isUpdating = true;
        
        try {
            const db = await Banco.connectToDatabase();
            const collection = db.collection('space_debris');
            const metadataCollection = db.collection('space_metadata');

            const response = await axios.get('https://api.keeptrack.space/v2/sats');
            const debrisList = response.data;

            // Filtro: excluir registros sem nome ou TLE data
            const filtered = debrisList.filter(d => d.name && d.tle1 && d.tle2);

            const operations = filtered.map(d => ({
                updateOne: {
                    filter: { objectName: d.name },
                    update: {
                        $set: {
                            objectName: d.name,
                            type: d.type ?? null,
                            altName: d.altName ?? null,
                            country: d.country ?? 'Desconhecido',
                            countryCode: d.countryCode ?? null,
                            company: d.owner ?? 'Desconhecido',
                            manufacturer: d.manufacturer ?? null,
                            shape: d.shape ?? null,
                            massKg: d.Mass ? parseFloat(d.Mass) : null,
                            launchMass: d.launchMass ? parseFloat(d.launchMass) : null,
                            dryMass: d.dryMass ? parseFloat(d.dryMass) : null,
                            length: d.length ? parseFloat(d.length) : null,
                            diameter: d.diameter ? parseFloat(d.diameter) : null,
                            span: d.span ? parseFloat(d.span) : null,
                            launchDate: d.launchDate ?? null,
                            launchVehicle: d.launchVehicle ?? null,
                            launchSite: d.launchSite ?? null,
                            launchPad: d.launchPad ?? null,
                            payload: d.payload ?? null,
                            bus: d.bus ?? null,
                            rcs: d.rcs ? parseFloat(d.rcs) : null,
                            vmag: d.vmag ? parseFloat(d.vmag) : null,
                            status: d.status ?? null,
                            stableDate: d.stableDate ?? null,
                            tle1: d.tle1,
                            tle2: d.tle2,
                            lastUpdated: new Date()
                        }
                    },
                    upsert: true
                }
            }));

            if (operations.length > 0) {
                await collection.bulkWrite(operations);
                await metadataCollection.updateOne(
                    { type: 'debris' },
                    { $set: { lastUpdated: new Date(), totalCount: operations.length } },
                    { upsert: true }
                );
                console.log(`Updated ${operations.length} space debris records`);
            }
            
            return true;
        } catch (error) {
            console.error('Space debris update failed:', error);
            return false;
        } finally {
            isUpdating = false;
        }
    }

    static async getSpaceDebrisCount() {
        const db = await Banco.connectToDatabase();
        const collection = db.collection('space_debris');
        
        if (await Banco.needsUpdate()) {
            console.log('Space debris data is outdated, updating...');
            await Banco.updateSpaceDebris();
        }
        
        return collection.countDocuments({});
    }

    static async getSpaceDebris(limit = null, offset = 0) {
        const db = await Banco.connectToDatabase();
        const collection = db.collection('space_debris');
        
        if (await Banco.needsUpdate()) {
            console.log('Space debris data is outdated, updating...');
            await Banco.updateSpaceDebris();
        }
        
        let query = collection.find({});
        
        if (offset > 0) {
            query = query.skip(offset);
        }
        
        if (limit) {
            query = query.limit(limit);
        }
        
        return query.toArray();
    }

    // New method for getting debris with filtering capabilities
    static async getSpaceDebrisFiltered(options = {}) {
        const db = await Banco.connectToDatabase();
        const collection = db.collection('space_debris');
        
        if (await Banco.needsUpdate()) {
            console.log('Space debris data is outdated, updating...');
            await Banco.updateSpaceDebris();
        }

        const {
            limit = null,
            offset = 0,
            country = null,
            company = null,
            type = null,
            minMass = null,
            maxMass = null,
            search = null
        } = options;

        // Build filter query
        const filter = {};
        
        if (country) {
            filter.country = country;
        }
        
        if (company) {
            filter.company = company;
        }
        
        if (type !== null) {
            filter.type = type;
        }
        
        if (minMass !== null || maxMass !== null) {
            filter.massKg = {};
            if (minMass !== null) filter.massKg.$gte = minMass;
            if (maxMass !== null) filter.massKg.$lte = maxMass;
        }
        
        if (search) {
            filter.$or = [
                { objectName: { $regex: search, $options: 'i' } },
                { altName: { $regex: search, $options: 'i' } }
            ];
        }

        let query = collection.find(filter);
        
        if (offset > 0) {
            query = query.skip(offset);
        }
        
        if (limit) {
            query = query.limit(limit);
        }
        
        return query.toArray();
    }

    // Get unique countries for filtering UI
    static async getUniqueCountries() {
        const db = await Banco.connectToDatabase();
        const collection = db.collection('space_debris');
        
        return collection.distinct('country', {});
    }

    // Get unique companies for filtering UI
    static async getUniqueCompanies() {
        const db = await Banco.connectToDatabase();
        const collection = db.collection('space_debris');
        
        return collection.distinct('company', {});
    }

    // Get statistics for dashboard
    static async getDebrisStatistics() {
        const db = await Banco.connectToDatabase();
        const collection = db.collection('space_debris');
        
        const stats = await collection.aggregate([
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                    avgMass: { $avg: '$massKg' },
                    totalMass: { $sum: '$massKg' },
                    countByType: {
                        $push: {
                            type: '$type',
                            country: '$country',
                            company: '$company'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalCount: 1,
                    avgMass: { $round: ['$avgMass', 2] },
                    totalMass: { $round: ['$totalMass', 2] },
                    countByType: 1
                }
            }
        ]).toArray();

        // Get type distribution
        const typeStats = await collection.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        // Get country distribution
        const countryStats = await collection.aggregate([
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Get company distribution
        const companyStats = await collection.aggregate([
            { $group: { _id: '$company', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        return {
            ...stats[0],
            typeDistribution: typeStats,
            countryDistribution: countryStats,
            companyDistribution: companyStats
        };
    }
}

module.exports = Banco;