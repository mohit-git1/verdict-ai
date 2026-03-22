import { Router, Request, Response } from 'express'
import multer from 'multer'
import Assignment from '../models/Assignment'
import Result from '../models/Result'
import { assignmentQueue } from '../queues/queue'
import { io } from '../index'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/', async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 })
    res.json({ success: true, data: assignments })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' })
    const result = await Result.findOne({ assignmentId: req.params.id })
    res.json({ success: true, data: { assignment, result } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, subject, dueDate, questionTypes, additionalInstructions } = req.body

    let parsedQTypes = []
    try {
      parsedQTypes = typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid questionTypes format' })
    }

    if (!title || !dueDate || !parsedQTypes.length) {
      return res.status(400).json({ success: false, error: 'title, dueDate, and questionTypes are required' })
    }

    for (const qt of parsedQTypes) {
      if (!qt.type || qt.numQuestions < 1 || qt.marks < 1) {
        return res.status(400).json({ success: false, error: 'Each question type needs valid type, numQuestions and marks' })
      }
    }

    let fileContent: string | undefined
    let fileName: string | undefined
    if (req.file) {
      fileName = req.file.originalname
      // Only store text files, skip binary files like images
const mimeType = req.file.mimetype
if (mimeType === 'text/plain') {
  fileContent = req.file.buffer.toString('utf-8')
} else {
  // For images/PDFs just store the filename, not the binary content
  fileContent = undefined
}
    }

    const assignment = new Assignment({
      title, subject: subject || 'General', dueDate,
      questionTypes: parsedQTypes,
      additionalInstructions: additionalInstructions || '',
      fileContent, fileName, status: 'pending'
    })
    await assignment.save()

    const job = await assignmentQueue.add('generate-paper', {
      assignmentId: assignment._id.toString()
    })

    assignment.jobId = job.id
    await assignment.save()

    console.log(`📋 Assignment ${assignment._id} created, job ${job.id} queued`)
    res.status(201).json({ success: true, data: assignment })

  } catch (err: any) {
    console.error('Create assignment error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id)
    await Result.findOneAndDelete({ assignmentId: req.params.id })
    res.json({ success: true, message: 'Deleted' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' })

    await Result.findOneAndDelete({ assignmentId: req.params.id })
    assignment.status = 'pending'
    await assignment.save()

    const job = await assignmentQueue.add('generate-paper', {
      assignmentId: assignment._id.toString()
    })
    assignment.jobId = job.id
    await assignment.save()

    res.json({ success: true, message: 'Regeneration started' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/:id/notify', async (req: Request, res: Response) => {
  if (req.headers['x-internal-key'] !== 'worker-secret') {
    return res.status(403).json({ success: false, error: 'Forbidden' })
  }
  const { event, data } = req.body
  io.to(`assignment:${req.params.id}`).emit(event, data)
  res.json({ success: true })
})

export default router
