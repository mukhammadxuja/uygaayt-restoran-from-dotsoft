import React, { useState } from 'react';
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
import {
  ArrowLeft,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  Send,
  FileText,
  DollarSign,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Tag,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// Fake order data generator
const generateFakeOrder = (orderId) => {
  const statuses = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];
  const paymentStatuses = ['paid', 'unpaid'];
  const deliveryTypes = ['pickup', 'delivery'];

  const items = [
    { name: 'Lavash', variant: 'Katta', quantity: 2, price: 35000 },
    { name: 'Burger', variant: 'Kichik', quantity: 1, price: 25000 },
    { name: 'Pizza', variant: 'O\'rta', quantity: 1, price: 55000 },
    { name: 'Salat', variant: 'Katta', quantity: 1, price: 20000 },
  ];

  const events = [
    { status: 'accepted', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), note: 'Buyurtma qabul qilindi' },
    { status: 'preparing', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), note: 'Tayyorlanmoqda' },
  ];

  // Random promo code (sometimes applied)
  const appliedPromo = Math.random() > 0.5 ? {
    code: 'WELCOME10',
    type: 'percentage',
    discountValue: 10,
    discountAmount: 13500,
  } : null;

  return {
    id: orderId || 'ORD-000001',
    clientName: 'Ali Valiyev',
    phone: '+998901234567',
    address: 'Toshkent shahar, Yunusobod tumani, Amir Temur ko\'chasi, 15-uy',
    deliveryNotes: 'Uyning eshigi o\'ng tomonda, 3-qavat',
    items: items,
    paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
    transactionId: Math.random() > 0.5 ? `TXN-${Math.floor(Math.random() * 1000000)}` : null,
    status: 'preparing',
    deliveryType: deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)],
    events: events,
    internalNote: 'Mijoz maxsus talab qilgan',
    customerNote: 'Iltimos, tezroq yetkazib bering',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    appliedPromo: appliedPromo,
  };
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order] = useState(generateFakeOrder(orderId));
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [internalNote, setInternalNote] = useState(order.internalNote || '');
  const [customerNote, setCustomerNote] = useState(order.customerNote || '');

  const handleBack = () => {
    navigate('/dashboard/orders');
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleAccept = () => {
    // Add accept event
    order.events.push({
      status: 'accepted',
      timestamp: new Date(),
      note: 'Buyurtma qabul qilindi',
    });
    order.status = 'accepted';
    toast.success('Buyurtma qabul qilindi');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Sababni kiriting');
      return;
    }
    order.events.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Bekor qilindi: ${rejectReason}`,
    });
    order.status = 'cancelled';
    setRejectDialogOpen(false);
    setRejectReason('');
    toast.success('Buyurtma bekor qilindi');
  };

  const handleMarkAsReady = () => {
    order.events.push({
      status: 'ready',
      timestamp: new Date(),
      note: 'Tayyor',
    });
    order.status = 'ready';
    toast.success('Buyurtma tayyor deb belgilandi');
  };

  const handleMarkAsPickedUp = () => {
    order.events.push({
      status: 'picked_up',
      timestamp: new Date(),
      note: 'Olib ketildi',
    });
    order.status = 'picked_up';
    toast.success('Buyurtma olib ketildi deb belgilandi');
  };

  const handleMarkAsDelivered = () => {
    order.events.push({
      status: 'delivered',
      timestamp: new Date(),
      note: 'Yetkazib berildi',
    });
    order.status = 'delivered';
    toast.success('Buyurtma yetkazib berildi deb belgilandi');
  };

  const handleRefundRequest = () => {
    toast.info('Pul qaytarish so\'rovi yuborildi');
  };

  const handleResendNotification = (type) => {
    if (type === 'courier') {
      toast.success('Kuryerga xabar qayta yuborildi');
    } else {
      toast.success('Mijozga xabar qayta yuborildi');
    }
  };

  const handleSaveNotes = () => {
    order.internalNote = internalNote;
    order.customerNote = customerNote;
    toast.success('Eslatmalar saqlandi');
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { label: 'Kutilmoqda', variant: 'secondary', icon: Clock },
      accepted: { label: 'Qabul qilindi', variant: 'default', icon: CheckCircle2 },
      preparing: { label: 'Tayyorlanmoqda', variant: 'default', icon: Package },
      ready: { label: 'Tayyor', variant: 'default', icon: CheckCircle2 },
      picked_up: { label: 'Olib ketildi', variant: 'default', icon: Truck },
      delivered: { label: 'Yetkazib berildi', variant: 'default', icon: CheckCircle2 },
      cancelled: { label: 'Bekor qilingan', variant: 'destructive', icon: XCircle },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTimelineStatus = (status) => {
    const statuses = ['accepted', 'preparing', 'picked_up', 'delivered'];
    return statuses.indexOf(status);
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = order.appliedPromo?.discountAmount || 0;
  const totalAmount = subtotal - discountAmount;

  return (
    <div className="space-y-4 my-2">
      {/* Header */}
      <div className="flex items-center gap-4">

        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Buyurtma #{order.id}
          </h2>
          <p className="text-muted-foreground">
            {formatDate(order.createdAt.getTime())}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Mijoz ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Ism</Label>
                <p className="font-medium">{order.clientName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Telefon</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.phone}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall(order.phone)}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Qo'ng'iroq qilish
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Manzil</Label>
                <p className="font-medium">{order.address}</p>
                {order.deliveryType === 'delivery' && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <iframe
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(order.address)}&output=embed`}
                    />
                  </div>
                )}
              </div>
              {order.deliveryNotes && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Yetkazib berish eslatmalari
                  </Label>
                  <p className="text-sm">{order.deliveryNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Buyurtma itemlari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant} • {item.quantity} ta
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatNumber(item.price * item.quantity)} so'm
                    </p>
                  </div>
                ))}
                <Separator />
                {order.appliedPromo && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          Promo kod ({order.appliedPromo.code})
                        </span>
                      </div>
                      <span className="text-primary font-medium">
                        -{formatNumber(discountAmount)} so'm
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Jami:</span>
                  <span>{formatNumber(totalAmount)} so'm</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                To'lov ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Holat</Label>
                <Badge
                  variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
                >
                  {order.paymentStatus === 'paid' ? 'To\'langan' : 'To\'lanmagan'}
                </Badge>
              </div>
              {order.transactionId && (
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Transaction ID
                  </Label>
                  <p className="font-mono text-sm">{order.transactionId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Events Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Buyurtma holati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['accepted', 'preparing', 'picked_up', 'delivered'].map(
                  (status, index) => {
                    const event = order.events.find((e) => e.status === status);
                    const isCompleted = getTimelineStatus(order.status) >= index;
                    const isCurrent = getTimelineStatus(order.status) === index;

                    return (
                      <div key={status} className="flex items-start gap-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isCompleted
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted border-muted-foreground'
                            }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${isCurrent ? 'text-primary' : ''
                              }`}
                          >
                            {status === 'accepted' && 'Qabul qilindi'}
                            {status === 'preparing' && 'Tayyorlanmoqda'}
                            {status === 'picked_up' && 'Olib ketildi'}
                            {status === 'delivered' && 'Yetkazib berildi'}
                          </p>
                          {event && (
                            <p className="text-sm text-muted-foreground">
                              {formatDate(event.timestamp.getTime())} • {event.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Notes */}
        <div className="space-y-4">
          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Amallar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.status === 'pending' && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleAccept}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Qabul qilish
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rad etish
                  </Button>
                </>
              )}
              {order.status === 'accepted' && (
                <Button
                  className="w-full"
                  onClick={handleMarkAsReady}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Tayyor deb belgilash
                </Button>
              )}
              {order.status === 'ready' && (
                <Button
                  className="w-full"
                  onClick={handleMarkAsPickedUp}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Olib ketildi deb belgilash
                </Button>
              )}
              {order.status === 'picked_up' && (
                <Button
                  className="w-full"
                  onClick={handleMarkAsDelivered}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Yetkazib berildi deb belgilash
                </Button>
              )}
              {order.status === 'delivered' && order.paymentStatus === 'paid' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRefundRequest}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Pul qaytarish so'rovi
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Eslatmalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="internal-note">Ichki eslatma (faqat do'kon)</Label>
                <Textarea
                  id="internal-note"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ichki eslatma..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer-note">Mijoz eslatmasi</Label>
                <Textarea
                  id="customer-note"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Mijoz eslatmasi..."
                  className="mt-1"
                />
              </div>
              <Button className="w-full" onClick={handleSaveNotes}>
                Saqlash
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Xabarnomalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleResendNotification('courier')}
              >
                <Send className="w-4 h-4 mr-2" />
                Kuryerga qayta yuborish
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleResendNotification('customer')}
              >
                <Send className="w-4 h-4 mr-2" />
                Mijozga qayta yuborish
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buyurtmani rad etish</DialogTitle>
            <DialogDescription>
              Buyurtmani rad etish sababini kiriting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Sabab</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rad etish sababini kiriting..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
            >
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Rad etish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderDetail;
