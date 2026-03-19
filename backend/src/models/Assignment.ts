import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestionType {
  type: string
  numQuestions: number
  marks: number
}

export interface IAssignment extends Document {
  title: string
  subject: string
  dueDate: string
  questionTypes: IQuestionType[]
  additionalInstructions: string
  fileContent?: string
  fileName?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  jobId?: string
  createdAt: Date
  updatedAt: Date
}

const QuestionTypeSchema = new Schema({
  type: { type: String, required: true },
  numQuestions: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 }
})

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, default: 'General' },
  dueDate: { type: String, required: true },
  questionTypes: [QuestionTypeSchema],
  additionalInstructions: { type: String, default: '' },
  fileContent: { type: String },
  fileName: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  jobId: { type: String }
}, { timestamps: true })

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema)
