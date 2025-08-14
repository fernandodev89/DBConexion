import { pool } from "../models/db.js";

let txConn = null;          
let txActive = false;      
let desiredIsolation = null; 

function normalizeIsolation(level) {
  if (!level) return null;
  const s = String(level).trim().toUpperCase();
  const map = {
    "READ UNCOMMITTED": "READ UNCOMMITTED",
    "READ COMMITTED": "READ COMMITTED",
    "REPEATABLE READ": "REPEATABLE READ",
    "SERIALIZABLE": "SERIALIZABLE",
    "RU": "READ UNCOMMITTED",
    "RC": "READ COMMITTED",
    "RR": "REPEATABLE READ",
    "SZ": "SERIALIZABLE",
  };
  return map[s] || null;
}

export const setIsolationLevel = async (req, res) => {
  try {
    const level = normalizeIsolation(req.body?.level);
    if (!level) {
      return res.status(400).json({ Estado: false, mensaje: "Nivel inválido" });
    }
    desiredIsolation = level;

    if (txConn && !txActive) {
      await txConn.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${desiredIsolation}`);
    }

    console.log(`[TX] Próximo aislamiento configurado a: ${desiredIsolation}`);
    return res.json({ Estado: true, siguienteAislamiento: desiredIsolation });
  } catch (err) {
    console.error("[TX] Error setIsolationLevel:", err);
    return res.status(500).json({ Estado: false, mensaje: "Error al configurar aislamiento" });
  }
};

export const getIsolationLevel = async (req, res) => {
  try {
    if (txConn) {
      const [rows] = await txConn.query(`SELECT @@session.transaction_isolation AS level`);
      const level = rows?.[0]?.level || null;
      return res.json({
        Estado: true,
        transaccionActiva: !!txActive,
        level,
        nota: txActive
          ? "Aislamiento de la transacción activa en esta instancia."
          : "No hay transacción activa; aislamiento de la sesión reservada.",
      });
    }
    return res.json({
      Estado: true,
      transaccionActiva: false,
      level: null,
      nota: "No hay conexión de transacción en esta instancia.",
    });
  } catch (err) {
    console.error("[TX] Error getIsolationLevel:", err);
    return res.status(500).json({ Estado: false, mensaje: "Error al consultar aislamiento" });
  }
};


export const startDB = async (req, res) => {
  try {
    if (txActive) {
      return res.status(400).json({ Estado: false, mensaje: "Ya hay una transacción activa en esta instancia." });
    }
    if (!txConn) {
      txConn = await pool.getConnection();
      console.log("[TX] Conexión reservada para transacción.");
    }

    if (desiredIsolation) {
      await txConn.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${desiredIsolation}`);
      console.log(`[TX] Sesión configurada con aislamiento: ${desiredIsolation}`);
    }

    await txConn.beginTransaction();
    txActive = true;

    const [rows] = await txConn.query(`SELECT @@session.transaction_isolation AS level`);
    const level = rows?.[0]?.level || null;

    console.log(`[TX] START; aislamiento: ${level}`);
    return res.json({ Estado: true, Comenzado: true, level });
  } catch (err) {
    console.error("[TX] Error startDB:", err);
    return res.status(500).json({ Estado: false, mensaje: "Error al iniciar transacción" });
  }
};

export const commitTransaction = async (req, res) => {
  try {
    if (!txConn || !txActive) {
      return res.status(400).json({ Estado: false, mensaje: "No hay transacción activa." });
    }
    await txConn.commit();
    console.log("[TX] COMMIT");
    txActive = false;

    txConn.release();
    txConn = null;
    return res.json({ Estado: true, committed: true });
  } catch (err) {
    console.error("[TX] Error commitTransaction:", err);
    return res.status(500).json({ Estado: false, mensaje: "Error al hacer commit" });
  }
};


export const rollbackTransaction = async (req, res) => {
  try {
    if (!txConn || !txActive) {
      return res.status(400).json({ Estado: false, mensaje: "No hay transacción activa." });
    }
    await txConn.rollback();
    console.log("[TX] ROLLBACK");
    txActive = false;

    txConn.release();
    txConn = null;
    return res.json({ Estado: true, rolledBack: true });
  } catch (err) {
    console.error("[TX] Error rollbackTransaction:", err);
    return res.status(500).json({ Estado: false, mensaje: "Error al hacer rollback" });
  }
};


export const validarDate = async (req, res) => {
  try {
    const name = (req.body?.name || "").trim();
    if (!name) return res.status(400).json({ Estado: false, mensaje: "Nombre requerido" });

    const conn = txActive && txConn ? txConn : pool;
    await conn.query("INSERT INTO datos(name) VALUES (?)", [name]);

    console.log(`[DB] INSERT (${txActive ? "en TX" : "autocommit"}):`, { name });
    return res.json({ Estado: true, insertado: true, enTransaccion: !!txActive });
  } catch (err) {
    console.error("[DB] Error insertar:", err);
    return res.status(500).json({ Estado: false, mensaje: "Error al insertar datos" });
  }
};


export const getDatos = async (req, res) => {
  try {
    const conn = txActive && txConn ? txConn : pool;

    // Obtener nivel de aislamiento actual
    const [rowsLevel] = await conn.query(
      "SELECT @@session.transaction_isolation AS level"
    );
    const currentLevel = rowsLevel?.[0]?.level;

    // Ejecutar SELECT normalmente
    const [rows] = await conn.query(
      "SELECT id, name FROM datos ORDER BY id"
    );

    console.log(`[DB] SELECT (${txActive ? "en TX" : "autocommit"}; aislamiento=${currentLevel}):`, rows);
    return res.json({
      Estado: true,
      enTransaccion: !!txActive,
      isolation: currentLevel,
      count: rows.length,
      rows
    });
  } catch (err) {
    console.error("[DB] Error select:", err);
    return res.status(500).json({ Estado: false, mensaje: "Error al obtener datos" });
  }
};


export const createDate = async (req, res) => {
  try {
    res.render("alert");
  } catch (err) {
    console.error("[VIEW] Error render:", err);
    res.status(500).send("Error al renderizar vista");
  }
};
