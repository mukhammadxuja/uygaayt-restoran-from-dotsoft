import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import {
  Phone,
  User,
  ArrowLeft,
  Calendar,
  Briefcase,
  Users,
} from 'lucide-react';

export default function EmployeeDetails() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { employees } = useAppContext();

  const employee = employees.find((e) => e.id === employeeId);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(
      date.seconds ? date.seconds * 1000 : date
    ).toLocaleDateString('uz-UZ');
  };

  const getPositionLabel = (position) => {
    const positions = {
      video_operator: 'Video operator',
      photograph: 'Fotograf',
      editor: 'Editor',
    };
    return positions[position] || position;
  };

  const getTypeLabel = (type) => {
    const types = {
      studio: 'Studio ishchi',
      freelance: 'Yollanma ishchi',
    };
    return types[type] || type;
  };

  const getTypeVariant = (type) => {
    return type === 'studio' ? 'default' : 'secondary';
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Xodim topilmadi</h2>
          <p className="text-muted-foreground mb-4">
            Bu xodim mavjud emas yoki o'chirilgan
          </p>
          <Button onClick={() => navigate('/dashboard/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Xodimlar ro'yxatiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/employees')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              {employee.name}
            </h1>
            <p className="text-muted-foreground">
              Xodimning barcha ma'lumotlari
            </p>
          </div>
        </div>
      </div>

      {/* Employee Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asosiy ma'lumotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{employee.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{employee.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Qo'shilgan: {formatDate(employee.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vazifa va turi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">
                {getPositionLabel(employee.position)}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Badge variant={getTypeVariant(employee.type)}>
                {getTypeLabel(employee.type)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qo'shimcha ma'lumotlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID:</span>
                <span className="text-sm font-mono">{employee.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="outline" className="text-xs">
                  Faol
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xodim statistikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">
                Jami buyurtmalar
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">
                Bu oy buyurtmalar
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Daromad</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">So'nggi faoliyat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Hali faoliyat yo'q</p>
            <p className="text-sm">
              Bu xodim bilan bog'liq faoliyatlar bu yerda ko'rinadi
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

