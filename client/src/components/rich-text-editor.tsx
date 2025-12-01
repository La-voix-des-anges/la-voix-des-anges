import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Code,
  Undo2,
  Redo2,
  ImageIcon,
} from "lucide-react";
import "./rich-text-editor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleAddImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setImageDialogOpen(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
        setImageDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive("bold")}
            data-testid="button-bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive("italic")}
            data-testid="button-italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            data-active={editor.isActive("heading", { level: 2 })}
            data-testid="button-heading2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            data-active={editor.isActive("heading", { level: 3 })}
            data-testid="button-heading3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive("bulletList")}
            data-testid="button-bullet-list"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive("orderedList")}
            data-testid="button-ordered-list"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleCode().run()}
            data-active={editor.isActive("code")}
            data-testid="button-code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setImageDialogOpen(true)}
            data-testid="button-image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().undo().run()}
            data-testid="button-undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().redo().run()}
            data-testid="button-redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <EditorContent
          editor={editor}
          className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
        />
      </div>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent data-testid="dialog-image-upload">
          <DialogHeader>
            <DialogTitle>Insérer une image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                URL de l'image
              </label>
              <Input
                placeholder="https://exemple.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-image-url"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Charger une image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
                data-testid="input-file-upload"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageDialogOpen(false)}
              data-testid="button-cancel"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleAddImage}
              disabled={!imageUrl}
              data-testid="button-insert-image"
            >
              Insérer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
