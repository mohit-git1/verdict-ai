'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import AppShell from '@/components/layout/AppShell'
import { useAssessmentStore } from '@/store/assignmentStore'
import { assignmentsApi } from '@/lib/api'

interface QuestionTypeRow {
  id: string
  type: string
  numQuestions: number
  marks: number
}

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Coding Problems',
  'System Design Questions',
  'Theory / Concept Questions',
  'Scenario Based Questions',
  'Debugging Challenges',
  'SQL / Database Questions',
  'Behavioural Questions'
]

const EXP_LEVELS = [
  'Intern',
  'Junior (0-2 years)',
  'Mid (2-5 years)',
  'Senior (5+ years)',
  'Lead / Principal'
]

const TECH_STACK = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'Go', 'Rust',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'GCP', 'Azure',
  'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'REST APIs',
  'System Design', 'Data Structures & Algorithms', 'Machine Learning', 'Data Science'
]

export default function CreateAssessmentPage() {
  const router = useRouter()
  const { addAssessment, setGenerating } = useAssessmentStore()

  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [questionTypes, setQuestionTypes] = useState<QuestionTypeRow[]>([
    { id: '1', type: 'Multiple Choice Questions', numQuestions: 10, marks: 2 },
    { id: '2', type: 'Theory / Concept Questions', numQuestions: 5, marks: 4 },
    { id: '3', type: 'Scenario Based Questions', numQuestions: 3, marks: 10 },
  ])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  const addQuestionType = () => {
    setQuestionTypes([...questionTypes, {
      id: Date.now().toString(),
      type: 'Multiple Choice Questions',
      numQuestions: 1,
      marks: 1,
    }])
  }

  const removeQuestionType = (id: string) => {
    setQuestionTypes(questionTypes.filter((q) => q.id !== id))
  }

  const updateRow = (id: string, field: keyof QuestionTypeRow, value: any) => {
    setQuestionTypes(questionTypes.map((q) => q.id === id ? { ...q, [field]: value } : q))
  }

  const totalQuestions = questionTypes.reduce((s, q) => s + q.numQuestions, 0)
  const totalMarks = questionTypes.reduce((s, q) => s + q.numQuestions * q.marks, 0)

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()])
      setCustomSkill('')
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!jobTitle.trim()) e.jobTitle = 'Job title is required'
    if (!companyName.trim()) e.companyName = 'Company name is required'
    if (!experienceLevel) e.experienceLevel = 'Select an experience level'
    if (selectedSkills.length === 0) e.selectedSkills = 'Select at least one skill'
    if (!dueDate) e.dueDate = 'Deadline is required'
    if (questionTypes.length === 0) e.questionTypes = 'Add at least one question type'
    questionTypes.forEach((q, i) => {
      if (q.numQuestions < 1) e[`q_${i}_num`] = 'Min 1'
      if (q.marks < 1) e[`q_${i}_marks`] = 'Min 1'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', `${jobTitle} Assessment — ${companyName}`)
      formData.append('subject', selectedSkills.join(', '))
      formData.append('dueDate', dueDate)
      formData.append('questionTypes', JSON.stringify(questionTypes.map(q => ({
        type: q.type, numQuestions: q.numQuestions, marks: q.marks
      }))))
      const combinedInstructions = `Job Title: ${jobTitle}\nCompany: ${companyName}\nExperience Level: ${experienceLevel}\nRequired Skills: ${selectedSkills.join(', ')}\n\n${additionalInstructions}`
      formData.append('additionalInstructions', combinedInstructions)
      if (file && (file?.type === 'text/plain' || file?.type === 'application/pdf')) {
        formData.append('file', file)
      }

      const res = await assignmentsApi.create(formData)
      addAssessment(res.data.data)
      setGenerating(true)
      router.push(`/assignments/${res.data.data._id}`)
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setErrors({ submit: '⏳ Taking longer than usual. Check Assessments page — your paper may already be generating.' })
      } else {
        setErrors({ submit: '⚠️ Couldn\'t connect. Check the Assessments page — your request may have gone through.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell showBack title="Create Assessment">
      <div className="max-w-[720px] mx-auto pb-24 md:pb-12">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-[8px] mb-[2px]">
            <div className="w-[8px] h-[8px] rounded-full bg-[#2563EB]"></div>
            <h1 className="text-[18px] font-semibold text-[#111111]">Create Assessment</h1>
          </div>
          <p className="text-[13px] text-[#6B7280] ml-[16px]">Generate a role-specific technical assessment</p>
        </div>

        {/* Stepper */}
        <div className="mb-[32px]">
          <div className="w-full h-[4px] bg-[#E5E7EB] rounded-full">
            <div className="h-[4px] bg-[#2563EB] rounded-full" style={{ width: '50%' }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] border border-[#F0F0F0] p-[24px] md:p-[32px]">

          {/* Job Title */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Full Stack Engineer, Data Scientist"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={`w-full px-[16px] py-[10px] border rounded-lg text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] transition-colors ${errors.jobTitle ? 'border-red-300' : 'border-[#E5E7EB]'}`}
            />
            {errors.jobTitle && <p className="text-[12px] text-red-500 mt-1">{errors.jobTitle}</p>}
          </div>

          {/* Company Name */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Anthropic, Google, Startup Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full px-[16px] py-[10px] border rounded-lg text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] transition-colors ${errors.companyName ? 'border-red-300' : 'border-[#E5E7EB]'}`}
            />
            {errors.companyName && <p className="text-[12px] text-red-500 mt-1">{errors.companyName}</p>}
          </div>

          {/* Experience Level */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EXP_LEVELS.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperienceLevel(level)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors border ${experienceLevel === level ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
            {errors.experienceLevel && <p className="text-[12px] text-red-500 mt-1">{errors.experienceLevel}</p>}
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {TECH_STACK.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    if (selectedSkills.includes(skill)) {
                      setSelectedSkills(selectedSkills.filter(s => s !== skill))
                    } else {
                      setSelectedSkills([...selectedSkills, skill])
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${selectedSkills.includes(skill) ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add custom skill..." 
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomSkill()
                  }
                }}
                className="flex-1 px-[16px] py-[8px] border border-gray-200 rounded-lg text-sm text-[#111111] focus:outline-none focus:border-[#D1D5DB]"
              />
              <button 
                type="button" 
                onClick={handleAddCustomSkill}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
              >
                Add
              </button>
            </div>
            {selectedSkills.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="text-xs font-semibold text-blue-800">Selected Skills: </span>
                <span className="text-xs text-blue-900">{selectedSkills.join(', ')}</span>
              </div>
            )}
            {errors.selectedSkills && <p className="text-[12px] text-red-500 mt-1">{errors.selectedSkills}</p>}
          </div>

          {/* Section heading */}
          <div className="mb-5 mt-10">
            <h2 className="text-[15px] font-semibold text-[#111111]">Assessment Details</h2>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Configure the technical assessment parameters</p>
          </div>

          {/* File Upload Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-[12px] p-[32px] text-center cursor-pointer transition-colors mb-3 ${
              isDragActive ? 'border-[#9CA3AF] bg-[#F9FAFB]' :
              file ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-3">
                  <svg width="20" height="20" fill="none" stroke="#22C55E" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-[#374151]">{file.name}</p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-3 text-[#9CA3AF]">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-[#374151]">
                  {isDragActive ? 'Drop JD file here...' : 'Upload Job Description (PDF/TXT)'}
                </p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">Optional. The AI will use this context to generate better questions.</p>
                <button
                  type="button"
                  className="mt-4 px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
          <p className="text-[12px] text-[#9CA3AF] text-center mb-[24px]">Upload job descriptions to tailor the assessment</p>

          {/* Assessment Deadline */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
              Assessment Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 ${errors.dueDate ? 'border-red-300' : 'border-gray-200'}`}
              style={{ colorScheme: 'light', WebkitAppearance: 'none' }}
            />
            {errors.dueDate && <p className="text-[12px] text-red-500 mt-1">{errors.dueDate}</p>}
          </div>

          {/* Question Types */}
          <div className="mb-[24px]">
            <div className="hidden md:grid grid-cols-12 gap-[12px] mb-2 px-1">
              <div className="col-span-6 xl:col-span-7 text-[12px] font-medium text-[#6B7280]">Question Type</div>
              <div className="col-span-3 xl:col-span-2 text-[12px] font-medium text-[#6B7280] text-center">No. of Questions</div>
              <div className="col-span-3 text-[12px] font-medium text-[#6B7280] text-center">Marks</div>
            </div>

            <div className="space-y-[16px] md:space-y-[12px]">
              {questionTypes.map((row) => (
                <div key={row.id} className="flex flex-col md:grid md:grid-cols-12 gap-[12px] items-start md:items-center">
                  <div className="w-full md:col-span-6 xl:col-span-7 flex items-center gap-[12px]">
                    <div className="relative flex-1">
                      <select
                        value={row.type}
                        onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                        className="w-full px-[16px] py-[10px] border border-[#E5E7EB] rounded-lg text-[13px] text-[#111111] focus:outline-none focus:border-[#D1D5DB] appearance-none bg-white pr-[32px] truncate"
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    <button
                      onClick={() => removeQuestionType(row.id)}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="w-full md:w-auto md:col-span-6 xl:col-span-5 flex items-center justify-between md:grid md:grid-cols-2 gap-[12px] md:gap-0 pl-1 md:pl-0">
                    <div className="flex items-center gap-[4px] md:justify-center w-auto md:w-full">
                      <span className="md:hidden text-[12px] font-medium text-[#6B7280] mr-2">Questions:</span>
                      <button
                        onClick={() => updateRow(row.id, 'numQuestions', Math.max(1, row.numQuestions - 1))}
                        className="w-[28px] h-[28px] rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] text-sm font-medium transition-colors"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        value={row.numQuestions}
                        onChange={(e) => updateRow(row.id, 'numQuestions', parseInt(e.target.value) || 1)}
                        className="w-[28px] h-[28px] text-center text-[13px] font-medium text-[#111111] border border-[#E5E7EB] rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={() => updateRow(row.id, 'numQuestions', row.numQuestions + 1)}
                        className="w-[28px] h-[28px] rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] text-sm font-medium transition-colors"
                      >+</button>
                    </div>

                    <div className="flex items-center gap-[4px] md:justify-center w-auto md:w-full">
                      <span className="md:hidden text-[12px] font-medium text-[#6B7280] mr-2">Marks:</span>
                      <button
                        onClick={() => updateRow(row.id, 'marks', Math.max(1, row.marks - 1))}
                        className="w-[28px] h-[28px] rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] text-sm font-medium transition-colors"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        value={row.marks}
                        onChange={(e) => updateRow(row.id, 'marks', parseInt(e.target.value) || 1)}
                        className="w-[28px] h-[28px] text-center text-[13px] font-medium text-[#111111] border border-[#E5E7EB] rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={() => updateRow(row.id, 'marks', row.marks + 1)}
                        className="w-[28px] h-[28px] rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] text-sm font-medium transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.questionTypes && <p className="text-[12px] text-red-500 mt-2">{errors.questionTypes}</p>}

            <button
              onClick={addQuestionType}
              className="flex items-center gap-[8px] mt-[24px] text-[13px] font-medium text-[#374151] hover:text-[#111111] transition-colors"
            >
              <div className="w-[28px] h-[28px] bg-[#111111] rounded-full flex items-center justify-center text-white text-[16px] font-medium">
                +
              </div>
              Add Question Type
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2 sm:gap-6 mt-[24px] pt-[24px] border-t border-[#F0F0F0] text-[13px] text-[#374151]">
              <span>Total Questions : <strong className="font-bold text-[#111111]">{totalQuestions}</strong></span>
              <span>Total Marks : <strong className="font-bold text-[#111111]">{totalMarks}</strong></span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-2">
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
              Additional Instructions <span className="font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                placeholder="e.g. Focus deeply on Next.js App Router..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={3}
                className="w-full px-[16px] py-[12px] border rounded-xl text-[14px] text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] resize-none pb-8 border-[#E5E7EB]"
              />
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {errors.submit}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-[32px]">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-[6px] h-[40px] px-[24px] border border-[#E5E7EB] rounded-full text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-[6px] h-[40px] px-[24px] rounded-full text-[13px] font-medium text-white transition-all disabled:opacity-60"
            style={{ background: '#2563EB' }}
          >
            {submitting ? (
              <>
                <div className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Assessment
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  )
}