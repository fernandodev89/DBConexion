import { pool } from "../models/db.js";

/**
 * Estado interno del servidor para controlar UNA transacción "viva" por instancia.
 * Para pruebas con 2 sesiones, levanta 2 puertos (2 instancias del servidor).
 */
let txConn = null;          // Conexión dedicada a la transacción en curso
let txActive = false;       // ¿Hay transacción activa en esta instancia?
let desiredIsolation = null; // Aislamiento elegido para la próxima transacción

// Utilidad: normalizar entrada de aislamiento
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

/**
 * POST /isolation
 * Define el aislamiento para la PRÓXIMA transacción que se inicie en ESTA instancia.
 * No cambia el aislamiento de una transacción ya iniciada.
 * body: { level: "READ COMMITTED" | "REPEATABLE READ" | ... }
 */
export const setIsolationLevel = async (req, res) => {
  try {
    const level = normalizeIsolation(req.body?.level);
    if (!level) {
      return res.status(400).json({ ok: false, message: "Nivel inválido" });
    }
    desiredIsolation = level;

    // Si ya tenemos conexión reservada PERO sin transacción activa, podemos setear a nivel sesión
    if (txConn && !txActive) {
      await txConn.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${desiredIsolation}`);
    }

    console.log(`[TX] Próximo aislamiento configurado a: ${desiredIsolation}`);
    return res.json({ ok: true, nextIsolation: desiredIsolation });
  } catch (err) {
    console.error("[TX] Error setIsolationLevel:", err);
    return res.status(500).json({ ok: false, message: "Error al configurar aislamiento" });
  }
};

/**
 * GET /isolation
 * Devuelve el aislamiento de la transacción ACTIVA (si existe) en esta instancia.
 * Si no hay transacción activa, indica que no hay transacción.
 */
export const getIsolationLevel = async (req, res) => {
  try {
    if (txConn) {
      const [rows] = await txConn.query(`SELECT @@session.transaction_isolation AS level`);
      const level = rows?.[0]?.level || null;
      return res.json({
        ok: true,
        transactionActive: !!txActive,
        level,
        note: txActive
          ? "Aislamiento de la transacción activa en esta instancia."
          : "No hay transacción activa; aislamiento de la sesión reservada.",
      });
    }
    return res.json({
      ok: true,
      transactionActive: false,
      level: null,
      note: "No hay conexión de transacción en esta instancia.",
    });
  } catch (err) {
    console.error("[TX] Error getIsolationLevel:", err);
    return res.status(500).json({ ok: false, message: "Error al consultar aislamiento" });
  }
};

/**
 * POST /start
 * Inicia una transacción en ESTA instancia (reserva conexión exclusiva).
 * Usa el aislamiento elegido previamente con /isolation.
 */
export const startDB = async (req, res) => {
  try {
    if (txActive) {
      return res.status(400).json({ ok: false, message: "Ya hay una transacción activa en esta instancia." });
    }
    // Si no había conexión reservada, la creamos
    if (!txConn) {
      txConn = await pool.getConnection();
      console.log("[TX] Conexión reservada para transacción.");
    }

    // Si hay aislamiento elegido, se aplica a la sesión ANTES de iniciar la transacción
    if (desiredIsolation) {
      await txConn.query(`SET SESSION TRANSACTION ISOLATION LEVEL ${desiredIsolation}`);
      console.log(`[TX] Sesión configurada con aislamiento: ${desiredIsolation}`);
    }

    await txConn.beginTransaction();
    txActive = true;

    // Confirmar aislamiento efectivo
    const [rows] = await txConn.query(`SELECT @@session.transaction_isolation AS level`);
    const level = rows?.[0]?.level || null;

    console.log(`[TX] START; aislamiento: ${level}`);
    return res.json({ ok: true, started: true, level });
  } catch (err) {
    console.error("[TX] Error startDB:", err);
    return res.status(500).json({ ok: false, message: "Error al iniciar transacción" });
  }
};

/**
 * POST /commit
 * Hace commit y libera la conexión.
 */
export const commitTransaction = async (req, res) => {
  try {
    if (!txConn || !txActive) {
      return res.status(400).json({ ok: false, message: "No hay transacción activa." });
    }
    await txConn.commit();
    console.log("[TX] COMMIT");
    txActive = false;

    // Liberamos completamente para que la siguiente demo pueda empezar desde cero
    txConn.release();
    txConn = null;
    return res.json({ ok: true, committed: true });
  } catch (err) {
    console.error("[TX] Error commitTransaction:", err);
    return res.status(500).json({ ok: false, message: "Error al hacer commit" });
  }
};

/**
 * POST /rollback
 * Hace rollback y libera la conexión.
 */
export const rollbackTransaction = async (req, res) => {
  try {
    if (!txConn || !txActive) {
      return res.status(400).json({ ok: false, message: "No hay transacción activa." });
    }
    await txConn.rollback();
    console.log("[TX] ROLLBACK");
    txActive = false;

    txConn.release();
    txConn = null;
    return res.json({ ok: true, rolledBack: true });
  } catch (err) {
    console.error("[TX] Error rollbackTransaction:", err);
    return res.status(500).json({ ok: false, message: "Error al hacer rollback" });
  }
};

/**
 * POST /validar
 * Inserta un registro en la tabla `datos`. Si hay transacción activa, lo hace dentro de la transacción.
 * body: { name: string }
 */
export const validarDate = async (req, res) => {
  try {
    const name = (req.body?.name || "").trim();
    if (!name) return res.status(400).json({ ok: false, message: "Nombre requerido" });

    const conn = txActive && txConn ? txConn : pool;
    await conn.query("INSERT INTO datos(name) VALUES (?)", [name]);

    console.log(`[DB] INSERT (${txActive ? "en TX" : "autocommit"}):`, { name });
    return res.json({ ok: true, inserted: true, inTransaction: !!txActive });
  } catch (err) {
    console.error("[DB] Error insertar:", err);
    return res.status(500).json({ ok: false, message: "Error al insertar datos" });
  }
};

/**
 * GET /getData
 * Lee los datos; si hay transacción activa, usa esa conexión para respetar su aislamiento.
 * Imprime en consola los registros leídos.
 */
export const getDatos = async (req, res) => {
  try {
    const conn = txActive && txConn ? txConn : pool;
    const [rows] = await conn.query("SELECT id, name FROM datos ORDER BY id");

    console.log(`[DB] SELECT (${txActive ? "en TX" : "autocommit"}):`, rows);
    return res.json({ ok: true, inTransaction: !!txActive, count: rows.length, rows });
  } catch (err) {
    console.error("[DB] Error select:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener datos" });
  }
};

/**
 * GET /addDates
 * Página simple de prueba (UI mínima).
 */
export const createDate = async (req, res) => {
  try {
    res.render("alert");
  } catch (err) {
    console.error("[VIEW] Error render:", err);
    res.status(500).send("Error al renderizar vista");
  }
};
