import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock products - in real app, this would come from API
const mockProducts = [
  { id: 'prod-1', name: 'Lavash', sku: 'SKU-001', currentCategories: ['Fast Food'] },
  { id: 'prod-2', name: 'Burger', sku: 'SKU-002', currentCategories: ['Fast Food'] },
  { id: 'prod-3', name: 'Pizza', sku: 'SKU-003', currentCategories: ['Ovqat'] },
  { id: 'prod-4', name: 'Coca Cola', sku: 'SKU-004', currentCategories: ['Ichimlik'] },
  { id: 'prod-5', name: 'Pepsi', sku: 'SKU-005', currentCategories: ['Ichimlik'] },
];

function AssignProductsToCategory({
  open,
  onOpenChange,
  category,
  allCategories = [],
  onAssign,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products assigned to this category
  React.useEffect(() => {
    if (category && open) {
      // In real app, fetch products for this category
      const assignedProducts = mockProducts.filter((p) =>
        p.currentCategories.includes(category.name)
      );
      setSelectedProducts(assignedProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
    setSearchTerm('');
  }, [category, open]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return mockProducts;
    return mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleToggleProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSubmit = async () => {
    if (!category) return;

    setIsSubmitting(true);
    try {
      await onAssign({
        categoryId: category.id,
        productIds: selectedProducts,
      });
      toast.success(
        `${selectedProducts.length} ta mahsulot kategoriyaga biriktirildi`
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning products:', error);
      toast.error('Mahsulotlarni biriktirishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) return null;

  const allSelected = filteredProducts.length > 0 && 
    filteredProducts.every((p) => selectedProducts.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mahsulotlarni kategoriyaga biriktirish</DialogTitle>
          <DialogDescription>
            {category.name} kategoriyasiga mahsulotlarni biriktiring
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Mahsulot nomi yoki SKU bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Mahsulot</TableHead>
                    <TableHead className="hidden sm:table-cell">SKU</TableHead>
                    <TableHead className="hidden md:table-cell">Joriy kategoriyalar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleToggleProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-sm">
                        {product.sku}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {product.currentCategories.map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {searchTerm
                    ? 'Qidiruv bo\'yicha mahsulot topilmadi'
                    : 'Mahsulotlar topilmadi'}
                </p>
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedProducts.length > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">
                {selectedProducts.length} ta mahsulot tanlangan
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProducts.length === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Biriktirish ({selectedProducts.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AssignProductsToCategory;

