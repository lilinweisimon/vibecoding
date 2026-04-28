import { create } from 'zustand'

interface Course {
  name: string
  chapters: string[]
}

interface NoteState {
  courses: Course[]
  currentCourse: string | null
  currentChapter: string | null
  content: string
  isDirty: boolean
  isLoading: boolean

  setCourses: (courses: Course[]) => void
  setCurrentCourse: (course: string | null) => void
  setCurrentChapter: (chapter: string | null) => void
  setContent: (content: string) => void
  setIsDirty: (dirty: boolean) => void
  setIsLoading: (loading: boolean) => void
  addCourse: (name: string) => void
  removeCourse: (name: string) => void
  addChapter: (course: string, chapter: string) => void
  removeChapter: (course: string, chapter: string) => void
  renameChapterInStore: (course: string, oldName: string, newName: string) => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  courses: [],
  currentCourse: null,
  currentChapter: null,
  content: '',
  isDirty: false,
  isLoading: false,

  setCourses: (courses) => set({ courses }),
  setCurrentCourse: (course) => set({ currentCourse: course, currentChapter: null, content: '', isDirty: false }),
  setCurrentChapter: (chapter) => set({ currentChapter: chapter, content: '', isDirty: false }),
  setContent: (content) => set({ content, isDirty: true }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  addCourse: (name) =>
    set((state) => ({
      courses: [...state.courses, { name, chapters: [] }]
    })),

  removeCourse: (name) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.name !== name),
      currentCourse: state.currentCourse === name ? null : state.currentCourse
    })),

  addChapter: (course, chapter) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.name === course ? { ...c, chapters: [...c.chapters, chapter] } : c
      )
    })),

  removeChapter: (course, chapter) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.name === course ? { ...c, chapters: c.chapters.filter((ch) => ch !== chapter) } : c
      ),
      currentChapter: state.currentChapter === chapter ? null : state.currentChapter
    })),

  renameChapterInStore: (course, oldName, newName) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.name === course
          ? { ...c, chapters: c.chapters.map((ch) => (ch === oldName ? newName : ch)) }
          : c
      ),
      currentChapter: state.currentChapter === oldName ? newName : state.currentChapter
    }))
}))
