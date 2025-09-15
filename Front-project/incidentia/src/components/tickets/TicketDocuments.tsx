"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { FileText, ImageIcon, Download, Plus } from "lucide-react"

interface Document {
  id: string
  name: string
  type: "document" | "image"
  size: string
  uploadedBy: string
  uploadedAt: string
  url: string
}

interface TicketDocumentsProps {
  documents: Document[]
}

export function TicketDocuments({ documents }: TicketDocumentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos e Imágenes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {doc.type === "document" ? (
                  <FileText className="h-8 w-8 text-blue-500" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-green-500" />
                )}
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.size} • Subido por {doc.uploadedBy} • {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Subir Archivo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
