/**
 * User Repository Interface (Port)
 * Defines the contract for user persistence
 */
class IUserRepository {
    async save(user) {
        throw new Error('save method must be implemented')
    }

    async findById(id) {
        throw new Error('findById method must be implemented')
    }

    async findByEmail(email) {
        throw new Error('findByEmail method must be implemented')
    }

    async update(user) {
        throw new Error('update method must be implemented')
    }

    async delete(id) {
        throw new Error('delete method must be implemented')
    }

    async existsByEmail(email) {
        throw new Error('existsByEmail method must be implemented')
    }
}

module.exports = { IUserRepository }

