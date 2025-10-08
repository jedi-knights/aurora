const mongoose = require('mongoose')

const entrySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    journalId: {
        type: String,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    metadata: {
        mood: String,
        weather: String,
        location: String,
        wordCount: { type: Number, default: 0 }
    },
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
entrySchema.index({ journalId: 1, timestamp: -1 })
entrySchema.index({ journalId: 1, 'metadata.mood': 1 })
entrySchema.index({ content: 'text' }) // Full-text search

const EntryModel = mongoose.model('Entry', entrySchema)

module.exports = { EntryModel }

