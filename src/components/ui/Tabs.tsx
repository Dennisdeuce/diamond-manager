import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-cream-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 -mb-px',
            activeTab === tab.id
              ? 'border-b-2 border-accent-red text-accent-red font-semibold'
              : 'border-b-2 border-transparent text-navy-300 hover:text-navy-500'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
