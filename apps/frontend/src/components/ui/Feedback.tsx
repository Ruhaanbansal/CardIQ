import * as React from "react"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Cards"
import { Button } from "./Button"

export function EmptyState({ title, description, action, icon: Icon = Info }: { title: string, description: string, action?: React.ReactNode, icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4 text-muted-foreground">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string, message: string, onRetry?: () => void }) {
  return (
    <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-destructive flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-destructive/80 mb-4">{message}</CardDescription>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="border-destructive/30 hover:bg-destructive/10 text-destructive">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
