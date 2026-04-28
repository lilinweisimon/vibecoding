import { ipcMain } from 'electron'
import OpenAI from 'openai'
import { WindowManager } from '../windows/WindowManager'
import { configStore } from './configHandlers'

let activeAbortController: AbortController | null = null

export function registerAiHandlers(wm: WindowManager): void {
  ipcMain.handle('ai:chat', async (_event, messages: Array<{ role: string; content: string }>) => {
    const win = wm.getWindow()
    if (!win) return { success: false, error: '窗口不存在' }

    const apiKey = configStore.get('deepseekApiKey')
    if (!apiKey) {
      return { success: false, error: '请先在设置中配置 DeepSeek API Key' }
    }

    const client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey
    })

    activeAbortController = new AbortController()

    try {
      const stream = await client.chat.completions.create(
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的笔记助手。帮助用户在学习过程中解答疑问、理解概念、整理知识点。用中文回答，回答简洁清晰。'
            },
            ...(messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>)
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 2048
        },
        { signal: activeAbortController.signal }
      )

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          win.webContents.send('ai:token', delta)
        }
      }

      win.webContents.send('ai:done')
      return { success: true }
    } catch (error: unknown) {
      const err = error as Error & { code?: string }
      if (err.name === 'AbortError' || err.code === 'request_aborted') {
        win.webContents.send('ai:done')
        return { success: true, aborted: true }
      }
      const message = err instanceof Error ? err.message : '未知错误'
      win.webContents.send('ai:error', message)
      return { success: false, error: message }
    } finally {
      activeAbortController = null
    }
  })

  ipcMain.handle('ai:organize', async (_event, notes: string, chapterTitle: string) => {
    const win = wm.getWindow()
    if (!win) return { success: false, error: '窗口不存在' }

    const apiKey = configStore.get('deepseekApiKey')
    if (!apiKey) {
      return { success: false, error: '请先在设置中配置 DeepSeek API Key' }
    }

    const client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey
    })

    activeAbortController = new AbortController()

    try {
      const stream = await client.chat.completions.create(
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的笔记整理助手。用户提供了"${chapterTitle}"章节的笔记内容。请整理成结构化的笔记，包括：
1. 本章核心知识点总结
2. 重点概念解释
3. 关键公式或代码片段（如有）
4. 建议复习的要点

格式使用 Markdown，保持简洁清晰。`
            },
            {
              role: 'user',
              content: notes
            }
          ],
          stream: true,
          temperature: 0.5,
          max_tokens: 4096
        },
        { signal: activeAbortController.signal }
      )

      let fullContent = ''
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          fullContent += delta
          win.webContents.send('ai:organize-token', delta)
        }
      }

      win.webContents.send('ai:organize-done', fullContent)
      return { success: true, content: fullContent }
    } catch (error: unknown) {
      const err = error as Error & { code?: string }
      if (err.name === 'AbortError' || err.code === 'request_aborted') {
        win.webContents.send('ai:organize-done', '')
        return { success: true, aborted: true }
      }
      const message = err instanceof Error ? err.message : '未知错误'
      win.webContents.send('ai:error', message)
      return { success: false, error: message }
    } finally {
      activeAbortController = null
    }
  })

  ipcMain.handle('ai:abort', () => {
    if (activeAbortController) {
      activeAbortController.abort()
      activeAbortController = null
    }
    return true
  })
}
