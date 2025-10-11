import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Edit,
  Copy,
  Trash2,
  Eye,
  Loader2,
  Layers,
  Image,
  PlusCircle,
} from 'lucide-react';
import { useTemplates } from '@/hooks/use-templates';

function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, loading, error, deleteTemplate } = useTemplates();

  const template = templates.find((t) => t.id === id);

  if (loading) {
    return (
      <div className="space-y-6 my-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-gray-500">Shablon yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 my-4">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Xatolik yuz berdi
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard/order-template')}>
            Shablonlar bo'limiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6 my-4">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Shablon topilmadi
          </h3>
          <p className="text-gray-600 mb-4">Qidirilayotgan shablon topilmadi</p>
          <Button onClick={() => navigate('/dashboard/order-template')}>
            Shablonlar bo'limiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/dashboard/order-template');
  };

  const handleEdit = () => {
    navigate(`/dashboard/edit-template/${template.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bu shablonni o'chirishni xohlaysizmi?")) {
      try {
        await deleteTemplate(template.id);
        navigate('/dashboard/order-template');
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  return (
    <div className="space-y-4 my-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {template.title}
          </h2>
          <p className="text-muted-foreground">
            {template.description || 'Tafsilot mavjud emas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            O'chirish
          </Button>
        </div>
      </div>

      <div className="">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="mt-1 inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 w-fit">
            <Layers className="h-4 w-4" />
            {template.services?.length || 0} ta xizmat
          </span>
          <span className="mt-1 inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-full bg-green-50 text-green-700 w-fit">
            <Image className="h-4 w-4" />
            {template.render?.length || 0} ta variant
          </span>
          <span className="mt-1 inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-full bg-purple-50 text-purple-700 w-fit">
            <PlusCircle className="h-4 w-4" />
            {template.additionalServices?.length || 0} ta qo'shimcha
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-900">
            <Calendar className="h-4 w-4 text-gray-500" />
            {template.createdAt
              ? new Date(template.createdAt.seconds * 1000).toLocaleDateString(
                  'uz-UZ'
                )
              : "Noma'lum"}
          </div>
        </div>

        <div>
          <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Shablon tuzilmasi
              </CardTitle>
              <CardDescription className="text-sm">
                Bu shablon <strong>{template.services?.length || 0}</strong> ta
                xizmat, <strong>{template.render?.length || 0}</strong> ta
                render variant va{' '}
                <strong>{template.additionalServices?.length || 0}</strong> ta
                qo‘shimcha xizmatni o‘z ichiga oladi.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {template.services?.length > 0 && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Tanlangan xizmatlar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {template.services.map((service, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-white p-3 border border-border shadow-sm hover:shadow transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {service.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {service.price?.toLocaleString('uz-UZ')} so‘m
                          </span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-[2px] rounded-md">
                          {service.category || 'Kategoriya yo‘q'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- Render Options --- */}
              {template.render?.length > 0 && (
                <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Render variantlari
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.render.map((r, i) => (
                      <span
                        key={i}
                        className="text-sm bg-white border border-border rounded-full px-3 py-[4px] shadow-sm"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* --- Additional Services --- */}
              {template.additionalServices?.length > 0 && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Qo‘shimcha xizmatlar
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.additionalServices.map((srv, i) => (
                      <span
                        key={i}
                        className="text-sm bg-white border border-border rounded-full px-3 py-[4px] shadow-sm"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TemplateDetail;
