'use client'

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useState } from 'react'

interface CalendarViewProps {
  trip: any
}

export function CalendarView({ trip }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(trip.startDate))
  
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  })

  const activities = trip.stops?.flatMap((s: any) => s.activities) || []

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="text-xl font-black text-[#1E1B4B] font-heading">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl border border-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl border border-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayActivities = activities.filter(a => a.scheduledAt && isSameDay(new Date(a.scheduledAt), day))
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isTripDay = day >= new Date(trip.startDate) && day <= new Date(trip.endDate)

          return (
            <div 
              key={i} 
              className={`min-h-[120px] p-2 border-b border-r border-gray-50 transition-colors ${!isCurrentMonth ? 'bg-gray-50/30' : ''} ${isTripDay ? 'bg-indigo-50/10' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold ${!isCurrentMonth ? 'text-gray-300' : isTripDay ? 'text-[#6C47FF]' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </span>
                {isTripDay && !dayActivities.length && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                )}
              </div>
              
              <div className="space-y-1">
                {dayActivities.slice(0, 3).map(act => (
                  <div key={act.id} className="p-1 rounded bg-white border border-indigo-100 text-[9px] font-bold text-[#1E1B4B] truncate shadow-sm">
                    {act.name}
                  </div>
                ))}
                {dayActivities.length > 3 && (
                  <div className="text-[8px] font-black text-[#6C47FF] text-center uppercase tracking-tighter">
                    +{dayActivities.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
