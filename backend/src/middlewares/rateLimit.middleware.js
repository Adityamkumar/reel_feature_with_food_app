import rateLimit from 'express-rate-limit'

const limitConfig = {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many attempts. Try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
}

export const loginLimiter = rateLimit(limitConfig)
export const registerLimiter = rateLimit(limitConfig)
