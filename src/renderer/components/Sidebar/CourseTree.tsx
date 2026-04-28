import { useState } from 'react'
import { FolderOpen, FileText, Plus, Trash2, Edit3, ChevronRight, ChevronDown } from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'

export default function CourseTree() {
  const courses = useNoteStore((s) => s.courses)
  const currentCourse = useNoteStore((s) => s.currentCourse)
  const currentChapter = useNoteStore((s) => s.currentChapter)
  const setCurrentCourse = useNoteStore((s) => s.setCurrentCourse)
  const setCurrentChapter = useNoteStore((s) => s.setCurrentChapter)
  const setContent = useNoteStore((s) => s.setContent)
  const addCourse = useNoteStore((s) => s.addCourse)
  const removeCourse = useNoteStore((s) => s.removeCourse)
  const addChapter = useNoteStore((s) => s.addChapter)
  const removeChapter = useNoteStore((s) => s.removeChapter)
  const renameChapterInStore = useNoteStore((s) => s.renameChapterInStore)

  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [editingChapter, setEditingChapter] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newChapterCourse, setNewChapterCourse] = useState<string | null>(null)
  const [newChapterName, setNewChapterName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'course' | 'chapter'; course: string; chapter?: string } | null>(null)

  const toggleCourse = (name: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleSelectChapter = async (course: string, chapter: string) => {
    setCurrentCourse(course)
    setCurrentChapter(chapter)
    try {
      const result = await window.electronAPI.readNote(course, chapter)
      if (result.success) {
        setContent(result.content)
      }
    } catch (e) {
      console.error('Read note error:', e)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) return
    try {
      const result = await window.electronAPI.createCourse(newCourseName.trim())
      if (result.success) {
        addCourse(newCourseName.trim())
        setShowNewCourse(false)
        setNewCourseName('')
      }
    } catch (e) {
      console.error('Create course error:', e)
    }
  }

  const handleDeleteCourse = async (name: string) => {
    try {
      await window.electronAPI.deleteCourse(name)
      removeCourse(name)
    } catch (e) {
      console.error('Delete course error:', e)
    }
  }

  const handleCreateChapter = async (course: string) => {
    if (!newChapterName.trim()) return
    try {
      const result = await window.electronAPI.createChapter(course, newChapterName.trim())
      if (result.success) {
        addChapter(course, newChapterName.trim())
        setNewChapterCourse(null)
        setNewChapterName('')
        handleSelectChapter(course, newChapterName.trim())
      }
    } catch (e) {
      console.error('Create chapter error:', e)
    }
  }

  const handleDeleteChapter = async (course: string, chapter: string) => {
    try {
      await window.electronAPI.deleteChapter(course, chapter)
      removeChapter(course, chapter)
    } catch (e) {
      console.error('Delete chapter error:', e)
    }
  }

  const handleRenameChapter = async (course: string, oldName: string) => {
    if (!editName.trim()) return
    try {
      await window.electronAPI.renameChapter(course, oldName, editName.trim())
      renameChapterInStore(course, oldName, editName.trim())
      setEditingChapter(null)
    } catch (e) {
      console.error('Rename error:', e)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <span className="text-sm font-semibold text-dark-text">笔记目录</span>
        <button
          onClick={() => setShowNewCourse(true)}
          className="p-1.5 rounded hover:bg-dark-border text-dark-muted hover:text-dark-text"
          title="新建课程"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* New course input */}
      {showNewCourse && (
        <div className="px-4 py-2 border-b border-dark-border">
          <input
            autoFocus
            className="w-full bg-dark-bg text-dark-text text-sm px-3 py-1.5 rounded border border-dark-border focus:border-dark-accent outline-none"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateCourse()
              if (e.key === 'Escape') setShowNewCourse(false)
            }}
            placeholder="课程名称..."
          />
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="mx-4 mt-3 p-2.5 rounded border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-dark-text mb-2">
            确定删除{deleteConfirm.type === 'course' ? '课程' : '章节'} "{deleteConfirm.type === 'course' ? deleteConfirm.course : deleteConfirm.chapter}"？
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                if (deleteConfirm.type === 'course') {
                  handleDeleteCourse(deleteConfirm.course)
                } else if (deleteConfirm.chapter) {
                  handleDeleteChapter(deleteConfirm.course, deleteConfirm.chapter)
                }
                setDeleteConfirm(null)
              }}
              className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              删除
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-3 py-1 text-xs rounded bg-dark-border text-dark-muted hover:text-dark-text"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Course list */}
      <div className="flex-1 overflow-y-auto py-2">
        {courses.map((course) => (
          <div key={course.name}>
            {/* Course row */}
            <div
              className="flex items-center px-4 py-2.5 cursor-pointer hover:bg-dark-border group"
              onClick={() => toggleCourse(course.name)}
            >
              <span className="mr-2 text-dark-muted">
                {expandedCourses.has(course.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <FolderOpen size={16} className="text-dark-accent mr-2" />
              <span className="text-sm flex-1 truncate font-medium">{course.name}</span>
              <span className="text-xs text-dark-muted mr-2">{course.chapters.length}</span>
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setNewChapterCourse(course.name)
                    setNewChapterName('')
                    setExpandedCourses((prev) => {
                      const next = new Set(prev)
                      next.add(course.name)
                      return next
                    })
                  }}
                  className="p-1 rounded hover:bg-dark-border text-dark-muted"
                  title="新建章节"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm({ type: 'course', course: course.name })
                  }}
                  className="p-1 rounded hover:bg-red-500/10 text-dark-muted hover:text-red-400"
                  title="删除课程"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* New chapter input */}
            {newChapterCourse === course.name && (
              <div className="ml-10 px-4 py-1">
                <input
                  autoFocus
                  className="w-full bg-dark-bg text-dark-text text-sm px-3 py-1.5 rounded border border-dark-accent outline-none"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateChapter(course.name)
                    if (e.key === 'Escape') {
                      setNewChapterCourse(null)
                      setNewChapterName('')
                    }
                  }}
                  placeholder="章节名称..."
                />
              </div>
            )}

            {/* Chapters */}
            {expandedCourses.has(course.name) && (
              <div className="ml-6">
                {course.chapters.map((chapter) => (
                  <div
                    key={chapter}
                    className={`flex items-center px-4 py-2 cursor-pointer hover:bg-dark-border group ${
                      currentChapter === chapter && currentCourse === course.name
                        ? 'bg-dark-highlight/20 text-dark-accent'
                        : ''
                    }`}
                    onClick={() => handleSelectChapter(course.name, chapter)}
                  >
                    <FileText size={14} className="mr-2 text-dark-muted flex-shrink-0" />
                    {editingChapter === chapter ? (
                      <input
                        autoFocus
                        className="flex-1 bg-dark-bg text-dark-text text-sm px-2 py-1 rounded border border-dark-accent outline-none"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameChapter(course.name, chapter)
                          if (e.key === 'Escape') setEditingChapter(null)
                        }}
                        onBlur={() => setEditingChapter(null)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-sm flex-1 truncate">{chapter}</span>
                    )}
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingChapter(chapter)
                          setEditName(chapter)
                        }}
                        className="p-1 rounded hover:bg-dark-border text-dark-muted"
                        title="重命名"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm({ type: 'chapter', course: course.name, chapter })
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-dark-muted hover:text-red-400"
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {courses.length === 0 && (
          <div className="px-4 py-10 text-center text-dark-muted text-sm">
            还没有课程，点击 + 创建第一个课程
          </div>
        )}
      </div>
    </div>
  )
}
