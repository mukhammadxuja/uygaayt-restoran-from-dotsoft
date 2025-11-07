import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const categorySchema = z.object({
  name: z.string().min(1, 'Nomi majburiy'),
  slug: z.string().min(1, 'Slug majburiy'),
  parentId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  displayOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to resize images
function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.9
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function CategoryForm({ open, onOpenChange, category = null, categories = [], onSave }) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      parentId: null,
      image: null,
      displayOrder: 0,
      isActive: true,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  });

  React.useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name || '',
        slug: category.slug || '',
        parentId: category.parentId || null,
        image: category.image || null,
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        metaKeywords: category.metaKeywords || '',
      });
      setImagePreview(category.image || null);
    } else if (!category && open) {
      form.reset();
      setImagePreview(null);
    }
  }, [category, open, form]);

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    form.setValue('name', value);
    if (!category || !category.slug) {
      form.setValue('slug', generateSlug(value));
    }
  };

  // Image upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Fayl hajmi 5MB dan katta');
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Noto\'g\'ri fayl formati');
      return;
    }

    setUploadingImage(true);

    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Resize image
      const resizedFile = await resizeImage(file, 800, 800);

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `categories/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, resizedFile);
      const downloadURL = await getDownloadURL(storageRef);

      form.setValue('image', downloadURL);
      toast.success('Rasm yuklandi');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Rasmlarni yuklashda xatolik yuz berdi');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('image', null);
  };

  // Get available parent categories (exclude current category and its children)
  const getAvailableParents = () => {
    if (!category) return categories.filter((c) => !c.parentId);
    // Exclude current category and its descendants
    const excludeIds = [category.id];
    const getDescendants = (catId) => {
      categories
        .filter((c) => c.parentId === catId)
        .forEach((c) => {
          excludeIds.push(c.id);
          getDescendants(c.id);
        });
    };
    getDescendants(category.id);
    return categories.filter((c) => !excludeIds.includes(c.id) && !c.parentId);
  };

  const handleSubmit = async (data) => {
    try {
      await onSave(data);
      toast.success(category ? 'Kategoriya yangilandi' : 'Kategoriya yaratildi');
      onOpenChange(false);
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Kategoriyani saqlashda xatolik yuz berdi');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</SheetTitle>
          <SheetDescription>
            Kategoriya ma'lumotlarini to'ldiring va saqlang
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Asosiy</TabsTrigger>
                <TabsTrigger value="image">Rasm</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Nomi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Kategoriya nomi"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="kategoriya-slug"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL uchun ishlatiladi. Masalan: /catalog/kategoriya-slug
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>Ota kategoriya</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'none' ? null : value)
                          }
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ota kategoriya tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ota kategoriya yo'q</SelectItem>
                            {getAvailableParents().map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Subkategoriya yaratish uchun ota kategoriya tanlang
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>Ko'rinish tartibi</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Kichik raqamlar birinchi ko'rinadi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Faol</FormLabel>
                        <FormDescription>
                          Kategoriya faol bo'lsa, mahsulotlar ro'yxatida ko'rinadi
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Image Tab */}
              <TabsContent value="image" className="space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Kategoriya rasmi</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {imagePreview ? (
                            <div className="relative">
                              <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeImage}
                                className="absolute top-2 right-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              {...getRootProps()}
                              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                isDragActive
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted-foreground/25 hover:border-primary/50'
                              }`}
                            >
                              <input {...getInputProps()} />
                              {uploadingImage ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  <p className="text-sm text-muted-foreground">
                                    Yuklanmoqda...
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <p className="text-sm">
                                    {isDragActive
                                      ? 'Rasmni bu yerga tashlang'
                                      : 'Rasmni bu yerga tashlang yoki bosing'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, WEBP (maks. 5MB)
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Meta sarlavha</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SEO uchun sarlavha"
                          {...field}
                          maxLength={60}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/60 belgi. Qidiruv tizimlarida ko'rinadi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Meta tavsif</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO uchun tavsif"
                          className="min-h-[100px]"
                          {...field}
                          maxLength={160}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/160 belgi. Qidiruv natijalarida ko'rinadi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Meta kalit so'zlar</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="kalit, sozlar, vergul, bilan"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vergul bilan ajratilgan kalit so'zlar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={uploadingImage}>
                {uploadingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? 'Yangilash' : 'Yaratish'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default CategoryForm;

