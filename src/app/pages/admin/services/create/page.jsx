'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Plus, Trash2, Upload, Calendar, DollarSign, Clock, Layers } from 'lucide-react';

const AdminServiceCreate = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [plans, setPlans] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      long_description: '',
      media: null,
      cost_discount: []
    }
  });

  const daysOfWeek = [
    { value: 'MON', label: 'Monday' },
    { value: 'TUE', label: 'Tuesday' },
    { value: 'WED', label: 'Wednesday' },
    { value: 'THU', label: 'Thursday' },
    { value: 'FRI', label: 'Friday' },
    { value: 'SAT', label: 'Saturday' },
    { value: 'SUN', label: 'Sunday' }
  ];

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  const addAvailabilitySlot = () => {
    setAvailabilitySlots([
      ...availabilitySlots,
      { day_of_week: 'MON', start_time: '09:00', end_time: '17:00', id: Date.now() }
    ]);
  };

  const updateAvailabilitySlot = (index, field, value) => {
    const updatedSlots = [...availabilitySlots];
    updatedSlots[index][field] = value;
    setAvailabilitySlots(updatedSlots);
  };

  const removeAvailabilitySlot = (index) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const addPlan = () => {
    setPlans([
      ...plans,
      { plan: '', cost: '', discount: '', description: '', id: Date.now() }
    ]);
  };

  const updatePlan = (index, field, value) => {
    const updatedPlans = [...plans];
    updatedPlans[index][field] = value;
    setPlans(updatedPlans);
    
    setValue('cost_discount', updatedPlans.map(plan => ({
      plan: plan.plan,
      cost: parseFloat(plan.cost) || 0,
      discount: parseFloat(plan.discount) || 0,
      description: plan.description
    })));
  };

  const removePlan = (index) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    setPlans(updatedPlans);
    setValue('cost_discount', updatedPlans.map(plan => ({
      plan: plan.plan,
      cost: parseFloat(plan.cost) || 0,
      discount: parseFloat(plan.discount) || 0,
      description: plan.description
    })));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('media', file);
    }
  };

  const onSubmit = async (data) => {
    if (plans.length === 0) {
      toast.error('Please add at least one plan');
      return;
    }

    if (availabilitySlots.length === 0) {
      toast.error('Please add at least one availability slot');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('long_description', data.long_description || '');
      
      if (data.media) {
        formData.append('media', data.media);
      }

      formData.append('cost_discount', JSON.stringify(data.cost_discount));
      formData.append('availability_slots', JSON.stringify(availabilitySlots.map(slot => ({
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time
      }))));

      await api.post('/services/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Service created successfully!');
      router.push('/pages/admin/services');

    } catch (error) {
      console.error('Error creating service:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create service';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background relative p-6 pt-32 pb-20">
       {/* Ambient Background */}
       <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />
       <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

       <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
             initial={{ opacity: 0, x: -20 }} 
             animate={{ opacity: 1, x: 0 }}
             className="mb-8"
          >
             <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Services
             </Button>
             <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Create New Service</h1>
             <p className="text-gray-500 dark:text-muted-foreground mt-2 text-lg">Define your service details, pricing plans, and availability.</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Basic Info */}
            <SpotlightCard className="p-8 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none" spotlightColor="rgba(255,255,255,0.05)">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                     <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
               </div>

               <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Service Name *</Label>
                        <Input 
                           id="name" 
                           {...register('name', { required: 'Required' })} 
                           className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-blue-500/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                           placeholder="e.g. Graphic Design"
                        />
                        {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="media" className="text-gray-700 dark:text-gray-300">Service Image</Label>
                        <div className="relative group cursor-pointer">
                           <Input 
                              id="media" 
                              type="file" 
                              onChange={handleFileChange} 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                           />
                           <div className="h-10 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md flex items-center px-3 text-sm text-gray-500 dark:text-gray-400 group-hover:border-gray-300 dark:group-hover:border-white/20 transition-colors">
                              <Upload className="mr-2 h-4 w-4" />
                              <span className="truncate text-gray-900 dark:text-white">
                                {watch('media') ? watch('media').name : "Upload Image..."}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Short Description *</Label>
                     <Textarea 
                        id="description" 
                        {...register('description', { required: 'Required' })} 
                        className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-blue-500/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                        rows={3}
                        placeholder="A brief summary of what you offer..."
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="long_description" className="text-gray-700 dark:text-gray-300">Detailed Description</Label>
                     <Textarea 
                        id="long_description" 
                        {...register('long_description')} 
                        className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-blue-500/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 min-h-[150px]"
                        placeholder="Full details, deliverables, and benefits..."
                     />
                  </div>
               </div>
            </SpotlightCard>

            {/* Pricing Plans */}
            <SpotlightCard className="p-8 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none" spotlightColor="rgba(255,255,255,0.05)">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing Plans</h2>
                  </div>
                  <Button type="button" onClick={addPlan} size="sm" className="bg-emerald-600/10 text-emerald-600 dark:bg-emerald-600/20 dark:text-emerald-400 hover:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-500/20 dark:border-emerald-500/30">
                     <Plus className="w-4 h-4 mr-2" /> Add Plan
                  </Button>
               </div>

               <div className="space-y-4">
                  <AnimatePresence>
                     {plans.map((plan, index) => (
                        <motion.div 
                           key={plan.id}
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           exit={{ opacity: 0, height: 0 }}
                           className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 relative group"
                        >
                           <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="absolute top-2 right-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePlan(index)}
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>

                           <div className="grid md:grid-cols-4 gap-4 mb-3">
                              <div className="md:col-span-2 space-y-2">
                                 <Label className="text-xs text-gray-500 dark:text-muted-foreground">Plan Name</Label>
                                 <Input 
                                    value={plan.plan} 
                                    onChange={(e) => updatePlan(index, 'plan', e.target.value)} 
                                    className="h-9 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                    placeholder="e.g. Standard"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <Label className="text-xs text-gray-500 dark:text-muted-foreground">Cost ($)</Label>
                                 <Input 
                                    type="number"
                                    value={plan.cost} 
                                    onChange={(e) => updatePlan(index, 'cost', e.target.value)} 
                                    className="h-9 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                    placeholder="0.00"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <Label className="text-xs text-gray-500 dark:text-muted-foreground">Discount ($)</Label>
                                 <Input 
                                    type="number"
                                    value={plan.discount} 
                                    onChange={(e) => updatePlan(index, 'discount', e.target.value)} 
                                    className="h-9 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                    placeholder="0.00"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs text-gray-500 dark:text-muted-foreground">Description</Label>
                              <Input 
                                 value={plan.description} 
                                 onChange={(e) => updatePlan(index, 'description', e.target.value)} 
                                 className="h-9 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                 placeholder="Plan details..."
                              />
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
                   {plans.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-muted-foreground text-sm border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5">
                         No pricing plans added. Add at least one plan.
                      </div>
                   )}
               </div>
            </SpotlightCard>

             {/* Availability */}
             <SpotlightCard className="p-8 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none" spotlightColor="rgba(255,255,255,0.05)">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                         <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Availability</h2>
                   </div>
                   <Button type="button" onClick={addAvailabilitySlot} size="sm" className="bg-orange-600/10 text-orange-600 dark:bg-orange-600/20 dark:text-orange-400 hover:bg-orange-600/20 dark:hover:bg-orange-600/30 border border-orange-500/20 dark:border-orange-500/30">
                      <Plus className="w-4 h-4 mr-2" /> Add Slot
                   </Button>
                </div>

               <div className="space-y-3">
                  <AnimatePresence>
                     {availabilitySlots.map((slot, index) => (
                        <motion.div 
                           key={slot.id}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col md:flex-row items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5"
                        >
                           <Select value={slot.day_of_week} onValueChange={(v) => updateAvailabilitySlot(index, 'day_of_week', v)}>
                              <SelectTrigger className="w-full md:w-[150px] bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 h-9 text-gray-900 dark:text-white">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                                 {daysOfWeek.map(d => <SelectItem key={d.value} value={d.value} className="focus:bg-gray-100 dark:focus:bg-white/10">{d.label}</SelectItem>)}
                              </SelectContent>
                           </Select>

                            <div className="flex items-center gap-2 flex-1 w-full">
                               <Select value={slot.start_time} onValueChange={(v) => updateAvailabilitySlot(index, 'start_time', v)}>
                                  <SelectTrigger className="flex-1 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 h-9 text-gray-900 dark:text-white">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 h-[200px] text-gray-900 dark:text-white">
                                     {timeOptions.map(t => <SelectItem key={t} value={t} className="focus:bg-gray-100 dark:focus:bg-white/10">{t}</SelectItem>)}
                                  </SelectContent>
                               </Select>
                               <span className="text-gray-500 dark:text-muted-foreground">-</span>
                               <Select value={slot.end_time} onValueChange={(v) => updateAvailabilitySlot(index, 'end_time', v)}>
                                  <SelectTrigger className="flex-1 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 h-9 text-gray-900 dark:text-white">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 h-[200px] text-gray-900 dark:text-white">
                                     {timeOptions.map(t => <SelectItem key={t} value={t} className="focus:bg-gray-100 dark:focus:bg-white/10">{t}</SelectItem>)}
                                  </SelectContent>
                               </Select>
                            </div>

                           <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-red-400"
                              onClick={() => removeAvailabilitySlot(index)}
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </motion.div>
                     ))}
                  </AnimatePresence>
                   {availabilitySlots.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-muted-foreground text-sm border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5">
                         No availability slots defined.
                      </div>
                   )}
               </div>
            </SpotlightCard>

             <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" className="border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-900 dark:text-white" onClick={() => router.back()}>Cancel</Button>
               <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 px-8">
                  {loading ? (
                     <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> creating...</span>
                  ) : "Create Service"}
               </Button>
            </div>

          </form>
       </div>
    </div>
  );
};

export default AdminServiceCreate;