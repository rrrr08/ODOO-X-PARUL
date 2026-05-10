'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CalendarIcon, MapPin } from "lucide-react"

const tripSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  startDate: z.string().min(1, "Start date is required").refine((val) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(val) >= today
  }, { message: "Start date cannot be in the past" }),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
  totalBudget: z.coerce.number().optional(),
  isPublic: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  coverUrl: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate)
  }
  return true
}, {
  message: "End date must be after start date",
  path: ["endDate"]
})

type TripFormValues = z.infer<typeof tripSchema>

export default function CreateTrip() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      isPublic: false
    }
  })

  const { data: suggestions } = useQuery({
    queryKey: ['citySuggestions'],
    queryFn: async () => {
      const res = await axios.get('/api/search/cities?top=true&limit=6')
      return res.data
    }
  })

  const queryClient = useQueryClient()
  const createTripMutation = useMutation({
    mutationFn: async (data: TripFormValues) => {
      const res = await axios.post('/api/trips', data)
      return res.data
    },
    onSuccess: (data) => {
      toast.success("Trip created!")
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      router.push(`/trips/${data.id}`)
    },
    onError: () => {
      toast.error("Failed to create trip. Please try again.")
      setIsSubmitting(false)
    }
  })

  const onSubmit = (data: TripFormValues) => {
    setIsSubmitting(true)
    createTripMutation.mutate(data)
  }

  const handleSuggestionClick = (cityName: string) => {
    const currentTitle = watch("title")
    if (!currentTitle) {
      setValue("title", `Trip to ${cityName}`, { shouldValidate: true })
    }
  }

  const tags = ["Beach", "Mountains", "Temples", "Food Tour", "Safari", "City Break", "Road Trip", "Skiing"]
  
  const handleTagClick = (tag: string) => {
    const currentDesc = watch("description") || ""
    const newDesc = currentDesc ? `${currentDesc} #${tag.replace(' ', '')}` : `#${tag.replace(' ', '')}`
    setValue("description", newDesc)
  }

  return (
    <div>
      <PageHeader title="Plan a New Trip" backHref="/trips" />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form */}
        <div className="lg:w-2/3 bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title *</label>
              <input 
                {...register("title")} 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border"
                placeholder="e.g. Europe Summer 2026"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="date"
                    {...register("startDate")} 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border"
                  />
                </div>
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="date"
                    {...register("endDate")} 
                    min={watch("startDate") || new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border"
                  />
                </div>
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                {...register("description")} 
                rows={3}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border"
                placeholder="What's this trip about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo (Optional)</label>
              <div className="space-y-4">
                <div className={`relative h-48 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-gray-50 ${watch("coverUrl") ? 'border-[#6C47FF] bg-indigo-50/10' : 'border-gray-200 hover:border-gray-300'}`}>
                  {watch("coverUrl") ? (
                    <>
                      <img src={watch("coverUrl")} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => setValue("coverUrl", "")}
                          className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transform hover:scale-105 transition-transform"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-600">Enter an image URL to set cover</p>
                      <p className="text-xs text-gray-400 mt-1">Make your trip stand out with a beautiful photo</p>
                    </div>
                  )}
                </div>
                <input 
                  type="text"
                  {...register("coverUrl")} 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border text-sm"
                  placeholder="Paste image URL here... (e.g. https://images.unsplash.com/...)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input 
                  type="number"
                  {...register("totalBudget")} 
                  className="w-full pl-8 border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border"
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">Make Public</h4>
                  <p className="text-sm text-gray-500">Allow others to view this trip in Community</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register("isPublic")} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6C47FF]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6C47FF]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <div>
                  <h4 className="font-medium text-[#6C47FF]">Save as Template</h4>
                  <p className="text-sm text-indigo-400">Mark as a preplanned trip for your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register("isTemplate")} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6C47FF]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6C47FF]"></div>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#6C47FF] hover:bg-[#5A35E5] text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Trip →"
              )}
            </button>
          </form>
        </div>

        {/* Right Column - Suggestions */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-[#F8FAFC] p-6 rounded-xl border border-gray-100">
            <h3 className="font-bold text-[#1E1B4B] font-heading mb-4">Popular Destinations to Inspire You</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
              {suggestions ? suggestions.map((city: any) => (
                <div 
                  key={city.id}
                  onClick={() => handleSuggestionClick(city.name)}
                  className="relative h-24 rounded-lg overflow-hidden cursor-pointer group shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-purple-400">
                    {city.imageUrl && <img src={city.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={city.name} />}
                  </div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <p className="font-bold text-sm leading-tight">{city.name}</p>
                    <p className="text-[10px] flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{city.country}</p>
                  </div>
                </div>
              )) : (
                Array.from({length: 4}).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />)
              )}
            </div>

            <h3 className="font-bold text-[#1E1B4B] font-heading mb-3 text-sm">Trending Activities</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="bg-white border border-gray-200 hover:border-[#6C47FF] hover:text-[#6C47FF] text-gray-600 text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
