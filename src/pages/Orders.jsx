'use client';

import OrderSheet from '@/components/dashboard/dialogs/OrderSheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useAppContext } from '@/context/AppContext';
import {
  Calendar,
  Camera,
  CheckCircle2,
  DollarSign,
  MapPin,
  Phone,
  Search,
  User,
} from 'lucide-react';
import { useState } from 'react';

export default function Orders() {
  const { orders } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredOrders = orders.filter((order) => {
    const search = debouncedSearch.toLowerCase();
    return (
      (order.toyxona && order.toyxona.toLowerCase().includes(search)) ||
      (order.mijozIsmi && order.mijozIsmi.toLowerCase().includes(search)) ||
      (order.telefon && order.telefon.includes(search)) ||
      (order.clientName && order.clientName.toLowerCase().includes(search)) ||
      (order.clientPhone && order.clientPhone.includes(search))
    );
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(
      date.seconds ? date.seconds * 1000 : date
    ).toLocaleDateString('uz-UZ');
  };

  const handleCardClick = (order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Qabul qilindi': 'bg-blue-500',
      "To'y boshlandi": 'bg-yellow-500',
      "To'y tugadi": 'bg-orange-500',
      'Video editga berildi': 'bg-purple-500',
      'Video edit tugadi': 'bg-indigo-500',
      'Buyurtma tamomlandi': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getActiveServicesCount = (order) => {
    if (!order.options) return 0;
    return Object.values(order.options).filter(Boolean).length;
  };

  return (
    <div className="space-y-4 my-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buyurtmalarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl"
            onClick={() => handleCardClick(order)}
          >
            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <CardTitle className="text-balance text-lg leading-tight">
                    {order.toyxona}
                  </CardTitle>
                </div>
                <Badge
                  className={`${getStatusColor(order.status)} flex-shrink-0 text-white`}
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mijoz:</span>
                <span className="ml-auto font-medium">
                  {order.mijozIsmi || order.clientName || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sana:</span>
                <span className="ml-auto font-medium">
                  {formatDate(order.sana)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Telefon:</span>
                <span className="ml-auto font-medium">
                  {order.telefon || order.clientPhone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Kamera:</span>
                <span className="ml-auto font-medium">
                  {order.kameraSoni} ta
                </span>
              </div>
              {getActiveServicesCount(order) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Xizmatlar:</span>
                  <span className="ml-auto font-medium">
                    {getActiveServicesCount(order)} ta
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 border-t pt-3 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Narx:</span>
                <span className="ml-auto text-lg font-bold text-primary">
                  {(order.narx || 0).toLocaleString('uz-UZ')} so'm
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Hech qanday buyurtma topilmadi
          </p>
        </div>
      )}

      {/* Order Details Sheet */}
      <OrderSheet
        order={selectedOrder}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
