import { pool } from "../models/db.js";

export const validarDate = async (req, res) => {
	try{
		const datos = req.body;
		let name = datos.name;
		let salary = datos.salary;
		const{rows} = await pool.query('INSERT INTO datos(name,salary) VALUES (?, ?)',[name,salary])
		res.render('alert');
	}catch(err){
		return res.status(500).json({
      message: 'Something went wrong'
    })
	}
}

export const createDate = async (req, res) => {
  try{
		res.render('registro');

  }catch(err){
    return res.status(500).json({
      message: 'Something went wrong'
    })
  }
}

/*
export const getDatos = async(req,res) =>{
	try{
		const [rows] = await pool.query('SELECT * FROM datos')
		res.json(rows)
	}catch(err){
		return res.status(500).json({
			message: 'Something went wrong'
		})
	}
}

export const getDato = async(req,res) =>{
	const {id} = req.params;
	try{
		const [rows] = await pool.query('SELECT * FROM datos WHERE id = ?',[id]);
		if (rows.length === 0)
			return res.status(404).json({
				message: 'Datos not found'
			})
		res.json(rows[0]);
	}catch(err){
		return res.status(500).json({
			message: 'Something went wrong'
		})
	}
}

export const postDato = async(req,res) =>{
	const {name,salary} = req.body
	try{
		const{rows} = await pool.query('INSERT INTO datos(name,salary) VALUES (?, ?)',[name,salary])
		res.send({
			name,
			salary
		})

	}catch(err){
		return res.status(500).json({
			message: 'Something went wrong'
		})
	}
}

export const patchDato = async(req,res) => {
	const {id} = req.params;
	const {name,salary} = req.body
	try{
		const [result] = await pool.query('UPDATE datos SET name = IFNULL(?,name), salary = IFNULL(?,salary) WHERE id = ?',[name,salary,id])

		if (result.affectedRows === 0){
			return res.status(404).json({
				message: 'Dato not found'
			})
		}

		const [rows] = await pool.query('SELECT * FROM datos WHERE id = ?',[id])
		res.json(rows)
	}catch(err){

		return res.status(500).json({
			message: 'Something went wrong'
		})
	}
}

export const deleteDato = async(req,res) => {
	const {id} = req.params;
	try{
		const [result] = await pool.query('DELETE FROM datos WHERE id =?',[id])

		if (result.affectedRows === 0){
			return res.status(404).json({
				message: 'Dato not found'
			})
		}
		res.status(204).send()
	}catch(err){

		return res.status(500).json({
			message: 'Something went wrong'
		})
	}
}

*/