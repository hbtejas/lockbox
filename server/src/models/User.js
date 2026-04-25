const { v4: uuidv4 } = require('uuid')
const { isDatabaseEnabled, query } = require('../config/db')
const { inMemoryStore } = require('../data/inMemoryStore')

async function findByEmail(email) {
  if (isDatabaseEnabled()) {
    const result = await query('SELECT id, name, email, password_hash, plan, created_at FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return null
    }
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      plan: row.plan,
      createdAt: row.created_at,
    }
  }

  return inMemoryStore.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
}

async function findById(id) {
  if (isDatabaseEnabled()) {
    const result = await query('SELECT id, name, email, plan, created_at FROM users WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return null
    }
    return result.rows[0]
  }

  const user = inMemoryStore.users.find((entry) => entry.id === id)
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    created_at: user.createdAt,
  }
}

async function createUser({ name, email, passwordHash }) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'INSERT INTO users (name, email, password_hash, plan) VALUES ($1, $2, $3, $4) RETURNING id, name, email, plan, created_at',
      [name, email, passwordHash, 'free'],
    )
    return result.rows[0]
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    passwordHash,
    plan: 'free',
    createdAt: new Date().toISOString(),
  }
  inMemoryStore.users.push(newUser)

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    plan: newUser.plan,
    created_at: newUser.createdAt,
  }
}

async function updatePlan(userId, plan) {
  if (isDatabaseEnabled()) {
    const result = await query('UPDATE users SET plan = $1 WHERE id = $2 RETURNING id, name, email, plan, created_at', [
      plan,
      userId,
    ])
    return result.rows[0] ?? null
  }

  const user = inMemoryStore.users.find((entry) => entry.id === userId)
  if (!user) {
    return null
  }
  user.plan = plan
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    created_at: user.createdAt,
  }
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updatePlan,
}
