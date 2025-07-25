'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MdFilterList, 
  MdClear, 
  MdExpandMore, 
  MdSort,
  MdCheck
} from 'react-icons/md'
import { providers, skillCategories } from '@/lib/certificatesData'

export interface FilterState {
  providers: string[]
  skills: string[]
  difficulty: string[]
  duration: string[]
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface CertificateFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  coursesCount: number
  isOpen: boolean
  onToggle: () => void
}

const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced']
const durationOptions = [
  { label: 'Short (< 4 weeks)', value: 'short' },
  { label: 'Medium (4-8 weeks)', value: 'medium' },
  { label: 'Long (> 8 weeks)', value: 'long' }
]
const statusOptions = [
  { label: 'All Courses', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Not Completed', value: 'not_completed' }
]
const sortOptions = [
  { label: 'Trending', value: 'trending' },
  { label: 'Title', value: 'title' },
  { label: 'Rating', value: 'rating' },
  { label: 'Duration', value: 'duration' },
  { label: 'Points', value: 'points' },
  { label: 'Students', value: 'students' }
]

export default function CertificateFilters({
  filters,
  onFiltersChange,
  coursesCount,
  isOpen,
  onToggle
}: CertificateFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    providers: true,
    skills: false,
    difficulty: true,
    duration: false,
    status: true,
    sort: true
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleArrayFilter = (category: keyof FilterState, value: string) => {
    const currentArray = filters[category] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilters({ [category]: newArray })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      providers: [],
      skills: [],
      difficulty: [],
      duration: [],
      status: 'all',
      sortBy: 'trending',
      sortOrder: 'desc'
    })
  }

  const getActiveFiltersCount = () => {
    return (
      filters.providers.length +
      filters.skills.length +
      filters.difficulty.length +
      filters.duration.length +
      (filters.status !== 'all' ? 1 : 0)
    )
  }

  const FilterSection = ({ 
    title, 
    section, 
    children 
  }: { 
    title: string
    section: string
    children: React.ReactNode 
  }) => (
    <div className="border-b border-slate-700 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/50 transition-colors"
      >
        <span className="font-medium text-white">{title}</span>
        <motion.div
          animate={{ rotate: expandedSections[section] ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MdExpandMore className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const CheckboxOption = ({ 
    label, 
    checked, 
    onChange 
  }: { 
    label: string
    checked: boolean
    onChange: () => void 
  }) => (
    <label className="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 transition-colors ${
          checked 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-slate-400 hover:border-slate-300'
        }`}>
          {checked && (
            <MdCheck className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          )}
        </div>
      </div>
      <span className="text-slate-300 text-sm">{label}</span>
    </label>
  )

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggle}
          className="w-full flex items-center justify-between bg-slate-800 rounded-xl p-4 border border-slate-700"
        >
          <div className="flex items-center gap-3">
            <MdFilterList className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <span className="text-slate-400 text-sm">{coursesCount} courses</span>
        </motion.button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed lg:relative top-0 left-0 z-50 lg:z-0 w-80 lg:w-full h-full lg:h-auto bg-slate-800 lg:bg-transparent border-r lg:border-r-0 border-slate-700 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 lg:hidden">
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <MdClear className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="lg:bg-slate-800 lg:rounded-xl lg:border lg:border-slate-700">
              {/* Filter Header */}
              <div className="hidden lg:flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                <div className="flex items-center gap-2">
                  {getActiveFiltersCount() > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <span className="text-slate-400 text-sm">{coursesCount} courses</span>
                </div>
              </div>

              {/* Provider Filter */}
              <FilterSection title="Provider" section="providers">
                <div className="grid grid-cols-1 gap-1">
                  {providers.map(provider => (
                    <CheckboxOption
                      key={provider}
                      label={provider}
                      checked={filters.providers.includes(provider)}
                      onChange={() => toggleArrayFilter('providers', provider)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Skills Filter */}
              <FilterSection title="Skills" section="skills">
                <div className="grid grid-cols-1 gap-1">
                  {skillCategories.map(skill => (
                    <CheckboxOption
                      key={skill}
                      label={skill}
                      checked={filters.skills.includes(skill)}
                      onChange={() => toggleArrayFilter('skills', skill)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Difficulty Filter */}
              <FilterSection title="Difficulty" section="difficulty">
                <div className="grid grid-cols-1 gap-1">
                  {difficultyOptions.map(difficulty => (
                    <CheckboxOption
                      key={difficulty}
                      label={difficulty}
                      checked={filters.difficulty.includes(difficulty)}
                      onChange={() => toggleArrayFilter('difficulty', difficulty)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Duration Filter */}
              <FilterSection title="Duration" section="duration">
                <div className="grid grid-cols-1 gap-1">
                  {durationOptions.map(option => (
                    <CheckboxOption
                      key={option.value}
                      label={option.label}
                      checked={filters.duration.includes(option.value)}
                      onChange={() => toggleArrayFilter('duration', option.value)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Status Filter */}
              <FilterSection title="Completion Status" section="status">
                <div className="grid grid-cols-1 gap-1">
                  {statusOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={filters.status === option.value}
                        onChange={() => updateFilters({ status: option.value })}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-slate-300 text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Sort Options */}
              <FilterSection title="Sort By" section="sort">
                <div className="space-y-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateFilters({ sortOrder: 'asc' })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.sortOrder === 'asc'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Ascending
                    </button>
                    <button
                      onClick={() => updateFilters({ sortOrder: 'desc' })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.sortOrder === 'desc'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Descending
                    </button>
                  </div>
                </div>
              </FilterSection>

              {/* Clear All Button (Mobile) */}
              {getActiveFiltersCount() > 0 && (
                <div className="p-4 lg:hidden">
                  <button
                    onClick={clearAllFilters}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
} 