const mongoose = require('mongoose')

const thoughtSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Indexes
thoughtSchema.index({ userId: 1, timestamp: -1 })
thoughtSchema.index({ userId: 1, tags: 1 })
thoughtSchema.index({ text: 'text' }) // Full-text search

const ThoughtModel = mongoose.model('Thought', thoughtSchema)

module.exports = { ThoughtModel }

