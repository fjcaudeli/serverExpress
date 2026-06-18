const { pool } = require('../db/connection')

class CarreraService {
    async get() {
        const sql =
            `SELECT car_id id, car_nombre nombre
               FROM carrera 
             WHERE car_fechabaja IS NULL`
        const [rows] = await pool.query(sql)
        return rows
    }

    async post(carrera) {
        const sql =
            `INSERT INTO carrera(car_nombre, car_usualta, car_fechaalta) 
             VALUES(?, ?, CURRENT_TIMESTAMP())`
        
        const [result] = await pool.query(sql, [
            carrera.nombre,
            carrera.idUsuario,
        ])

        return {
            id: result.insertId,
            nombre: carrera.nombre
        }
    }

    async update(carrera){
        const sql = `UPDATE carrera 
                        SET car_usumodif = ?,
                            car_fechamodif = CURRENT_TIMESTAMP(),
                            car_nombre = ?
                      WHERE car_id = ?`
        await pool.query(sql, [carrera.idUsuario, carrera.nombre, carrera.id])
        return carrera
    }

    async delete(id, idUsuario) {
        const sql = `UPDATE carrera 
                        SET car_usubaja = ?,
                            car_fechabaja = CURRENT_TIMESTAMP()
                      WHERE car_id = ?`

        await pool.query(sql, [idUsuario, id])

        return {
            id: id,
        }                      
    }
}

module.exports = CarreraService
