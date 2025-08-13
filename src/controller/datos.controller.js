import { pool } from "../models/db.js";

export const validarDate = async (req, res) => {
  try {
    const datos = req.body;
    const name = datos.name;

    if (!pool) {
      return res.status(400).json({ message: 'Transacción no iniciada' });
    }

    await pool.query('INSERT INTO datos(name) VALUES (?)', [name]);
		res.redirect('/addDates');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al insertar datos' });
  }
};

// Cambiar el nivel de aislamiento
export async function setIsolationLevel(req, res) {
    const { level } = req.body;
    try {
        await req.connection.query(`SET TRANSACTION ISOLATION LEVEL ${level}`);
        res.json({ message: `Nivel de aislamiento cambiado a ${level}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Consultar el nivel de aislamiento actual
export async function getIsolationLevel(req, res) {
    try {
        const [rows] = await req.connection.query("SELECT @@transaction_isolation AS isolation_level");
        res.json({ isolation_level: rows[0].isolation_level });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const startDB = async (req, res) => {
  try {
    await pool.query('START TRANSACTION');
    console.log('START TRANSACTION');
		res.redirect('/addDates');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al iniciar la transacción' });
  }
};

export const createDate = async (req, res) => {
  try{
		res.render('registro');

  }catch(err){
    return res.status(500).json({
      message: 'Something went wrong'
    })
  }
}

export const commitTransaction = async (req, res) => {
  try {
    if (!pool) {
      return res.status(400).json({ message: 'Transacción no iniciada' });
    }

    await pool.query('COMMIT');
    console.log('COMMIT');
    res.render('alert');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al hacer commit' });
  }
}

export const rollbackTransaction = async (req, res) => {
  try {
    if (!pool) {
      return res.status(400).json({ message: 'Transacción no iniciada' });
    }
    await pool.query('ROLLBACK');
    console.log('ROLLBACK');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al hacer rollback' });
  }
};