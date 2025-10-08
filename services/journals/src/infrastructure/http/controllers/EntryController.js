const { BaseController } = require('./BaseController')

class EntryController extends BaseController {
    constructor({
        createEntryUseCase,
        getEntriesUseCase,
        getEntryUseCase,
        updateEntryUseCase,
        deleteEntryUseCase
    }) {
        super()
        this.createEntryUseCase = createEntryUseCase
        this.getEntriesUseCase = getEntriesUseCase
        this.getEntryUseCase = getEntryUseCase
        this.updateEntryUseCase = updateEntryUseCase
        this.deleteEntryUseCase = deleteEntryUseCase
    }

    create = this.asyncHandler(async (req, res) => {
        const entry = await this.createEntryUseCase.execute({
            userId: req.user.id,
            journalId: req.params.journalId,
            content: req.body.content,
            metadata: req.body.metadata
        })

        return this.handleSuccess(res, entry, 201)
    })

    getAll = this.asyncHandler(async (req, res) => {
        const options = {
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0,
            sortBy: req.query.sortBy || 'timestamp',
            order: req.query.order || 'desc'
        }

        const entries = await this.getEntriesUseCase.execute(
            req.user.id,
            req.params.journalId,
            options
        )

        return this.handleSuccess(res, entries)
    })

    getOne = this.asyncHandler(async (req, res) => {
        const entry = await this.getEntryUseCase.execute(
            req.params.entryId,
            req.params.journalId,
            req.user.id
        )

        return this.handleSuccess(res, entry)
    })

    update = this.asyncHandler(async (req, res) => {
        const entry = await this.updateEntryUseCase.execute({
            id: req.params.entryId,
            journalId: req.params.journalId,
            userId: req.user.id,
            content: req.body.content,
            metadata: req.body.metadata
        })

        return this.handleSuccess(res, entry)
    })

    delete = this.asyncHandler(async (req, res) => {
        await this.deleteEntryUseCase.execute(
            req.params.entryId,
            req.params.journalId,
            req.user.id
        )

        return this.handleSuccess(res, { message: 'Entry deleted successfully' })
    })
}

module.exports = { EntryController }

