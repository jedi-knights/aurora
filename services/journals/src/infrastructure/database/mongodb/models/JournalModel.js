const mongoose = require('mongoose')

const journalSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#667eea'
    },
    icon: {
        type: String,
        default: '📔'
    },
    settings: {
        isArchived: { type: Boolean, default: false },
        isPrivate: { type: Boolean, default: true },
        defaultMood: String
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
journalSchema.index({ userId: 1, 'settings.isArchived': 1 })
journalSchema.index({ userId: 1, createdAt: -1 })

const JournalModel = mongoose.model('Journal', journalSchema)

module.exports = { JournalModel }

