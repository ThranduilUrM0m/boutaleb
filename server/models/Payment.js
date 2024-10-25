import mongoose from 'mongoose';

const { Schema } = mongoose;
const Payment = new Schema(
    {
        _payment_number: {
            type: String,
        },
        _payment_dateIssued: {
            type: Date,
        },
        _payment_dueDate: {
            type: Date,
        },
        _payment_amount: {
            type: Number,
        },
        _payment_method: {
            type: String,
        },
        _payment_status: {
            type: String,
        },
        _payment_items: [
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
        _payment_currency: {
            type: String,
        },
        _payment_tax: {
            type: Number,
        },
        _payment_discount: {
            type: Number,
        },
        _payment_notes: {
            type: String,
        },
        Client: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Client',
        },
        Invoice: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Invoice',
            },
        ],
    },
    { timestamps: true },
);

export default mongoose.models.Payment || mongoose.model('Payment', Payment);
