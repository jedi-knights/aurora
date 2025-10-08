const { IEntryRepository } = require('../../../../domain/repositories/IEntryRepository')
const { Entry } = require('../../../../domain/entities/Entry')
const { NotFoundError } = require('../../../../shared/errors/NotFoundError')

class MongoEntryRepository extends IEntryRepository {
    constructor(model) {
        super()
        this.model = model
    }

    async save(entry) {
        const doc = await this.model.create({
            _id: entry.id,
            journalId: entry.journalId,
            content: entry.content,
            timestamp: entry.timestamp,
            metadata: entry.metadata,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
        })

        return this.toDomain(doc)
    }

    async findById(id) {
        const doc = await this.model.findById(id).lean()

        if (!doc) {
            throw new NotFoundError('Entry', id)
        }

        return this.toDomain(doc)
    }

    async findByJournalId(journalId, options = {}) {
        const {
            limit = 50,
            offset = 0,
            sortBy = 'timestamp',
            order = 'desc'
        } = options

        const docs = await this.model
            .find({ journalId })
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(limit)
            .skip(offset)
            .lean()

        return docs.map(doc => this.toDomain(doc))
    }

    async update(entry) {
        const doc = await this.model.findByIdAndUpdate(
            entry.id,
            {
                content: entry.content,
                metadata: entry.metadata,
                updatedAt: entry.updatedAt
            },
            { new: true }
        ).lean()

        if (!doc) {
            throw new NotFoundError('Entry', entry.id)
        }

        return this.toDomain(doc)
    }

    async delete(id) {
        const result = await this.model.findByIdAndDelete(id)

        if (!result) {
            throw new NotFoundError('Entry', id)
        }

        return true
    }

    async deleteByJournalId(journalId) {
        await this.model.deleteMany({ journalId })
        return true
    }

    async countByJournalId(journalId) {
        return await this.model.countDocuments({ journalId })
    }

    toDomain(doc) {
        return new Entry({
            id: doc._id.toString(),
            journalId: doc.journalId,
            content: doc.content,
            timestamp: doc.timestamp,
            metadata: doc.metadata,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        })
    }
}

module.exports = { MongoEntryRepository }

