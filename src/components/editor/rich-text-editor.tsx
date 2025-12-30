'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Type,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const MenuBar = ({ editor, showSource, toggleSource }: { editor: any, showSource: boolean, toggleSource: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run()
      } else {
        alert('Upload failed')
      }
    } catch (error) {
      console.error(error)
      alert('Upload failed')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (showSource) {
    return (
      <div className="flex flex-wrap gap-1 border-b p-2 bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleSource}
          className="bg-gray-200"
          title="Back to Editor"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-gray-50 items-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-gray-200' : ''}
        title="Strike"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <select
        className="h-8 rounded border bg-transparent px-2 text-xs focus:outline-none"
        onChange={(e) => {
          const level = parseInt(e.target.value)
          if (level === 0) editor.chain().focus().setParagraph().run()
          else editor.chain().focus().toggleHeading({ level: level as any }).run()
        }}
        value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : '0'}
      >
        <option value="0">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <select
        className="h-8 rounded border bg-transparent px-2 text-xs focus:outline-none w-24"
        onChange={(e) => {
          editor.chain().focus().setFontFamily(e.target.value).run()
        }}
        value={editor.getAttributes('textStyle').fontFamily || ''}
      >
        <option value="">Default Font</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
      </select>

      <div className="flex items-center gap-1 border rounded px-1 h-8 bg-white">
        <Type className="h-3 w-3 text-gray-500" />
        <input
          type="color"
          className="w-6 h-6 p-0 border-0"
          onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          title="Text Color"
        />
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={setLink}
        className={editor.isActive('link') ? 'bg-gray-200' : ''}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
      
      <div className="flex-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleSource}
        className={showSource ? 'bg-gray-200' : ''}
        title="View Source Code"
      >
        <Code className="h-4 w-4 mr-2" />
        Source
      </Button>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [showSource, setShowSource] = useState(false)
  const [wordCount, setWordCount] = useState(() => (value.trim().match(/\S+/g) || []).length)
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!showSource) {
        onChange(editor.getHTML())
        try {
          const text = editor.getText()
          const count = (text.trim().match(/\S+/g) || []).length
          setWordCount(count)
        } catch {}
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
      },
    },
    immediatelyRender: false
  })

  // Update editor content if value changes externally (and not in source mode)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !showSource) {
      editor.commands.setContent(value)
    }
  }, [value, editor, showSource])

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value
    onChange(newVal)
    if (editor) {
      editor.commands.setContent(newVal)
    }
  }

  return (
    <div className="w-full border rounded-md overflow-hidden bg-white">
      <MenuBar 
        editor={editor} 
        showSource={showSource} 
        toggleSource={() => setShowSource(!showSource)} 
      />
      {showSource ? (
        <textarea
          className="w-full h-[300px] p-4 font-mono text-sm focus:outline-none resize-y"
          value={value}
          onChange={handleSourceChange}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
      <div className="flex justify-end px-3 py-1 text-xs text-muted-foreground border-t bg-gray-50">Word count: {wordCount}</div>
    </div>
  )
}
