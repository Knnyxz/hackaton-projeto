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

            // Filtro: excluir registros sem nome ou altitude
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
                            company: d.owner ?? 'Desconhecido',
                            shape: d.shape ?? null,
                            massKg: d.Mass ? parseFloat(d.Mass) : null,
                            launchDate: d.launchDate ?? null,
                            launchVehicle: d.launchVehicle ?? null,
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
                    { $set: { lastUpdated: new Date() } },
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

    static async getSpaceDebris() {
        const db = await Banco.connectToDatabase();
        const collection = db.collection('space_debris');
        
        if (await Banco.needsUpdate()) {
            console.log('Space debris data is outdated, updating...');
            Banco.updateSpaceDebris();
        }else{
            console.log('Space debris data is outdated, updating...');
            Banco.updateSpaceDebris();
        }
        
        return collection.find({}).toArray();
    }
}

module.exports = Banco;
