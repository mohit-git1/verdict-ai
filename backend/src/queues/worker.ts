import dotenv from 'dotenv'
dotenv.config()

import { Worker } from 'bullmq'
import mongoose from 'mongoose'
import { connection } from './queue'
import Assignment from '../models/Assignment'
import Result from '../models/Result'
import { buildPrompt } from '../services/promptBuilder'
import { generateQuestionPaper } from '../services/llm'

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Worker: MongoDB connected'))
  .catch(err => console.error('❌ Worker: MongoDB error:', err))

async function notifyFrontend(assignmentId: string, event: string, data: any) {
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/assignments/${assignmentId}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': 'worker-secret' },
      body: JSON.stringify({ event, data })
    })
  } catch (err) {
    console.log('⚠️ Could not notify frontend, frontend will poll')
  }
}

const worker = new Worker('assignment-generation', async (job) => {
  const { assignmentId } = job.data
  console.log(`\n🔧 Processing job ${job.id} for assignment ${assignmentId}`)

  try {
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`)

    assignment.status = 'processing'
    await assignment.save()
    await notifyFrontend(assignmentId, 'status:update', { status: 'processing' })

    const prompt = buildPrompt({
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      fileContent: assignment.fileContent
    })

    const paperData = await generateQuestionPaper(prompt)

    const result = new Result({
      assignmentId: assignment._id,
      paperTitle: paperData.paperTitle,
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: paperData.subject,
      className: paperData.className,
      timeAllowed: paperData.timeAllowed,
      maximumMarks: paperData.maximumMarks,
      sections: paperData.sections
    })
    await result.save()

    assignment.status = 'completed'
    await assignment.save()

    await notifyFrontend(assignmentId, 'generation:complete', {
      status: 'completed',
      resultId: result._id.toString()
    })

    console.log(`✅ Job ${job.id} completed successfully`)
    return { success: true, resultId: result._id.toString() }

  } catch (err: any) {
    console.error(`❌ Job ${job.id} failed:`, err.message)
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' })
    await notifyFrontend(assignmentId, 'generation:failed', { status: 'failed', error: err.message })
    throw err
  }
}, { connection, concurrency: 2 })

worker.on('completed', (job) => console.log(`✅ Worker completed job ${job.id}`))
worker.on('failed', (job, err) => console.error(`❌ Worker failed job ${job?.id}:`, err.message))

console.log('👷 Worker started, waiting for jobs...')
