const { pool } = require('../db/connection')

class MateriaService {
    async get() {
        const sql =
            `SELECT mat_id id, 
                    mat_nombre nombre, 
                    car_nombre carrera 
            FROM materia 
                INNER JOIN carrera ON car_id = mat_id_carrera`
        const [rows] = await pool.query(sql)
        return rows
    }

    async getMateriaPorCarrera(carrera) {
        const sql =
            `SELECT mat_id id, 
                    mat_nombre nombre, 
                    car_nombre carrera 
            FROM materia 
                INNER JOIN carrera ON car_id = mat_id_carrera
            WHERE car_id = ?`
        const [rows] = await pool.query(sql, [carrera])

        if (rows.length === 0){
            const error = new Error(`La carrera ${carrera} no existe`)
            error.status = 404
            throw error
        }
        return rows        
    }

    async post(materia) {
        const sql =
            `INSERT INTO materia(mat_nombre, mat_id_carrera, mat_usualta, mat_fechaalta)
            VALUES(?, ?, 1, CURRENT_TIMESTAMP())`
        
        const [result] = await pool.query(sql, [
            materia.nombre,
            materia.carrera
        ])

        return {
            id: result.insertId,
            nombre: materia.nombre,
            carrera: materia.carrera
        }
    }
}

module.exports = MateriaService
