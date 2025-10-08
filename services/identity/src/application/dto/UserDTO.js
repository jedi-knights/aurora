class UserDTO {
    constructor({ id, email, name, createdAt, updatedAt }) {
        this.id = id
        this.email = email
        this.name = name
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static fromEntity(user) {
        return new UserDTO({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        })
    }
}

module.exports = { UserDTO }

