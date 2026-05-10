'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Camera, AlertCircle } from "lucide-react"

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
  const { data: session } = useSession()

  const { register, handleSubmit } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    }
  })

  const onSubmit = (data: ProfileValues) => {
    // Mock API call
    toast.success("Profile updated successfully")
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Profile Settings" />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-200 to-[#F59E0B] flex items-center justify-center text-3xl text-white font-bold overflow-hidden shadow-inner">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  session?.user?.name?.charAt(0) || "U"
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-md text-gray-600 hover:text-[#6C47FF] border border-gray-100 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold font-heading text-[#1E1B4B]">{session?.user?.name || 'User'}</h2>
            <p className="text-gray-500 mt-1">{session?.user?.email}</p>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-100 p-6 mt-6">
            <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-red-600 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-colors w-full">
              Delete Account
            </button>
          </div>
        </div>

        <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-xl font-bold font-heading text-[#1E1B4B] mb-6 border-b border-gray-100 pb-4">Personal Information</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input {...register("firstName")} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input {...register("lastName")} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input value={session?.user?.email || ''} disabled className="w-full border-gray-200 bg-gray-50 text-gray-500 rounded-lg shadow-sm p-2.5 border cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input {...register("city")} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input {...register("country")} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea 
                {...register("bio")} 
                rows={4}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-2.5 border"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" className="bg-[#6C47FF] hover:bg-[#5A35E5] text-white px-8 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
