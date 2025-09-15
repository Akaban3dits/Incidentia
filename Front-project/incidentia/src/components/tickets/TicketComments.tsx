"use client"

import { useState, type SetStateAction } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { MessageSquare } from "lucide-react"

interface Comment {
  id: string
  author: {
    name: string
    avatar?: string
  }
  content: string
  timestamp: string
  isInternal: boolean
}

interface TicketCommentsProps {
  comments: Comment[]
  onCommentsChange: (comments: Comment[]) => void
}


export function TicketComments({ comments, onCommentsChange }: TicketCommentsProps) {
  const [newComment, setNewComment] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          name: "Usuario Actual",
          avatar: "/placeholder.svg",
        },
        content: newComment,
        timestamp: new Date().toISOString(),
        isInternal: false,
      }
      onCommentsChange([...comments, comment])
      setNewComment("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {comment.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-sm">{comment.author.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
                  {comment.isInternal && (
                    <Badge variant="secondary" className="text-xs">
                      Interno
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2">
          <Textarea
            placeholder="Escribir un comentario..."
            value={newComment}
            onChange={(e: { target: { value: SetStateAction<string> } }) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Agregar Comentario
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
