const { IUserRepository } = require('../../../../domain/repositories/IUserRepository')
const { User } = require('../../../../domain/entities/User')
const { NotFoundError } = require('../../../../shared/errors/NotFoundError')

class PostgresUserRepository extends IUserRepository {
    constructor(pool) {
        super()
        this.pool = pool
    }

    async save(user) {
        const query = `
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
        const values = [
            user.id,
            user.email,
            user.passwordHash,
            user.name,
            user.createdAt,
            user.updatedAt
        ]

        const result = await this.pool.query(query, values)
        return this.toDomain(result.rows[0])
    }

    async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1'
        const result = await this.pool.query(query, [id])

        if (result.rows.length === 0) {
            throw new NotFoundError('User', id)
        }

        return this.toDomain(result.rows[0])
    }

    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1'
        const result = await this.pool.query(query, [email.toLowerCase()])

        if (result.rows.length === 0) {
            return null
        }

        return this.toDomain(result.rows[0])
    }

    async update(user) {
        const query = `
      UPDATE users 
      SET email = $1, password_hash = $2, name = $3, updated_at = $4
      WHERE id = $5
      RETURNING *
    `
        const values = [
            user.email,
            user.passwordHash,
            user.name,
            user.updatedAt,
            user.id
        ]

        const result = await this.pool.query(query, values)

        if (result.rows.length === 0) {
            throw new NotFoundError('User', user.id)
        }

        return this.toDomain(result.rows[0])
    }

    async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1'
        const result = await this.pool.query(query, [id])

        if (result.rowCount === 0) {
            throw new NotFoundError('User', id)
        }

        return true
    }

    async existsByEmail(email) {
        const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)'
        const result = await this.pool.query(query, [email.toLowerCase()])
        return result.rows[0].exists
    }

    toDomain(row) {
        return new User({
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })
    }
}

module.exports = { PostgresUserRepository }

