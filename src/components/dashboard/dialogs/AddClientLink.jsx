import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';

export default function AddClientLink({ open, onOpenChange, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      link: '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yangi link qo'shish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Link nomi</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Link nomi majburiy',
              })}
              placeholder="Link nomini kiriting"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link URL</Label>
            <Input
              id="link"
              type="url"
              {...register('link', {
                required: 'Link URL majburiy',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "To'g'ri URL formatini kiriting (https://...)",
                },
              })}
              placeholder="https://example.com"
            />
            {errors.link && (
              <p className="text-sm text-red-500">{errors.link.message}</p>
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
            <Button type="submit">Linkni qo'shish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

