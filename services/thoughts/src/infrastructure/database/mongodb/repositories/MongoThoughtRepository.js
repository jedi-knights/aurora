const { IThoughtRepository } = require('../../../../domain/repositories/IThoughtRepository')
const { Thought } = require('../../../../domain/entities/Thought')
const { NotFoundError } = require('../../../../shared/errors/NotFoundError')

class MongoThoughtRepository extends IThoughtRepository {
    constructor(model) {
        super()
        this.model = model
    }

    async save(thought) {
        const doc = await this.model.create({
            _id: thought.id,
            userId: thought.userId,
            text: thought.text,
            timestamp: thought.timestamp,
            tags: thought.tags,
            createdAt: thought.createdAt,
            updatedAt: thought.updatedAt
        })

        return this.toDomain(doc)
    }

    async findById(id) {
        const doc = await this.model.findById(id).lean()

        if (!doc) {
            throw new NotFoundError('Thought', id)
        }

        return this.toDomain(doc)
    }

    async findByUserId(userId, options = {}) {
        const {
            limit = 50,
            offset = 0,
            sortBy = 'timestamp',
            order = 'desc'
        } = options

        const docs = await this.model
            .find({ userId })
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(limit)
            .skip(offset)
            .lean()

        return docs.map(doc => this.toDomain(doc))
    }

    async findByTag(userId, tag, options = {}) {
        const {
            limit = 50,
            offset = 0
        } = options

        const normalizedTag = tag.toLowerCase().trim()

        const docs = await this.model
            .find({ userId, tags: normalizedTag })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(offset)
            .lean()

        return docs.map(doc => this.toDomain(doc))
    }

    async search(userId, query) {
        const docs = await this.model
            .find({
                userId,
                $text: { $search: query }
            })
            .sort({ score: { $meta: 'textScore' } })
            .lean()

        return docs.map(doc => this.toDomain(doc))
    }

    async update(thought) {
        const doc = await this.model.findByIdAndUpdate(
            thought.id,
            {
                text: thought.text,
                tags: thought.tags,
                updatedAt: thought.updatedAt
            },
            { new: true }
        ).lean()

        if (!doc) {
            throw new NotFoundError('Thought', thought.id)
        }

        return this.toDomain(doc)
    }

    async delete(id) {
        const result = await this.model.findByIdAndDelete(id)

        if (!result) {
            throw new NotFoundError('Thought', id)
        }

        return true
    }

    async getUserTags(userId) {
        const result = await this.model.aggregate([
            { $match: { userId } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        return result.map(item => ({
            tag: item._id,
            count: item.count
        }))
    }

    toDomain(doc) {
        return new Thought({
            id: doc._id.toString(),
            userId: doc.userId,
            text: doc.text,
            timestamp: doc.timestamp,
            tags: doc.tags,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        })
    }
}

module.exports = { MongoThoughtRepository }

