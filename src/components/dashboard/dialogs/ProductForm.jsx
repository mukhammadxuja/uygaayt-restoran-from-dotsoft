import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatNumber } from '@/lib/utils';

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Nomi majburiy'),
  sku: z.string().optional(),
  category: z.string().min(1, 'Kategoriya majburiy'),
  price: z.number().min(0, 'Narx 0 dan katta bo\'lishi kerak'),
  oldPrice: z.number().min(0).optional().nullable(),
  stockQty: z.number().min(0).optional().nullable(),
  unlimitedStock: z.boolean().default(false),
  availabilityStatus: z.enum(['active', 'hidden', 'out_of_stock']),
  description: z.string().optional(),
  preparationTime: z.number().min(0).optional().nullable(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, 'Kamida bitta rasm kerak'),
  variants: z.array(
    z.object({
      id: z.string(),
      attributes: z.record(z.string()),
      price: z.number().min(0),
      stock: z.number().min(0).optional().nullable(),
      unlimitedStock: z.boolean().default(false),
    })
  ).default([]),
  addOns: z.array(z.string()).default([]),
  visibilitySchedule: z.object({
    type: z.enum(['always', 'date_range', 'recurring']).default('always'),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    recurringHours: z.array(
      z.object({
        day: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
      })
    ).default([]),
  }).optional(),
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const categories = ['Ovqat', 'Ichimlik', 'Salat', 'Desert', 'Fast Food'];
const availabilityStatuses = [
  { value: 'active', label: 'Faol' },
  { value: 'hidden', label: 'Yashirilgan' },
  { value: 'out_of_stock', label: 'Tugagan' },
];

// Mock add-ons data - in real app, this would come from API
const availableAddOns = [
  { id: 'extra-cheese', name: 'Qo\'shimcha pishloq' },
  { id: 'extra-sauce', name: 'Qo\'shimcha sous' },
  { id: 'spicy', name: 'Achchiq' },
  { id: 'no-onion', name: 'Piyozsiz' },
  { id: 'no-garlic', name: 'Sarimsogsiz' },
];

const variantAttributes = {
  size: ['Kichik', 'O\'rta', 'Katta'],
  spiceLevel: ['Yengil', 'O\'rtacha', 'Achchiq', 'Juda achchiq'],
};

