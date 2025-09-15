import type { ReactNode } from "react"

interface DashboardProps {
  children: ReactNode
}

export default function Dashboard({ children }: DashboardProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Panel Principal</h1>
      {children}
    </div>
  )
}
