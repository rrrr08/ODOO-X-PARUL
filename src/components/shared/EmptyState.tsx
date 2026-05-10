import Link from "next/link"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
      {icon && <div className="text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-bold text-[#1E1B4B] font-heading">{title}</h3>
      {description && <p className="text-gray-500 mt-2 max-w-sm">{description}</p>}
      
      {action && action.href && (
        <Link 
          href={action.href} 
          className="mt-6 bg-[#6C47FF] hover:bg-[#5A35E5] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          {action.label}
        </Link>
      )}
      {action && action.onClick && (
        <button 
          onClick={action.onClick}
          className="mt-6 bg-[#6C47FF] hover:bg-[#5A35E5] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