function ProductForm({ open, onOpenChange, product = null, onSave }) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      price: 0,
      oldPrice: null,
      stockQty: null,
      unlimitedStock: false,
      availabilityStatus: 'active',
      description: '',
      preparationTime: null,
      tags: [],
      images: [],
      variants: [],
      addOns: [],
      visibilitySchedule: {
        type: 'always',
        startDate: null,
        endDate: null,
        recurringHours: [],
      },
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  // Load product data when editing
  useEffect(() => {
    if (product && open) {
      form.reset({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        price: product.price || 0,
        oldPrice: product.oldPrice || null,
        stockQty: product.stockQty || null,
        unlimitedStock: product.unlimitedStock || false,
        availabilityStatus: product.availabilityStatus || 'active',
        description: product.description || '',
        preparationTime: product.preparationTime || null,
        tags: product.tags || [],
        images: product.images || [],
        variants: product.variants || [],
        addOns: product.addOns || [],
        visibilitySchedule: product.visibilitySchedule || {
          type: 'always',
          startDate: null,
          endDate: null,
          recurringHours: [],
        },
      });
      setImagePreviews(product.images || []);
    } else if (!product && open) {
      form.reset();
      setImagePreviews([]);
    }
  }, [product, open, form]);

  // Image upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const files = acceptedFiles.filter((file) => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} - fayl hajmi 5MB dan katta`);
        return false;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} - noto'g'ri fayl formati`);
        return false;
      }
      return true;
    });

    if (files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Create preview
        const preview = URL.createObjectURL(file);

        // Resize image if needed (client-side resize)
        const resizedFile = await resizeImage(file, 1200, 1200);

        // Upload to Firebase Storage
        const timestamp = Date.now();
        const fileName = `products/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, resizedFile);
        const downloadURL = await getDownloadURL(storageRef);

        return { preview, url: downloadURL };
      });

      const results = await Promise.all(uploadPromises);
      const newImages = results.map((r) => r.url);
      const newPreviews = results.map((r) => r.preview);

      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, ...newImages]);
      setImagePreviews([...imagePreviews, ...newPreviews]);

      toast.success(`${files.length} ta rasm yuklandi`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Rasmlarni yuklashda xatolik yuz berdi');
    } finally {
      setUploadingImages(false);
    }
  }, [form, imagePreviews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: true,
  });

  // Remove image
  const removeImage = (index) => {
    const currentImages = form.getValues('images') || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    form.setValue('images', newImages);
    setImagePreviews(newPreviews);
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues('tags') || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue('tags', [...currentTags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter((tag) => tag !== tagToRemove));
  };

  // Add variant
  const addVariant = () => {
    appendVariant({
      id: `variant_${Date.now()}`,
      attributes: {},
      price: form.getValues('price') || 0,
      stock: null,
      unlimitedStock: false,
    });
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await onSave(data);
      toast.success(product ? 'Mahsulot yangilandi' : 'Mahsulot yaratildi');
      onOpenChange(false);
      form.reset();
      setImagePreviews([]);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Mahsulotni saqlashda xatolik yuz berdi');
    }
  };

  const formValues = form.watch();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</SheetTitle>
          <SheetDescription>
            Mahsulot ma'lumotlarini to'ldiring va saqlang
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Asosiy</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="variants">Variantlar</TabsTrigger>
                <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
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
                        <Input placeholder="Mahsulot nomi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="SKU-000001" {...field} />
                        </FormControl>
                        <FormDescription>Ixtiyoriy, noyob kod</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Kategoriya</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategoriya tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Narx</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="oldPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>Eski narx</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormDescription>Chegirma narxi</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>Tayyorlash vaqti (min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stockQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel optional>Ombordagi miqdor</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="0"
                              disabled={form.watch('unlimitedStock')}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                              }
                            />
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={form.watch('unlimitedStock')}
                                onCheckedChange={(checked) => {
                                  form.setValue('unlimitedStock', checked);
                                  if (checked) {
                                    form.setValue('stockQty', null);
                                  }
                                }}
                              />
                              <Label className="text-sm">Cheksiz</Label>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availabilityStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Holat</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availabilityStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Tavsif</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mahsulot haqida batafsil ma'lumot..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Markdown formatida yozishingiz mumkin</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Teglar</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Teg qo'shish"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag();
                                }
                              }}
                            />
                            <Button type="button" onClick={addTag} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {field.value && field.value.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((tag, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-4">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Rasmlar</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                              isDragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50'
                            }`}
                          >
                            <input {...getInputProps()} />
                            {uploadingImages ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm">
                                  {isDragActive
                                    ? 'Rasmlarni bu yerga tashlang'
                                    : 'Rasmlarni bu yerga tashlang yoki bosing'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, WEBP (maks. 5MB)
                                </p>
                              </div>
                            )}
                          </div>

                          {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                              {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                  <div className="aspect-square rounded-lg overflow-hidden border">
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  {index === 0 && (
                                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                      Asosiy
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Variants Tab */}
              <TabsContent value="variants" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Variantlar</h3>
                    <p className="text-sm text-muted-foreground">
                      Mahsulot variantlarini qo'shing (masalan: o'lcham, achchiqlik)
                    </p>
                  </div>
                  <Button type="button" onClick={addVariant} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Variant qo'shish
                  </Button>
                </div>

                {variantFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Hozircha variantlar yo'q
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variantFields.map((variant, variantIndex) => (
                      <Card key={variant.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Variant {variantIndex + 1}
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(variantIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Attribute selection */}
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(variantAttributes).map(([attrName, options]) => (
                              <FormField
                                key={attrName}
                                control={form.control}
                                name={`variants.${variantIndex}.attributes.${attrName}`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {attrName === 'size' ? 'O\'lcham' : 'Achchiqlik'}
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value || ''}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Tanlang" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {options.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>

                          {/* Variant price and stock */}
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`variants.${variantIndex}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel required>Narx</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseFloat(e.target.value) || 0)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variants.${variantIndex}.stock`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel optional>Ombordagi miqdor</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      disabled={form.watch(`variants.${variantIndex}.unlimitedStock`)}
                                      {...field}
                                      value={field.value || ''}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value ? parseFloat(e.target.value) : null
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variants.${variantIndex}.unlimitedStock`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col justify-end">
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                          field.onChange(checked);
                                          if (checked) {
                                            form.setValue(`variants.${variantIndex}.stock`, null);
                                          }
                                        }}
                                      />
                                      <Label className="text-sm">Cheksiz</Label>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="addOns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Qo'shimchalar</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {availableAddOns.map((addOn) => (
                            <div key={addOn.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={addOn.id}
                                checked={field.value?.includes(addOn.id)}
                                onCheckedChange={(checked) => {
                                  const currentAddOns = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentAddOns, addOn.id]);
                                  } else {
                                    field.onChange(
                                      currentAddOns.filter((id) => id !== addOn.id)
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={addOn.id}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {addOn.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibilitySchedule.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ko'rinish jadvali</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="always">Doim ko'rinadi</SelectItem>
                          <SelectItem value="date_range">Sana oralig'i</SelectItem>
                          <SelectItem value="recurring">Takrorlanuvchi soatlar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('visibilitySchedule.type') === 'date_range' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="visibilitySchedule.startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Boshlanish sanasi</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={
                                field.value
                                  ? new Date(field.value).toISOString().slice(0, 16)
                                  : ''
                              }
                              onChange={(e) =>
                                field.onChange(e.target.value ? new Date(e.target.value) : null)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visibilitySchedule.endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tugash sanasi</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={
                                field.value
                                  ? new Date(field.value).toISOString().slice(0, 16)
                                  : ''
                              }
                              onChange={(e) =>
                                field.onChange(e.target.value ? new Date(e.target.value) : null)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {form.watch('visibilitySchedule.type') === 'recurring' && (
                  <div className="space-y-2">
                    <Label>Takrorlanuvchi soatlar</Label>
                    <p className="text-sm text-muted-foreground">
                      Bu funksiya keyingi versiyada qo'shiladi
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Preview Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ko'rib chiqish</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Yashirish' : 'Ko\'rsatish'}
                </Button>
              </div>

              {showPreview && (
                <ProductPreviewCard formValues={formValues} />
              )}
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={uploadingImages}>
                {uploadingImages && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Yangilash' : 'Yaratish'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// Product Preview Card Component
function ProductPreviewCard({ formValues }) {
  const mainImage = formValues.images?.[0] || null;
  const hasDiscount = formValues.oldPrice && formValues.oldPrice > formValues.price;

  return (
    <Card>
      <div className="relative">
        {mainImage ? (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={mainImage}
              alt={formValues.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-lg">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-semibold">
            {Math.round(
              ((formValues.oldPrice - formValues.price) / formValues.oldPrice) * 100
            )}
            % chegirma
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{formValues.name || 'Mahsulot nomi'}</CardTitle>
            {formValues.category && (
              <CardDescription className="mt-1">{formValues.category}</CardDescription>
            )}
          </div>
          {formValues.sku && (
            <span className="text-xs text-muted-foreground font-mono">{formValues.sku}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            {formatNumber(formValues.price || 0)} so'm
          </span>
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">
              {formatNumber(formValues.oldPrice)} so'm
            </span>
          )}
        </div>

        {formValues.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {formValues.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {formValues.preparationTime && (
            <span className="text-muted-foreground">
              ⏱️ {formValues.preparationTime} daqiqa
            </span>
          )}
          {formValues.unlimitedStock ? (
            <span className="text-green-600">✓ Mavjud</span>
          ) : formValues.stockQty > 0 ? (
            <span className="text-green-600">✓ {formValues.stockQty} dona</span>
          ) : (
            <span className="text-red-600">✗ Tugagan</span>
          )}
        </div>

        {formValues.tags && formValues.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formValues.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {formValues.variants && formValues.variants.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Variantlar:</p>
            <div className="space-y-1">
              {formValues.variants.map((variant, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {Object.values(variant.attributes).join(', ')} -{' '}
                  {formatNumber(variant.price)} so'm
                </div>
              ))}
            </div>
          </div>
        )}

        {formValues.addOns && formValues.addOns.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Qo'shimchalar:</p>
            <div className="flex flex-wrap gap-2">
              {formValues.addOns.map((addOnId) => {
                const addOn = availableAddOns.find((a) => a.id === addOnId);
                return addOn ? (
                  <span
                    key={addOnId}
                    className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                  >
                    {addOn.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              formValues.availabilityStatus === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : formValues.availabilityStatus === 'hidden'
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {formValues.availabilityStatus === 'active'
              ? 'Faol'
              : formValues.availabilityStatus === 'hidden'
              ? 'Yashirilgan'
              : 'Tugagan'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

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

export default ProductForm;

