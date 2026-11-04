import type { ReactNode } from 'react'

export default function EmptyState({ icon, children, action }: { icon: ReactNode; children: ReactNode; action?: ReactNode }) {
  return <div className="workbench-empty">{icon}<p>{children}</p>{action}</div>
}
