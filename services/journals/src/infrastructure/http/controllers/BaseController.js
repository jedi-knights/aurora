class BaseController {
    handleSuccess(res, data, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data
        })
    }

    asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next)
        }
    }
}

module.exports = { BaseController }

