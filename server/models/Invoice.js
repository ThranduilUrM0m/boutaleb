import mongoose from 'mongoose';

const { Schema } = mongoose;
const Invoice = new Schema(
    {
        _invoice_number: {
            type: String,
        },
        _invoice_dateIssued: {
            type: Date,
        },
        _invoice_dueDate: {
            type: Date,
        },
        _invoice_amount: {
            type: Number,
        },
        _invoice_status: {
            type: String,
        },
        _invoice_items: [
            {
                __description: {
                    type: String,
                },
                __quantity: {
                    type: Number,
                },
                __price: {
                    type: Number,
                },
            },
        ],
        _invoice_currency: {
            type: String,
        },
        _invoice_tax: {
            type: Number,
        },
        _invoice_discount: {
            type: Number,
        },
        _invoice_notes: {
            type: String,
        },
        Client: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Client',
        },
    },
    { timestamps: true },
);

export default mongoose.models.Invoice || mongoose.model('Invoice', Invoice);
