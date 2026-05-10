'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Camera, AlertCircle, Globe, Clock, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { SkeletonCard } from "@/components/shared/SkeletonCard"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function Profile() {
  const { data: session, update: updateSession } = useSession()
  const queryClient = useQueryClient()
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

  // 1. Fetch User Profile
  const { data: user, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get('/api/user/profile')
      return res.data
    }
  })

  // 2. Fetch User Trips for Templates/History
  const { data: trips, isLoading: loadingTrips } = useQuery({
    queryKey: ['trips', { includeTemplates: true }],
    queryFn: async () => {
      const res = await axios.get('/api/trips?includeTemplates=true')
      return res.data
    }
  })

  const { register, handleSubmit, reset } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  })

  // Sync form with fetched user data
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || '',
      })
    }
  }, [user, reset])

  const profileMutation = useMutation({
    mutationFn: (data: ProfileValues) => axios.patch('/api/user/profile', data),
    onSuccess: () => {
      toast.success("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      updateSession()
    },
    onError: () => toast.error("Failed to update profile")
  })

  const updatePhotoMutation = useMutation({
    mutationFn: (image: string) => axios.patch('/api/user/profile', { image }),
    onSuccess: () => {
      toast.success("Photo updated")
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      updateSession()
    }
  })

  const templates = trips?.filter((t: any) => t.isTemplate) || []
  const history = trips?.filter((t: any) => !t.isTemplate && new Date(t.endDate) < new Date()) || []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large (max 2MB)")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        updatePhotoMutation.mutate(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoChange = () => {
    document.getElementById('profile-upload')?.click()
  }

  const onSubmit = (data: ProfileValues) => {
    profileMutation.mutate(data)
  }

  if (loadingProfile) return <SkeletonCard height="h-[600px]" lines={8} />

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Profile Settings" />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
            <div className="relative mb-6 group">
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-200 to-[#6C47FF] flex items-center justify-center text-3xl text-white font-bold overflow-hidden shadow-inner border-4 border-white">
                {user?.image ? (
                  <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"
                )}
              </div>
              <button 
                onClick={handlePhotoChange}
                className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-lg text-gray-600 hover:text-[#6C47FF] border border-gray-100 transition-all hover:scale-110 active:scale-95"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-black font-heading text-[#1E1B4B]">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{user?.email}</p>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-100 p-6 mt-6">
            <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2 uppercase tracking-tighter">
              <AlertCircle className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-red-600/70 text-xs mb-4 font-medium italic">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="bg-white border border-red-200 text-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all w-full text-sm">
              Delete Account
            </button>
          </div>
        </div>

        <div className="lg:w-2/3 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-sm font-black text-[#1E1B4B] uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Personal Information</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                <input {...register("firstName")} className="w-full border-gray-100 bg-gray-50 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] focus:bg-white p-3 border font-bold transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                <input {...register("lastName")} className="w-full border-gray-100 bg-gray-50 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] focus:bg-white p-3 border font-bold transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input value={user?.email || ''} disabled className="w-full border-gray-100 bg-gray-100 text-gray-400 rounded-xl shadow-sm p-3 border cursor-not-allowed font-bold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                <input {...register("city")} className="w-full border-gray-100 bg-gray-50 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] focus:bg-white p-3 border font-bold transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Country</label>
                <input {...register("country")} className="w-full border-gray-100 bg-gray-50 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] focus:bg-white p-3 border font-bold transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Language Preference</label>
              <select className="w-full border-gray-100 bg-gray-50 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] focus:bg-white p-3 border font-bold transition-all outline-none">
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bio</label>
              <textarea 
                {...register("bio")} 
                rows={4}
                className="w-full border-gray-100 bg-gray-50 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] focus:bg-white p-3 border font-bold transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={profileMutation.isPending}
                className="bg-[#6C47FF] hover:bg-[#5A35E5] text-white px-10 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-[#6C47FF]/20 active:scale-95 disabled:opacity-50"
              >
                {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Trips Section for Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preplanned / Templates */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#6C47FF]">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-[#1E1B4B] font-heading">Preplanned Templates</h3>
          </div>
          <div className="space-y-4">
            {templates.length > 0 ? (
              templates.map((t: any) => (
                <Link href={`/trips/${t.id}`} key={t.id} className="block bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#6C47FF] transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#1E1B4B]">{t.title}</h4>
                      <p className="text-xs text-gray-400">{t.stops?.length || 0} stops planned</p>
                    </div>
                    <div className="px-3 py-1 bg-indigo-50 text-[#6C47FF] text-[10px] font-black rounded-lg uppercase">Template</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400 font-medium">You haven&apos;t planned any trips yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Previous Trips */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-[#1E1B4B] font-heading">Previous History</h3>
          </div>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((t: any) => (
                <Link href={`/trips/${t.id}`} key={t.id} className="block bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#1E1B4B]">{t.title}</h4>
                      <p className="text-xs text-gray-400">{format(new Date(t.endDate), 'MMM yyyy')}</p>
                    </div>
                    <div className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg uppercase">Completed</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400 font-medium">No past trips found.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
