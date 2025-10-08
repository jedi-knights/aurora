const { BaseController } = require('./BaseController')

class AuthController extends BaseController {
    constructor({ registerUserUseCase, loginUserUseCase, verifyTokenUseCase }) {
        super()
        this.registerUserUseCase = registerUserUseCase
        this.loginUserUseCase = loginUserUseCase
        this.verifyTokenUseCase = verifyTokenUseCase
    }

    register = this.asyncHandler(async (req, res) => {
        const user = await this.registerUserUseCase.execute({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        })

        return this.handleSuccess(res, user, 201)
    })

    login = this.asyncHandler(async (req, res) => {
        const result = await this.loginUserUseCase.execute({
            email: req.body.email,
            password: req.body.password
        })

        return this.handleSuccess(res, result)
    })

    verify = this.asyncHandler(async (req, res) => {
        const authHeader = req.headers.authorization
        const token = authHeader?.substring(7) // Remove "Bearer "

        const user = await this.verifyTokenUseCase.execute(token)

        return this.handleSuccess(res, { user })
    })
}

module.exports = { AuthController }

