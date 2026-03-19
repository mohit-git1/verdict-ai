import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestion {
  id: number
  text: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  answer?: string
}

export interface ISection {
  id: string
  title: string
  instruction: string
  questions: IQuestion[]
}

export interface IResult extends Document {
  assignmentId: mongoose.Types.ObjectId
  paperTitle: string
  schoolName: string
  subject: string
  className: string
  timeAllowed: string
  maximumMarks: number
  sections: ISection[]
  createdAt: Date
}

const QuestionSchema = new Schema({
  id: Number,
  text: String,
  type: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  marks: Number,
  answer: String
})

const SectionSchema = new Schema({
  id: String,
  title: String,
  instruction: String,
  questions: [QuestionSchema]
})

const ResultSchema = new Schema({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  paperTitle: String,
  schoolName: { type: String, default: 'Delhi Public School, Sector-4, Bokaro' },
  subject: String,
  className: String,
  timeAllowed: String,
  maximumMarks: Number,
  sections: [SectionSchema]
}, { timestamps: true })

export default mongoose.model<IResult>('Result', ResultSchema)
