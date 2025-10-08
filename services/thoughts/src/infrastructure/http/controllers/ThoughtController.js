const { BaseController } = require('./BaseController')

class ThoughtController extends BaseController {
    constructor({
        createThoughtUseCase,
        getThoughtUseCase,
        getThoughtsUseCase,
        updateThoughtUseCase,
        deleteThoughtUseCase,
        searchThoughtsUseCase
    }) {
        super()
        this.createThoughtUseCase = createThoughtUseCase
        this.getThoughtUseCase = getThoughtUseCase
        this.getThoughtsUseCase = getThoughtsUseCase
        this.updateThoughtUseCase = updateThoughtUseCase
        this.deleteThoughtUseCase = deleteThoughtUseCase
        this.searchThoughtsUseCase = searchThoughtsUseCase
    }

    create = this.asyncHandler(async (req, res) => {
        const thought = await this.createThoughtUseCase.execute({
            userId: req.user.id,
            text: req.body.text,
            tags: req.body.tags
        })

        return this.handleSuccess(res, thought, 201)
    })

    getAll = this.asyncHandler(async (req, res) => {
        const options = {
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0,
            tag: req.query.tag,
            sortBy: req.query.sortBy || 'timestamp',
            order: req.query.order || 'desc'
        }

        const thoughts = await this.getThoughtsUseCase.execute(req.user.id, options)

        return this.handleSuccess(res, thoughts)
    })

    getOne = this.asyncHandler(async (req, res) => {
        const thought = await this.getThoughtUseCase.execute(
            req.params.id,
            req.user.id
        )

        return this.handleSuccess(res, thought)
    })

    update = this.asyncHandler(async (req, res) => {
        const thought = await this.updateThoughtUseCase.execute({
            id: req.params.id,
            userId: req.user.id,
            text: req.body.text,
            tags: req.body.tags
        })

        return this.handleSuccess(res, thought)
    })

    delete = this.asyncHandler(async (req, res) => {
        await this.deleteThoughtUseCase.execute(req.params.id, req.user.id)

        return this.handleSuccess(res, { message: 'Thought deleted successfully' })
    })

    search = this.asyncHandler(async (req, res) => {
        const thoughts = await this.searchThoughtsUseCase.execute(
            req.user.id,
            req.query.q
        )

        return this.handleSuccess(res, thoughts)
    })
}

module.exports = { ThoughtController }

