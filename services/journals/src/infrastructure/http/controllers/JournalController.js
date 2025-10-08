const { BaseController } = require('./BaseController')

class JournalController extends BaseController {
    constructor({
        createJournalUseCase,
        getJournalsUseCase,
        getJournalUseCase,
        updateJournalUseCase,
        deleteJournalUseCase
    }) {
        super()
        this.createJournalUseCase = createJournalUseCase
        this.getJournalsUseCase = getJournalsUseCase
        this.getJournalUseCase = getJournalUseCase
        this.updateJournalUseCase = updateJournalUseCase
        this.deleteJournalUseCase = deleteJournalUseCase
    }

    create = this.asyncHandler(async (req, res) => {
        const journal = await this.createJournalUseCase.execute({
            userId: req.user.id,
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
            icon: req.body.icon
        })

        return this.handleSuccess(res, journal, 201)
    })

    getAll = this.asyncHandler(async (req, res) => {
        const options = {
            includeArchived: req.query.includeArchived === 'true',
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0
        }

        const journals = await this.getJournalsUseCase.execute(req.user.id, options)

        return this.handleSuccess(res, journals)
    })

    getOne = this.asyncHandler(async (req, res) => {
        const journal = await this.getJournalUseCase.execute(
            req.params.id,
            req.user.id
        )

        return this.handleSuccess(res, journal)
    })

    update = this.asyncHandler(async (req, res) => {
        const journal = await this.updateJournalUseCase.execute({
            id: req.params.id,
            userId: req.user.id,
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
            icon: req.body.icon
        })

        return this.handleSuccess(res, journal)
    })

    delete = this.asyncHandler(async (req, res) => {
        await this.deleteJournalUseCase.execute(req.params.id, req.user.id)

        return this.handleSuccess(res, { message: 'Journal deleted successfully' })
    })
}

module.exports = { JournalController }

