import mongoose, { Schema, Document as MDoc } from 'mongoose';


export interface IDocument extends MDoc {
originalName: string;
filename: string;
mimetype: string;
size: number;
text: string;
detectedType?: 'contract' | 'invoice' | 'report' | 'unknown';
detectedConfidence?: number;
createdAt: Date;
}


const DocSchema = new Schema<IDocument>({
originalName: { type: String, required: true },
filename: { type: String, required: true },
mimetype: { type: String, required: true },
size: { type: Number, required: true },
text: { type: String, default: '' },
detectedType: { type: String, default: 'unknown' },
detectedConfidence: { type: Number, default: 0 },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model<IDocument>('Document', DocSchema);