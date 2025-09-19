import mongoose, { Schema, Document as MDoc } from 'mongoose';


export type AnalysisKind = 'missing_fields' | 'recommendations';


export interface IAnalysis extends MDoc {
documentId: mongoose.Types.ObjectId;
kind: AnalysisKind;
result: any; // JSON
createdAt: Date;
}


const AnalysisSchema = new Schema<IAnalysis>({
documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
kind: { type: String, required: true },
result: { type: Schema.Types.Mixed, required: true },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema);