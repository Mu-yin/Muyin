import initSqlJs from 'sql.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'blog.db')

let _db = null
let SQL = null

// Wrapper class that mimics better-sqlite3 API using sql.js
class Database {
  constructor(sqlDb) {
    this._db = sqlDb
  }

  save() {
    const data = this._db.export()
    fs.writeFileSync(DB_PATH, Buffer.from(data))
  }

  exec(sql, params = []) {
    this._db.run(sql, params)
    if (/^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(sql)) {
      this.save()
    }
  }

  prepare(sql) {
    return new Statement(this, sql)
  }
}

class Statement {
  constructor(database, sql) {
    this._database = database
    this._sql = sql
  }

  all(...params) {
    const sql = this._bindParams(this._sql, params)
    const results = this._database._db.exec(sql)
    if (!results.length) return []
    const { columns, values } = results[0]
    return values.map(row => {
      const obj = {}
      columns.forEach((col, i) => { obj[col] = row[i] })
      return obj
    })
  }

  get(...params) {
    const rows = this.all(...params)
    return rows.length > 0 ? rows[0] : undefined
  }

  run(...params) {
    const sql = this._bindParams(this._sql, params)
    this._database._db.run(sql)
    const idResult = this._database._db.exec('SELECT last_insert_rowid() as id')
    const lastInsertRowid = idResult[0]?.values[0]?.[0] ?? 0
    const changesResult = this._database._db.exec('SELECT changes() as changes')
    const changes = changesResult[0]?.values[0]?.[0] ?? 0
    this._database.save()
    return { lastInsertRowid, changes }
  }

  _bindParams(sql, paramsArray) {
    if (!paramsArray.length) return sql
    const flatParams = Array.isArray(paramsArray[0]) ? paramsArray[0] : paramsArray
    let paramIndex = 0
    return sql.replace(/\?/g, () => {
      const val = flatParams[paramIndex++]
      if (val === undefined || val === null) return 'NULL'
      if (typeof val === 'number') return String(val)
      return `'${String(val).replace(/'/g, "''")}'`
    })
  }
}

// Proxy that delegates to the real db instance
// Routes import `db` at module load time, but _db is set after initDB() completes.
// The Proxy ensures calls always go through to the current _db instance.
const db = new Proxy({}, {
  get(_, prop) {
    if (!_db) throw new Error('数据库尚未初始化，请等待服务器启动完成')
    const val = _db[prop]
    return typeof val === 'function' ? val.bind(_db) : val
  }
})

async function initDB() {
  SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    _db = new Database(new SQL.Database(fileBuffer))
  } else {
    _db = new Database(new SQL.Database())
  }

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  _db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author TEXT NOT NULL DEFAULT '匿名',
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `)

  _db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      ip_address TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, ip_address),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `)

  _db.exec('PRAGMA foreign_keys = ON')

  console.log('📦 SQLite 数据库已初始化')
  return _db
}

export { initDB, db as default }
