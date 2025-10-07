import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';
import { Phone, Mail, MapPin, Calendar, User } from 'lucide-react';

export default function ClientDetails({ open, onOpenChange, client }) {
  const { getClientOrders } = useAppContext();

  if (!client) return null;

  const clientOrders = getClientOrders(client.id);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(
      date.seconds ? date.seconds * 1000 : date
    ).toLocaleDateString('uz-UZ');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:!w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client.name}
          </SheetTitle>
          <SheetDescription>
            Mijozning barcha ma'lumotlari va buyurtmalari
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Client Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asosiy ma'lumotlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{client.phone}</span>
              </div>

              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}

              {client.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Qo'shilgan: {formatDate(client.createdAt)}</span>
              </div>

              {client.notes && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Qo'shimcha ma'lumotlar:
                  </p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Client Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Buyurtmalar
                <Badge variant="secondary">{clientOrders.length} ta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientOrders.length > 0 ? (
                <div className="space-y-4">
                  {clientOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {order.toyxona || 'N/A'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.sana)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatPrice(order.narx || 0)}
                        </Badge>
                      </div>

                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Telefon:</span>{' '}
                          {order.telefon}
                        </p>
                        <p>
                          <span className="font-medium">Kamera soni:</span>{' '}
                          {order.kameraSoni}
                        </p>

                        {order.options && (
                          <div>
                            <span className="font-medium">Xizmatlar:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(order.options)
                                .filter(([_, value]) => value)
                                .map(([key, _]) => (
                                  <Badge
                                    key={key}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {key}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}

                        {order.albom && (
                          <p>
                            <span className="font-medium">Albom:</span>{' '}
                            {order.albom}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Bu mijozning hali buyurtmalari yo'q</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
