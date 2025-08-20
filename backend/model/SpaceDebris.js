const { MongoClient } = require('mongodb');
const axios = require('axios');
const Banco = require('./Banco');
require('dotenv').config();

let isUpdating = false;

class SpaceDebris {
    constructor() {
        this._id = null;
        this._noradCatId = null;
        this._objectName = null;
        this._lat = null;
        this._lon = null;
        this._altKm = null;
        this._speedKms = null;
        this._directionDeg = null;
        this._sizeCategory = null;
        this._lastUpdated = null;
    }

    async createOrUpdate() {
        const conexao = Banco.getConexao();
        const SQL = `
            INSERT INTO space_debris (
                norad_cat_id, object_name, lat, lon, alt_km, speed_kms,
                direction_deg, size_category, last_updated
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                object_name = VALUES(object_name),
                lat = VALUES(lat),
                lon = VALUES(lon),
                alt_km = VALUES(alt_km),
                speed_kms = VALUES(speed_kms),
                direction_deg = VALUES(direction_deg),
                size_category = VALUES(size_category),
                last_updated = VALUES(last_updated)
        `;
        try {
            const [result] = await conexao.promise().execute(SQL, [
                this._noradCatId,
                this._objectName,
                this._lat,
                this._lon,
                this._altKm,
                this._speedKms,
                this._directionDeg,
                this._sizeCategory,
                this._lastUpdated
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao salvar debris:', error);
            return false;
        }
    }

    // MongoDB static methods
    static async connectToDatabase() {
        if (SpaceDebris.db) return SpaceDebris.db;
        
        try {
            const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
            SpaceDebris.client = new MongoClient(url);
            await SpaceDebris.client.connect();
            SpaceDebris.db = SpaceDebris.client.db(process.env.DB_NAME || 'loja');
            console.log('Conectado ao MongoDB');
            return SpaceDebris.db;
        } catch (err) {
            console.error('Erro ao conectar ao MongoDB:', err);
            throw err;
        }
    }

    static async needsUpdate() {
        if (isUpdating) return false;
        
        const db = await SpaceDebris.connectToDatabase();
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
            const db = await SpaceDebris.connectToDatabase();
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
        const db = await SpaceDebris.connectToDatabase();
        const collection = db.collection('space_debris');
        
        if (await SpaceDebris.needsUpdate()) {
            console.log('Space debris data is outdated, updating...');
            await SpaceDebris.updateSpaceDebris();
        }
        
        return collection.countDocuments({});
    }

    static async getSpaceDebris(limit = null, offset = 0) {
        const db = await SpaceDebris.connectToDatabase();
        const collection = db.collection('space_debris');
        
        if (await SpaceDebris.needsUpdate()) {
            console.log('Space debris data is outdated, updating...');
            await SpaceDebris.updateSpaceDebris();
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

    static async getSpaceDebrisFiltered(options = {}) {
        const db = await SpaceDebris.connectToDatabase();
        const collection = db.collection('space_debris');
        
        if (await SpaceDebris.needsUpdate()) {
            console.log('Space debris data is outdated, updating...');
            await SpaceDebris.updateSpaceDebris();
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

    static async getUniqueCountries() {
        const db = await SpaceDebris.connectToDatabase();
        const collection = db.collection('space_debris');
        
        return collection.distinct('country', {});
    }

    static async getUniqueCompanies() {
        const db = await SpaceDebris.connectToDatabase();
        const collection = db.collection('space_debris');
        
        return collection.distinct('company', {});
    }

    static async getDebrisStatistics() {
        const db = await SpaceDebris.connectToDatabase();
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

    // Getters & Setters
    set noradCatId(v) { this._noradCatId = v; return this; }
    set objectName(v) { this._objectName = v; return this; }
    set lat(v) { this._lat = v; return this; }
    set lon(v) { this._lon = v; return this; }
    set altKm(v) { this._altKm = v; return this; }
    set speedKms(v) { this._speedKms = v; return this; }
    set directionDeg(v) { this._directionDeg = v; return this; }
    set sizeCategory(v) { this._sizeCategory = v; return this; }
    set lastUpdated(v) { this._lastUpdated = v; return this; }
}

// Static properties for MongoDB connection
SpaceDebris.db = null;
SpaceDebris.client = null;

module.exports = SpaceDebris;