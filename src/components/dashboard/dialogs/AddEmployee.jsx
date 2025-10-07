import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from '@/context/AppContext';

export default function AddEmployee({ open, onOpenChange, onSubmit }) {
  const { addEmployee } = useAppContext();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      position: '',
      type: '',
    },
  });

  const onFormSubmit = async (data) => {
    try {
      await addEmployee(data);
      reset();
      onOpenChange(false);
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const positions = [
    { value: 'video_operator', label: 'Video operator' },
    { value: 'photograph', label: 'Fotograf' },
    { value: 'editor', label: 'Editor' },
  ];

  const types = [
    { value: 'studio', label: 'Studio ishchi' },
    { value: 'freelance', label: 'Yollanma ishchi' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yangi xodim qo'shish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ism</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Ism majburiy',
              })}
              placeholder="Xodim ismini kiriting"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone', {
                required: 'Telefon raqami majburiy',
                pattern: {
                  value: /^\+998[0-9]{9}$/,
                  message: "Telefon raqami noto'g'ri formatda",
                },
              })}
              placeholder="+998 90 123 45 67"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Vazifa</Label>
            <Controller
              name="position"
              control={control}
              rules={{ required: 'Vazifa tanlash majburiy' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vazifani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Ishchi turi</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Ishchi turi tanlash majburiy' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ishchi turini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Bekor qilish
            </Button>
            <Button type="submit">Xodimni qo'shish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

