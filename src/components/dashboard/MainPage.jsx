import { useState, useMemo } from 'react';
import {
  ArrowRight,
  HandCoins,
  Wallet,
  Users,
  Camera,
  Video,
  Edit3,
  Clock,
  CheckCircle,
  Play,
} from 'lucide-react';
import { MonthPicker } from '@/components/ui/month-picker';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function AdminDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { clients, orders, employees } = useAppContext();

  // Calculate real statistics
  const stats = useMemo(() => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();

    // Filter orders for selected month
    const monthlyOrders = orders.filter((order) => {
      const orderDate = new Date(
        order.createdAt?.seconds
          ? order.createdAt.seconds * 1000
          : order.createdAt
      );
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    // Calculate total revenue for the month
    const monthlyRevenue = monthlyOrders.reduce((total, order) => {
      return total + (order.totalPrice || 0);
    }, 0);

    // Calculate growth (simplified - comparing with previous month)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const previousMonthOrders = orders.filter((order) => {
      const orderDate = new Date(
        order.createdAt?.seconds
          ? order.createdAt.seconds * 1000
          : order.createdAt
      );
      return (
        orderDate.getMonth() === previousMonth &&
        orderDate.getFullYear() === previousYear
      );
    });

    const previousRevenue = previousMonthOrders.reduce((total, order) => {
      return total + (order.totalPrice || 0);
    }, 0);

    const growth =
      previousRevenue > 0
        ? (
            ((monthlyRevenue - previousRevenue) / previousRevenue) *
            100
          ).toFixed(1)
        : 0;

    // Count active projects (orders in progress)
    const activeProjects = orders.filter(
      (order) => order.status === 'in_progress' || order.status === 'pending'
    ).length;

    // Count new clients this month
    const newClientsThisMonth = clients.filter((client) => {
      const clientDate = new Date(
        client.createdAt?.seconds
          ? client.createdAt.seconds * 1000
          : client.createdAt
      );
      return (
        clientDate.getMonth() === currentMonth &&
        clientDate.getFullYear() === currentYear
      );
    }).length;

    return {
      totalOrders: orders.length,
      monthlyRevenue,
      totalClients: clients.length,
      totalProjects: activeProjects,
      avgRating: 4.7, // This would need to be calculated from actual ratings
      growth: growth > 0 ? `+${growth}%` : `${growth}%`,
      newClientsThisMonth,
    };
  }, [clients, orders, selectedMonth]);

  // Calculate employee performance data
  const employeePerformance = useMemo(() => {
    const performance = {
      photographer: { active: 0, busy: 0, completed: 0, queue: 0 },
      video_operator: { active: 0, busy: 0, completed: 0, queue: 0 },
      editor: { active: 0, busy: 0, completed: 0, queue: 0 },
    };

    // Count active employees by position
    employees.forEach((employee) => {
      if (performance[employee.position]) {
        performance[employee.position].active++;
      }
    });

    // Count busy employees and completed projects
    orders.forEach((order) => {
      if (order.assignedEmployee) {
        const employee = employees.find(
          (emp) => emp.id === order.assignedEmployee
        );
        if (employee && performance[employee.position]) {
          if (order.status === 'in_progress') {
            performance[employee.position].busy++;
          } else if (order.status === 'completed') {
            performance[employee.position].completed++;
          }
        }
      }
    });

    // Calculate busy percentage
    Object.keys(performance).forEach((position) => {
      if (performance[position].active > 0) {
        performance[position].busyPercentage = Math.round(
          (performance[position].busy / performance[position].active) * 100
        );
      } else {
        performance[position].busyPercentage = 0;
      }
    });

    return performance;
  }, [employees, orders]);

  // Calculate video editing progress
  const videoEditingProgress = useMemo(() => {
    const videoOrders = orders.filter((order) =>
      order.services?.some(
        (service) =>
          service.name?.toLowerCase().includes('video') ||
          service.name?.toLowerCase().includes('tahrir')
      )
    );

    const inEditing = videoOrders.filter(
      (order) => order.status === 'in_progress'
    ).length;
    const readyForRender = videoOrders.filter(
      (order) => order.status === 'ready_for_review'
    ).length;
    const delivered = videoOrders.filter(
      (order) => order.status === 'completed'
    ).length;

    // Calculate average editing duration (simplified)
    const completedVideoOrders = videoOrders.filter(
      (order) => order.status === 'completed'
    );
    let totalDuration = 0;
    let count = 0;

    completedVideoOrders.forEach((order) => {
      if (order.createdAt && order.completedAt) {
        const start = new Date(
          order.createdAt?.seconds
            ? order.createdAt.seconds * 1000
            : order.createdAt
        );
        const end = new Date(
          order.completedAt?.seconds
            ? order.completedAt.seconds * 1000
            : order.completedAt
        );
        const duration = (end - start) / (1000 * 60 * 60 * 24); // days
        totalDuration += duration;
        count++;
      }
    });

    const avgDuration = count > 0 ? (totalDuration / count).toFixed(1) : 0;

    return {
      inEditing,
      readyForRender,
      delivered,
      avgDuration,
    };
  }, [orders]);

  return (
    <div className="space-y-4 my-2">
      <div className="flex items-center justify-between">
        <h2 className="hidden md:block text-xl font-bold tracking-tight">
          Hi, Welcome back 👋
        </h2>
        <MonthPicker
          className="md:w-44"
          month={selectedMonth}
          setMonth={setSelectedMonth}
        />
      </div>
      <div className="grid grid-cols-2 min-[1200px]:grid-cols-4 border border-border rounded-xl bg-gradient-to-br from-sidebar/60 to-sidebar overflow-hidden">
        {/* Jami buyurtmalar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <HandCoins className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Jami buyurtmalar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.totalOrders} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">
                {stats.growth}
              </span>{' '}
              o'tgan oyga nisbatan
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* Oylik daromad */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Oylik daromad
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.monthlyRevenue.toLocaleString()} so‘m
            </h3>
            <p className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">+8%</span> o‘tgan
              oyga nisbatan
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* Jami mijozlar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Jami mijozlar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.totalClients} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">
                +{stats.newClientsThisMonth} yangi
              </span>{' '}
              bu oyda
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* Faol loyihalar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Faol loyihalar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.totalProjects} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">
                {stats.totalProjects} ta faol
              </span>{' '}
              loyihalar
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>
      </div>

      {/* Employee Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Xodimlar faoliyati (Performance Overview)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-background overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r bg-muted">
                  <TableHead className="py-2 font-medium">Bo'lim</TableHead>
                  <TableHead className="text-center">Aktiv xodimlar</TableHead>
                  <TableHead className="text-center">Bandlik (%)</TableHead>
                  <TableHead className="text-center">
                    Yakunlangan loyihalar
                  </TableHead>
                  <TableHead className="text-center">Navbatda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(employeePerformance).map(([position, data]) => {
                  const positionLabels = {
                    photographer: 'Fotograf',
                    video_operator: 'Video operator',
                    editor: 'Editor',
                  };

                  return (
                    <TableRow
                      key={position}
                      className="*:border-border hover:bg-muted/50 [&>:not(:last-child)]:border-r"
                    >
                      <TableCell className="py-2 font-medium">
                        <Badge variant="outline" className="text-xs">
                          {positionLabels[position] || position}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">
                          {data.active}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Progress
                            value={data.busyPercentage}
                            className="w-16 h-2"
                          />
                          <span className="text-sm font-medium">
                            {data.busyPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-green-600">
                          {data.completed}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-orange-600">
                          {data.queue}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Video Editing Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Video Editing Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Editing jarayonida */}
            <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <div className="bg-blue-500/10 rounded-full p-2 border border-blue-500/20">
                <Edit3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tahrir jarayonida
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {videoEditingProgress.inEditing}
                </p>
                <p className="text-xs text-muted-foreground">video</p>
              </div>
            </div>

            {/* Render uchun tayyor */}
            <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
              <div className="bg-yellow-500/10 rounded-full p-2 border border-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Render uchun tayyor
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {videoEditingProgress.readyForRender}
                </p>
                <p className="text-xs text-muted-foreground">video</p>
              </div>
            </div>

            {/* Jo'natilgan */}
            <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <div className="bg-green-500/10 rounded-full p-2 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Jo'natilgan
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {videoEditingProgress.delivered}
                </p>
                <p className="text-xs text-muted-foreground">video</p>
              </div>
            </div>

            {/* O'rtacha tahrir davomiyligi */}
            <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <div className="bg-purple-500/10 rounded-full p-2 border border-purple-500/20">
                <Play className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  O'rtacha davomiylik
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {videoEditingProgress.avgDuration}
                </p>
                <p className="text-xs text-muted-foreground">kun</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
