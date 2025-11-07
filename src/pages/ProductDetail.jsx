import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  Loader2,
  Copy,
  History,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import ProductForm from '@/components/dashboard/dialogs/ProductForm';
import StockAdjustment from '@/components/dashboard/dialogs/StockAdjustment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock product data generator
const generateFakeProduct = (productId) => {
  return {
    id: productId || 'PROD-000001',
    name: 'Lavash',
    sku: 'SKU-000001',
    category: 'Fast Food',
    price: 35000,
    oldPrice: 40000,
    stock: 45,
    unlimitedStock: false,
    availabilityStatus: 'active',
    description: 'Tovuq go\'shtli, pishloq, pomidor, piyoz va maxsus sous bilan tayyorlangan mazali lavash. Yangi non bilan tayyorlanadi.',
    preparationTime: 15,
    tags: ['tez ovqat', 'mashhur', 'yangi non'],
    images: [
      'https://via.placeholder.com/400x300?text=Lavash+1',
      'https://via.placeholder.com/400x300?text=Lavash+2',
      'https://via.placeholder.com/400x300?text=Lavash+3',
    ],
    variants: [
      {
        id: 'variant_1',
        attributes: { size: 'Kichik', spiceLevel: 'Yengil' },
        price: 30000,
        stock: 20,
        unlimitedStock: false,
      },
      {
        id: 'variant_2',
        attributes: { size: 'O\'rta', spiceLevel: 'O\'rtacha' },
        price: 35000,
        stock: 15,
        unlimitedStock: false,
      },
      {
        id: 'variant_3',
        attributes: { size: 'Katta', spiceLevel: 'Achchiq' },
        price: 40000,
        stock: 10,
        unlimitedStock: false,
      },
    ],
    addOns: ['extra-cheese', 'extra-sauce'],
    visibilitySchedule: {
      type: 'always',
      startDate: null,
      endDate: null,
      recurringHours: [],
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    stockHistory: [
      {
        id: 'adj_1',
        type: 'add',
        quantity: 50,
        reason: 'purchase',
        previousStock: 0,
        newStock: 50,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notes: 'Yangi xarid',
      },
      {
        id: 'adj_2',
        type: 'remove',
        quantity: 5,
        reason: 'sale',
        previousStock: 50,
        newStock: 45,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Sotilgan',
      },
    ],
  };
};

const availableAddOns = {
  'extra-cheese': 'Qo\'shimcha pishloq',
  'extra-sauce': 'Qo\'shimcha sous',
  'spicy': 'Achchiq',
  'no-onion': 'Piyozsiz',
  'no-garlic': 'Sarimsogsiz',
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      label: 'Faol',
      variant: 'default',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    hidden: {
      label: 'Yashirilgan',
      variant: 'secondary',
      icon: XCircle,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    },
    out_of_stock: {
      label: 'Tugagan',
      variant: 'destructive',
      icon: AlertTriangle,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 w-fit ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

// Image Gallery Component
const ImageGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMobile = useIsMobile();

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted group">
        <img
          src={images[selectedIndex]}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded text-xs">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-6'}`}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedIndex === index
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-muted hover:border-primary/50'
                }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Stock Info Card Component
const StockInfoCard = ({ product, lowStockThreshold, onAdjust }) => {
  const getStockStatus = () => {
    if (product.unlimitedStock) {
      return { color: 'text-green-600', label: 'Cheksiz', icon: CheckCircle2 };
    }
    if (product.stock === 0) {
      return { color: 'text-red-600', label: 'Tugagan', icon: XCircle };
    }
    if (product.stock <= lowStockThreshold) {
      return { color: 'text-yellow-600', label: 'Past', icon: TrendingDown };
    }
    return { color: 'text-green-600', label: 'Mavjud', icon: CheckCircle2 };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Ombordagi miqdor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StockIcon className={`h-5 w-5 ${stockStatus.color}`} />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Holat</p>
              <p className={`text-sm sm:text-base font-semibold ${stockStatus.color}`}>
                {stockStatus.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Joriy miqdor</p>
            <p className="font-bold text-xl sm:text-2xl">
              {product.unlimitedStock ? '∞' : product.stock || 0}
            </p>
          </div>
        </div>
        {!product.unlimitedStock && product.stock <= lowStockThreshold && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Past ombordagi miqdor
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-0.5">
                  Ombordagi miqdor {lowStockThreshold} donadan past
                </p>
              </div>
            </div>
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={onAdjust}>
          <Package className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Ombordagi miqdorni o'zgartirish</span>
        </Button>
      </CardContent>
    </Card>
  );
};

// Stock History Component
const StockHistoryList = ({ history }) => {
  const getReasonLabel = (reason) => {
    const reasons = {
      purchase: 'Yangi xarid',
      sale: 'Sotilgan',
      damaged: 'Shikastlangan',
      expired: 'Muddati o\'tgan',
      inventory: 'Inventarizatsiya',
      correction: 'Xatolik tuzatish',
      return: 'Qaytarilgan',
      theft: 'O\'g\'irlik',
      transfer_in: 'Ko\'chirildi (kirish)',
      transfer_out: 'Ko\'chirildi (chiqish)',
    };
    return reasons[reason] || 'Boshqa';
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Ombordagi miqdor tarixi yo'q
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {history.slice(0, 10).map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.type === 'add' ? (
                <Plus className="h-4 w-4 text-green-600 flex-shrink-0" />
              ) : item.type === 'remove' ? (
                <Minus className="h-4 w-4 text-red-600 flex-shrink-0" />
              ) : (
                <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">
                {item.type === 'add'
                  ? 'Qo\'shildi'
                  : item.type === 'remove'
                    ? 'Ayirildi'
                    : 'O\'rnatildi'}
                : {item.quantity} dona
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{getReasonLabel(item.reason)}</p>
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.notes}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(item.timestamp).toLocaleString('uz-UZ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex sm:flex-col gap-2 sm:gap-0 sm:text-right">
            <div>
              <p className="text-xs text-muted-foreground">Oldin</p>
              <p className="text-sm font-medium">{item.previousStock}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Keyin</p>
              <p className="text-sm font-medium text-green-600">{item.newStock}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lowStockThreshold] = useState(
    parseInt(localStorage.getItem('lowStockThreshold')) || 10
  );

  useEffect(() => {
    setTimeout(() => {
      setProduct(generateFakeProduct(productId));
      setLoading(false);
    }, 500);
  }, [productId]);

  const handleBack = () => navigate('/dashboard/products');
  const handleEdit = () => setEditFormOpen(true);
  const handleStockAdjust = () => setStockAdjustmentOpen(true);

  const handleSaveProduct = async (productData) => {
    console.log('Saving product:', productData);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setProduct({ ...product, ...productData });
    toast.success('Mahsulot yangilandi');
    setEditFormOpen(false);
  };

  const handleStockAdjustment = async (adjustment) => {
    console.log('Stock adjustment:', adjustment);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newStock = adjustment.newStock;
    setProduct({
      ...product,
      stock: newStock,
      stockHistory: [
        {
          id: `adj_${Date.now()}`,
          ...adjustment,
          timestamp: new Date(),
        },
        ...product.stockHistory,
      ],
    });

    toast.success('Ombordagi miqdor yangilandi');
    setStockAdjustmentOpen(false);
  };

  const handleDelete = () => {
    toast.success('Mahsulot o\'chirildi');
    navigate('/dashboard/products');
  };

  const handleCopySKU = () => {
    navigator.clipboard.writeText(product.sku);
    toast.success('SKU nusxalandi');
  };

  const hasDiscount = product && product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Mahsulot yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Mahsulot topilmadi</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          Bu mahsulot mavjud emas yoki o'chirilgan
        </p>
        <Button onClick={handleBack}>Mahsulotlar bo'limiga qaytish</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">

          <div className="min-w-0 flex-1">
            <h1 className="title">
              {product.name}
            </h1>
            <p className="paragraph">
              {product.category} • SKU: {product.sku}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <MoreVertical className="h-4 w-4" />
                Amallar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleStockAdjust}>
                <Package className="h-4 w-4" />
                Ombordagi miqdor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleStockAdjust}>
              <Package className="h-4 w-4" />
              Ombordagi miqdor
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
              Tahrirlash
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              O'chirish
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Images Gallery */}
          <Card>
            {/* <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Rasmlar</CardTitle>
            </CardHeader> */}
            <CardContent className="pt-4">
              <ImageGallery images={product.images} productName={product.name} />
            </CardContent>
          </Card>

          {/* Product Information - Using Tabs for better organization */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="text-xs sm:text-sm">
                Ma'lumotlar
              </TabsTrigger>
              <TabsTrigger value="variants" className="text-xs sm:text-sm">
                Variantlar
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">
                Tarix
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 sm:space-y-6 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Asosiy ma'lumotlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Nomi</Label>
                      <p className="font-medium text-sm sm:text-base mt-1">{product.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">SKU</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-xs sm:text-sm">{product.sku}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopySKU}
                          className="h-6 w-6"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Kategoriya</Label>
                      <p className="font-medium text-sm sm:text-base mt-1">{product.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Holat</Label>
                      <div className="mt-1">
                        <StatusBadge status={product.availabilityStatus} />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs sm:text-sm text-muted-foreground">Narx</Label>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="font-semibold text-base sm:text-lg">
                          {formatNumber(product.price)} so'm
                        </p>
                        {hasDiscount && (
                          <>
                            <span className="text-xs sm:text-sm text-muted-foreground line-through">
                              {formatNumber(product.oldPrice)} so'm
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              -{discountPercent}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    {product.preparationTime && (
                      <div>
                        <Label className="text-xs sm:text-sm text-muted-foreground">
                          Tayyorlash vaqti
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-sm sm:text-base">
                            {product.preparationTime} daqiqa
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Tavsif</Label>
                      <p className="text-xs sm:text-sm mt-1 whitespace-pre-wrap leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">Teglar</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.addOns && product.addOns.length > 0 && (
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        Qo'shimchalar
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {product.addOns.map((addOnId) => (
                          <Badge key={addOnId} variant="outline" className="text-xs">
                            {availableAddOns[addOnId] || addOnId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="mt-4">
              {product.variants && product.variants.length > 0 ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Variantlar</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Mahsulotning turli xil variantlari va narxlari
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {product.variants.map((variant, index) => (
                        <div
                          key={variant.id}
                          className="p-3 sm:p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <span className="text-sm font-medium">Variant {index + 1}</span>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(variant.attributes).map(([key, value]) => (
                                  <Badge key={key} variant="outline" className="text-xs">
                                    {key === 'size' ? 'O\'lcham' : 'Achchiqlik'}: {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex sm:items-center gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Narx</p>
                                <p className="text-sm sm:text-base font-semibold">
                                  {formatNumber(variant.price)} so'm
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Ombordagi miqdor</p>
                                <p className="text-sm sm:text-base font-semibold">
                                  {variant.unlimitedStock
                                    ? 'Cheksiz'
                                    : `${variant.stock || 0} dona`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    Variantlar mavjud emas
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Ombordagi miqdor tarixi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StockHistoryList history={product.stockHistory} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Stock Information */}
          <StockInfoCard
            product={product}
            lowStockThreshold={lowStockThreshold}
            onAdjust={handleStockAdjust}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Statistika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Yaratilgan</span>
                <span className="text-xs sm:text-sm font-medium">
                  {new Date(product.createdAt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Yangilangan</span>
                <span className="text-xs sm:text-sm font-medium">
                  {new Date(product.updatedAt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Variantlar</span>
                <span className="text-xs sm:text-sm font-medium">
                  {product.variants?.length || 0} ta
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Qo'shimchalar</span>
                <span className="text-xs sm:text-sm font-medium">
                  {product.addOns?.length || 0} ta
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form */}
      <ProductForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        product={product}
        onSave={handleSaveProduct}
      />

      {/* Stock Adjustment */}
      <StockAdjustment
        open={stockAdjustmentOpen}
        onOpenChange={setStockAdjustmentOpen}
        product={product}
        onAdjust={handleStockAdjustment}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mahsulotni o'chirish</DialogTitle>
            <DialogDescription>
              Bu mahsulotni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>{product.name}</strong> mahsuloti butunlay o'chiriladi.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductDetail;
