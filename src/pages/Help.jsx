import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Image as ImageIcon,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Store,
  User,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Guide Component
const GuideCard = ({ title, description, icon: Icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Contact Support Dialog
const ContactSupportDialog = ({ open, onOpenChange }) => {
  const { userData, user } = useAppContext();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill with store context
  const storeInfo = userData?.storeName || 'Mening do\'konim';
  const userEmail = user?.email || '';
  const userName = userData?.name || user?.displayName || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would send the ticket to your support system
      console.log('Support ticket:', {
        subject,
        category,
        message,
        storeInfo,
        userEmail,
        userName,
        timestamp: new Date().toISOString(),
      });

      toast.success('Yordam so\'rovi yuborildi. Tez orada javob olasiz!');
      
      // Reset form
      setSubject('');
      setCategory('');
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yordam so'rovi yuborish</DialogTitle>
          <DialogDescription>
            Savolingiz yoki muammoingiz haqida batafsil yozing. Biz sizga tez orada javob beramiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-info">Do'kon ma'lumotlari</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{storeInfo}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-info">Foydalanuvchi</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userName || userEmail}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategoriya</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Kategoriyani tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Texnik muammo</SelectItem>
                <SelectItem value="billing">To'lov muammosi</SelectItem>
                <SelectItem value="feature">Yangi funksiya so'rovi</SelectItem>
                <SelectItem value="bug">Xatolik haqida</SelectItem>
                <SelectItem value="account">Hisob sozlamalari</SelectItem>
                <SelectItem value="other">Boshqa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Mavzu</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Masalan: Buyurtma qayta ishlash muammosi"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Xabar</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Muammo yoki savolingizni batafsil yozing..."
              rows={6}
              required
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function Help() {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
    <div className="space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="title">Yordam va Hujjatlar</h2>
          <p className="paragraph">
            Tezkor qo'llanmalar va qo'llab-quvvatlash xizmatlari
          </p>
        </div>
        <Button onClick={() => setContactDialogOpen(true)} size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Yordam so'rovi yuborish
        </Button>
      </div>

      {/* Quick Guides */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Tezkor qo'llanmalar</h3>
        </div>

        <div className="grid gap-4">
          {/* How to Process Order */}
          <GuideCard
            title="Buyurtmani qayta ishlash"
            description="Buyurtmalarni qabul qilish, yangilash va boshqarish bo'yicha qo'llanma"
            icon={ShoppingCart}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Yangi buyurtma qabul qilish</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>"Buyurtmalar" bo'limiga o'ting</li>
                  <li>"Yangi buyurtma" tugmasini bosing</li>
                  <li>Mijoz ma'lumotlarini kiriting (ism, telefon, manzil)</li>
                  <li>Mahsulotlarni tanlang va miqdorni belgilang</li>
                  <li>To'lov turini va yetkazib berish usulini tanlang</li>
                  <li>"Saqlash" tugmasini bosing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Buyurtma holatini yangilash</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Buyurtmalar ro'yxatidan kerakli buyurtmani toping</li>
                  <li>"Ko'rish" tugmasini bosing</li>
                  <li>Holatni o'zgartiring (Kutilmoqda → Jarayonda → Tugallangan)</li>
                  <li>O'zgarishlar avtomatik saqlanadi</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Buyurtmani bekor qilish</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Buyurtma batafsil sahifasiga o'ting</li>
                  <li>"Bekor qilish" tugmasini bosing</li>
                  <li>Sebabni kiriting va tasdiqlang</li>
                </ul>
              </div>
            </div>
          </GuideCard>

          {/* How Payouts Work */}
          <GuideCard
            title="To'lovlar qanday ishlaydi"
            description="To'lov turlari, to'lov jarayonlari va hisob-kitoblar haqida ma'lumot"
            icon={DollarSign}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">To'lov turlari</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li><strong>Naqd pul:</strong> Mijoz to'g'ridan-to'g'ri naqd pul bilan to'laydi</li>
                  <li><strong>Karta:</strong> POS terminal orqali kartadan to'lov</li>
                  <li><strong>Online:</strong> Onlayn to'lov tizimlari orqali</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">To'lov jarayoni</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Buyurtma yaratilganda to'lov turi belgilanadi</li>
                  <li>To'lov holati "Kutilmoqda" bo'ladi</li>
                  <li>To'lov qabul qilinganida holat "To'langan" ga o'zgaradi</li>
                  <li>Barcha to'lovlar "Moliya" bo'limida ko'rsatiladi</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Hisob-kitoblar</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Kunlik, haftalik va oylik hisobotlar mavjud</li>
                  <li>To'lovlar bo'yicha filtrlash va eksport qilish mumkin</li>
                  <li>CSV formatida hisobotlarni yuklab olish mumkin</li>
                </ul>
              </div>
            </div>
          </GuideCard>

          {/* Image Guidelines */}
          <GuideCard
            title="Rasm qo'yish qoidalari"
            description="Mahsulot rasmlarini yuklash va formatlash bo'yicha ko'rsatmalar"
            icon={ImageIcon}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Qo'llab-quvvatlanadigan formatlar</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>JPG, JPEG, PNG formatlari qo'llab-quvvatlanadi</li>
                  <li>Rasm hajmi maksimal 5 MB bo'lishi kerak</li>
                  <li>Tavsiya etilgan o'lcham: 800x800 piksel</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Rasm sifatiga talablar</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Rasm aniq va yorug' bo'lishi kerak</li>
                  <li>Mahsulot markazda joylashgan bo'lishi kerak</li>
                  <li>Fon oddiy va toza bo'lishi tavsiya etiladi</li>
                  <li>Rasmda matn yoki watermark bo'lmasligi kerak</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Rasm yuklash</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Mahsulot yaratish/yangilash sahifasida "Rasm yuklash" tugmasini bosing</li>
                  <li>Faylni tanlang yoki drag & drop qiling</li>
                  <li>Rasm avtomatik qayta o'lchamlanadi</li>
                  <li>Ko'rib chiqing va "Saqlash" tugmasini bosing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Maslahatlar</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Har bir mahsulot uchun bir nechta rasm yuklash mumkin</li>
                  <li>Birinchi rasm asosiy rasm sifatida ko'rsatiladi</li>
                  <li>Rasmlarni tartibga solish mumkin</li>
                  <li>Kerak bo'lsa, rasmlarni o'chirish mumkin</li>
                </ul>
              </div>
            </div>
          </GuideCard>
        </div>
      </div>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Qo'llab-quvvatlash</CardTitle>
          </div>
          <CardDescription>
            Savolingiz yoki muammoingiz bormi? Bizga yozing!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Email orqali</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  support@uygaayt.uz
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('mailto:support@uygaayt.uz')}
                >
                  Email yozish
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Telefon orqali</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  +998 90 123 45 67
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('tel:+998901234567')}
                >
                  Qo'ng'iroq qilish
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => setContactDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Yordam so'rovi yuborish
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support Dialog */}
      <ContactSupportDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
    </div>
  );
}

export default Help;

