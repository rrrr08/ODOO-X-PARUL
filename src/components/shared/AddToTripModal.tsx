'use client'

import { useState } from "react"

export function AddToTripModal({ isOpen, onClose, city, activity }: any) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold font-heading text-[#1E1B4B] mb-4">
          Add {city ? city.name : activity?.name} to Trip
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Trip</label>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border">
              <option>Select a trip...</option>
              <option>Europe Summer 2026</option>
              <option>Japan Backpacking</option>
            </select>
          </div>

          {activity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Stop</label>
              <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border">
                <option>Select a stop...</option>
                <option>Paris, France</option>
                <option>Rome, Italy</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 font-medium text-white bg-[#6C47FF] hover:bg-[#5A35E5] rounded-lg transition-colors shadow-sm">
            Add to Trip
          </button>
        </div>
      </div>
    </div>
  )
}
