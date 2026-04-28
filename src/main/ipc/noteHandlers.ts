import { ipcMain, dialog } from 'electron'
import { readFile, writeFile, mkdir, readdir, stat, rm } from 'fs/promises'
import { join, extname, basename } from 'path'
import { existsSync } from 'fs'

const NOTES_DIR = join(process.cwd(), 'notes')

async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true })
  }
}

interface MetaFile {
  chapters: string[]
  createdAt: string
}

async function readMeta(coursePath: string): Promise<MetaFile> {
  const metaPath = join(coursePath, '_meta.json')
  try {
    const raw = await readFile(metaPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { chapters: [], createdAt: new Date().toISOString() }
  }
}

async function writeMeta(coursePath: string, meta: MetaFile): Promise<void> {
  const metaPath = join(coursePath, '_meta.json')
  await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
}

export function registerNoteHandlers(): void {
  ipcMain.handle('note:list-courses', async () => {
    await ensureDir(NOTES_DIR)
    const entries = await readdir(NOTES_DIR, { withFileTypes: true })
    const courses = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const coursePath = join(NOTES_DIR, entry.name)
        const meta = await readMeta(coursePath)
        courses.push({
          name: entry.name,
          chapters: meta.chapters
        })
      }
    }
    return courses
  })

  ipcMain.handle('note:list-chapters', async (_e, courseName: string) => {
    const coursePath = join(NOTES_DIR, courseName)
    const meta = await readMeta(coursePath)
    return meta.chapters
  })

  ipcMain.handle('note:read', async (_e, courseName: string, chapterName: string) => {
    const filePath = join(NOTES_DIR, courseName, `${chapterName}.md`)
    try {
      const content = await readFile(filePath, 'utf-8')
      return { success: true, content }
    } catch {
      return { success: false, content: '', error: '文件不存在' }
    }
  })

  ipcMain.handle('note:save', async (_e, courseName: string, chapterName: string, content: string) => {
    const coursePath = join(NOTES_DIR, courseName)
    await ensureDir(coursePath)
    const filePath = join(coursePath, `${chapterName}.md`)
    await writeFile(filePath, content, 'utf-8')

    // Update meta if this is a new chapter
    const meta = await readMeta(coursePath)
    if (!meta.chapters.includes(chapterName)) {
      meta.chapters.push(chapterName)
      await writeMeta(coursePath, meta)
    }

    return { success: true }
  })

  ipcMain.handle('note:create-course', async (_e, courseName: string) => {
    const coursePath = join(NOTES_DIR, courseName)
    if (existsSync(coursePath)) {
      return { success: false, error: '课程已存在' }
    }
    await ensureDir(coursePath)
    await writeMeta(coursePath, { chapters: [], createdAt: new Date().toISOString() })
    return { success: true }
  })

  ipcMain.handle('note:create-chapter', async (_e, courseName: string, chapterName: string) => {
    const coursePath = join(NOTES_DIR, courseName)
    const filePath = join(coursePath, `${chapterName}.md`)
    if (existsSync(filePath)) {
      return { success: false, error: '章节已存在' }
    }
    await ensureDir(coursePath)
    await writeFile(filePath, '', 'utf-8')

    const meta = await readMeta(coursePath)
    if (!meta.chapters.includes(chapterName)) {
      meta.chapters.push(chapterName)
      await writeMeta(coursePath, meta)
    }
    return { success: true }
  })

  ipcMain.handle('note:delete-chapter', async (_e, courseName: string, chapterName: string) => {
    const coursePath = join(NOTES_DIR, courseName)
    const filePath = join(coursePath, `${chapterName}.md`)
    if (existsSync(filePath)) {
      await rm(filePath)
    }
    const meta = await readMeta(coursePath)
    meta.chapters = meta.chapters.filter((c: string) => c !== chapterName)
    await writeMeta(coursePath, meta)
    return { success: true }
  })

  ipcMain.handle('note:delete-course', async (_e, courseName: string) => {
    const coursePath = join(NOTES_DIR, courseName)
    if (existsSync(coursePath)) {
      await rm(coursePath, { recursive: true, force: true })
    }
    return { success: true }
  })

  ipcMain.handle('note:rename-chapter', async (_e, courseName: string, oldName: string, newName: string) => {
    const coursePath = join(NOTES_DIR, courseName)
    const oldPath = join(coursePath, `${oldName}.md`)
    const newPath = join(coursePath, `${newName}.md`)

    const { rename } = await import('fs/promises')
    if (existsSync(oldPath)) {
      await rename(oldPath, newPath)
    }
    const meta = await readMeta(coursePath)
    meta.chapters = meta.chapters.map((c: string) => (c === oldName ? newName : c))
    await writeMeta(coursePath, meta)
    return { success: true }
  })
}
