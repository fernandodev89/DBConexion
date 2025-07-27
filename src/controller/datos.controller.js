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