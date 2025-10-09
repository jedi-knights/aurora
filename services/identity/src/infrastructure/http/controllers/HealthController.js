const { logger } = require('../../../shared/logger/logger')

/**
 * Health Check Controller for Kubernetes Probes
 * 
 * Provides three types of health checks:
 * 1. Liveness - Is the service alive? (basic check)
 * 2. Readiness - Is the service ready to handle requests? (includes DB check)
 * 3. Startup - Has the service started successfully? (for slow startups)
 */
class HealthController {
    constructor(dbPool) {
        this.dbPool = dbPool
        this.startTime = Date.now()
        this.isReady = false
    }

    /**
     * Liveness Probe
     * Returns 200 if the service process is alive
     * Used by Kubernetes to restart unhealthy pods
     */
    liveness = async (req, res) => {
        res.status(200).json({
            status: 'alive',
            service: 'identity',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000)
        })
    }

    /**
     * Readiness Probe
     * Returns 200 if the service can handle requests (including DB connectivity)
     * Used by Kubernetes to determine if pod should receive traffic
     */
    readiness = async (req, res) => {
        try {
            // Check database connectivity
            const result = await this.dbPool.query('SELECT 1 as healthy')

            if (result.rows[0].healthy === 1) {
                this.isReady = true
                return res.status(200).json({
                    status: 'ready',
                    service: 'identity',
                    timestamp: new Date().toISOString(),
                    checks: {
                        database: 'connected'
                    }
                })
            }

            throw new Error('Database health check failed')
        } catch (error) {
            logger.error('Readiness check failed:', error)
            return res.status(503).json({
                status: 'not_ready',
                service: 'identity',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'disconnected'
                },
                error: error.message
            })
        }
    }

    /**
     * Startup Probe
     * Returns 200 once the service has fully started
     * Used by Kubernetes to know when to switch to liveness/readiness probes
     */
    startup = async (req, res) => {
        try {
            // Check if service has been running for at least 5 seconds
            const uptime = Date.now() - this.startTime
            if (uptime < 5000) {
                return res.status(503).json({
                    status: 'starting',
                    service: 'identity',
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor(uptime / 1000)
                })
            }

            // Check database connectivity
            const result = await this.dbPool.query('SELECT 1 as healthy')

            if (result.rows[0].healthy === 1) {
                return res.status(200).json({
                    status: 'started',
                    service: 'identity',
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor(uptime / 1000)
                })
            }

            throw new Error('Database not ready')
        } catch (error) {
            logger.error('Startup check failed:', error)
            return res.status(503).json({
                status: 'starting',
                service: 'identity',
                timestamp: new Date().toISOString(),
                error: error.message
            })
        }
    }

    /**
     * Legacy health check (backwards compatibility)
     */
    health = async (req, res) => {
        try {
            const result = await this.dbPool.query('SELECT 1 as healthy')

            res.status(200).json({
                status: 'healthy',
                service: 'identity',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                checks: {
                    database: result.rows[0].healthy === 1 ? 'connected' : 'disconnected'
                }
            })
        } catch (error) {
            logger.error('Health check failed:', error)
            res.status(503).json({
                status: 'unhealthy',
                service: 'identity',
                timestamp: new Date().toISOString(),
                error: error.message
            })
        }
    }
}

module.exports = { HealthController }

