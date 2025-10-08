const { IJournalRepository } = require('../../../../domain/repositories/IJournalRepository')
const { Journal } = require('../../../../domain/entities/Journal')
const { NotFoundError } = require('../../../../shared/errors/NotFoundError')

class MongoJournalRepository extends IJournalRepository {
    constructor(journalModel, entryModel) {
        super()
        this.journalModel = journalModel
        this.entryModel = entryModel
    }

    async save(journal) {
        const doc = await this.journalModel.create({
            _id: journal.id,
            userId: journal.userId,
            name: journal.name,
            description: journal.description,
            color: journal.color,
            icon: journal.icon,
            settings: journal.settings,
            createdAt: journal.createdAt,
            updatedAt: journal.updatedAt
        })

        return this.toDomain(doc)
    }

    async findById(id) {
        const doc = await this.journalModel.findById(id).lean()

        if (!doc) {
            throw new NotFoundError('Journal', id)
        }

        return this.toDomain(doc)
    }

    async findByUserId(userId, options = {}) {
        const {
            includeArchived = false,
            limit = 50,
            offset = 0
        } = options

        const query = { userId }

        if (!includeArchived) {
            query['settings.isArchived'] = false
        }

        const docs = await this.journalModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset)
            .lean()

        return docs.map(doc => this.toDomain(doc))
    }

    async update(journal) {
        const doc = await this.journalModel.findByIdAndUpdate(
            journal.id,
            {
                name: journal.name,
                description: journal.description,
                color: journal.color,
                icon: journal.icon,
                settings: journal.settings,
                updatedAt: journal.updatedAt
            },
            { new: true }
        ).lean()

        if (!doc) {
            throw new NotFoundError('Journal', journal.id)
        }

        return this.toDomain(doc)
    }

    async delete(id) {
        const result = await this.journalModel.findByIdAndDelete(id)

        if (!result) {
            throw new NotFoundError('Journal', id)
        }

        // Also delete all entries for this journal
        await this.entryModel.deleteMany({ journalId: id })

        return true
    }

    async getEntryCount(journalId) {
        return await this.entryModel.countDocuments({ journalId })
    }

    toDomain(doc) {
        return new Journal({
            id: doc._id.toString(),
            userId: doc.userId,
            name: doc.name,
            description: doc.description,
            color: doc.color,
            icon: doc.icon,
            settings: doc.settings,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        })
    }
}

module.exports = { MongoJournalRepository }

