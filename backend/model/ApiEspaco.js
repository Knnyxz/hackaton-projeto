const Banco = require('./Banco');

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

module.exports = SpaceDebris;
