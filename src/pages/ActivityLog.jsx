import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Calendar,
  User,
  Package,
  DollarSign,
  FileText,
  List,
  Grid3x3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { DatePicker } from '@/components/ui/date-picker';

// Action types
const ACTION_TYPES = {
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  PRICE_CHANGE: 'price_change',
  ORDER_STATUS_CHANGE: 'order_status_change',
  CREATE_ORDER: 'create_order',
  UPDATE_ORDER: 'update_order',
  STOCK_ADJUSTMENT: 'stock_adjustment',
  CREATE_CLIENT: 'create_client',
  UPDATE_CLIENT: 'update_client',
  CREATE_EMPLOYEE: 'create_employee',
  UPDATE_EMPLOYEE: 'update_employee',
};

// Generate fake activity logs
const generateFakeActivityLogs = () => {
  const actions = [
    { type: ACTION_TYPES.CREATE_PRODUCT, label: 'Mahsulot yaratildi', icon: Package },
    { type: ACTION_TYPES.UPDATE_PRODUCT, label: 'Mahsulot yangilandi', icon: Package },
    { type: ACTION_TYPES.DELETE_PRODUCT, label: 'Mahsulot o\'chirildi', icon: Package },
    { type: ACTION_TYPES.PRICE_CHANGE, label: 'Narx o\'zgartirildi', icon: DollarSign },
    { type: ACTION_TYPES.ORDER_STATUS_CHANGE, label: 'Buyurtma holati o\'zgardi', icon: FileText },
    { type: ACTION_TYPES.CREATE_ORDER, label: 'Buyurtma yaratildi', icon: FileText },
    { type: ACTION_TYPES.UPDATE_ORDER, label: 'Buyurtma yangilandi', icon: FileText },
    { type: ACTION_TYPES.STOCK_ADJUSTMENT, label: 'Ombordagi miqdor o\'zgartirildi', icon: Package },
    { type: ACTION_TYPES.CREATE_CLIENT, label: 'Mijoz yaratildi', icon: User },
    { type: ACTION_TYPES.UPDATE_CLIENT, label: 'Mijoz yangilandi', icon: User },
    { type: ACTION_TYPES.CREATE_EMPLOYEE, label: 'Xodim yaratildi', icon: User },
    { type: ACTION_TYPES.UPDATE_EMPLOYEE, label: 'Xodim yangilandi', icon: User },
  ];

  const names = [
    'Ali Valiyev',
    'Dilshoda Karimova',
    'Javohir Toshmatov',
    'Malika Yusupova',
    'Sardor Rahimov',
    'Gulnoza Alimova',
    'Farhod Bekmurodov',
    'Nigora Toshmatova',
    'Bekzod Karimov',
    'Zarina Alimova',
  ];

  const logs = [];
  const now = new Date();

  for (let i = 1; i <= 100; i++) {
    const randomDate = new Date(
      now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000
    );
    const action = actions[Math.floor(Math.random() * actions.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const userId = `USER-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`;

    // Generate details based on action type
    let details = '';
    switch (action.type) {
      case ACTION_TYPES.CREATE_PRODUCT:
        details = 'Lavash - 25,000 so\'m';
        break;
      case ACTION_TYPES.UPDATE_PRODUCT:
        details = 'Burger - kategoriya yangilandi';
        break;
      case ACTION_TYPES.DELETE_PRODUCT:
        details = 'Pizza - mahsulot o\'chirildi';
        break;
      case ACTION_TYPES.PRICE_CHANGE:
        details = 'Shashlik - 30,000 so\'mdan 35,000 so\'mgacha';
        break;
      case ACTION_TYPES.ORDER_STATUS_CHANGE:
        details = 'ORD-000123 - "Kutilmoqda"dan "Jarayonda"ga';
        break;
      case ACTION_TYPES.CREATE_ORDER:
        details = 'ORD-000456 - 150,000 so\'m';
        break;
      case ACTION_TYPES.UPDATE_ORDER:
        details = 'ORD-000789 - mijoz ma\'lumotlari yangilandi';
        break;
      case ACTION_TYPES.STOCK_ADJUSTMENT:
        details = 'Coca Cola - +50 dona qo\'shildi';
        break;
      case ACTION_TYPES.CREATE_CLIENT:
        details = 'Ali Valiyev - +998901234567';
        break;
      case ACTION_TYPES.UPDATE_CLIENT:
        details = 'Dilshoda Karimova - manzil yangilandi';
        break;
      case ACTION_TYPES.CREATE_EMPLOYEE:
        details = 'Javohir Toshmatov - Kuryer';
        break;
      case ACTION_TYPES.UPDATE_EMPLOYEE:
        details = 'Malika Yusupova - ma\'lumotlar yangilandi';
        break;
      default:
        details = 'Ma\'lumotlar';
    }

    logs.push({
      id: `LOG-${String(i).padStart(6, '0')}`,
      userId,
      name,
      action: action.type,
      actionLabel: action.label,
      details,
      timestamp: randomDate,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Action Badge Component
const ActionBadge = ({ action }) => {
  const actionConfig = {
    [ACTION_TYPES.CREATE_PRODUCT]: { label: 'Yaratildi', variant: 'default', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    [ACTION_TYPES.UPDATE_PRODUCT]: { label: 'Yangilandi', variant: 'default', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    [ACTION_TYPES.DELETE_PRODUCT]: { label: 'O\'chirildi', variant: 'destructive' },
    [ACTION_TYPES.PRICE_CHANGE]: { label: 'Narx', variant: 'default', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    [ACTION_TYPES.ORDER_STATUS_CHANGE]: { label: 'Holat', variant: 'default', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    [ACTION_TYPES.CREATE_ORDER]: { label: 'Buyurtma', variant: 'default', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    [ACTION_TYPES.UPDATE_ORDER]: { label: 'Yangilandi', variant: 'default', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    [ACTION_TYPES.STOCK_ADJUSTMENT]: { label: 'Ombordagi miqdor', variant: 'default', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    [ACTION_TYPES.CREATE_CLIENT]: { label: 'Mijoz', variant: 'default', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    [ACTION_TYPES.UPDATE_CLIENT]: { label: 'Mijoz', variant: 'default', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    [ACTION_TYPES.CREATE_EMPLOYEE]: { label: 'Xodim', variant: 'default', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    [ACTION_TYPES.UPDATE_EMPLOYEE]: { label: 'Xodim', variant: 'default', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  };

  const config = actionConfig[action] || { label: action, variant: 'secondary' };
  
  return (
    <Badge 
      variant={config.variant} 
      className={`text-xs ${config.color || ''}`}
    >
      {config.label}
    </Badge>
  );
};

// Activity Log Card Component (Mobile)
const ActivityLogCard = ({ log }) => {
  const getActionIcon = (action) => {
    if (action.includes('product')) return Package;
    if (action.includes('order')) return FileText;
    if (action.includes('price')) return DollarSign;
    if (action.includes('client') || action.includes('employee')) return User;
    return History;
  };

  const ActionIcon = getActionIcon(log.action);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ActionIcon className="h-4 w-4 text-muted-foreground" />
              <ActionBadge action={log.action} />
            </div>
            <p className="font-medium text-sm">{log.actionLabel}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 py-2 border-t">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Foydalanuvchi:
            </span>
            <span className="font-medium truncate ml-2">{log.name}</span>
          </div>
          <div className="flex items-start justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Tafsilotlar:
            </span>
            <span className="font-medium text-right ml-2 max-w-[60%]">{log.details}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Vaqt:
            </span>
            <span className="font-medium text-xs">
              {log.timestamp instanceof Date
                ? formatDate(log.timestamp.getTime())
                : formatDate(log.timestamp)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Activity Log Table Row Component
const ActivityLogTableRow = ({ log, isMobile }) => {
  const getActionIcon = (action) => {
    if (action.includes('product')) return Package;
    if (action.includes('order')) return FileText;
    if (action.includes('price')) return DollarSign;
    if (action.includes('client') || action.includes('employee')) return User;
    return History;
  };

  const ActionIcon = getActionIcon(log.action);

  // Get action name from action type (e.g., 'create_product' -> 'create_product')
  const getActionName = (action) => {
    const actionNames = {
      [ACTION_TYPES.CREATE_PRODUCT]: 'create_product',
      [ACTION_TYPES.UPDATE_PRODUCT]: 'update_product',
      [ACTION_TYPES.DELETE_PRODUCT]: 'delete_product',
      [ACTION_TYPES.PRICE_CHANGE]: 'price_change',
      [ACTION_TYPES.ORDER_STATUS_CHANGE]: 'order_status_change',
      [ACTION_TYPES.CREATE_ORDER]: 'create_order',
      [ACTION_TYPES.UPDATE_ORDER]: 'update_order',
      [ACTION_TYPES.STOCK_ADJUSTMENT]: 'stock_adjustment',
      [ACTION_TYPES.CREATE_CLIENT]: 'create_client',
      [ACTION_TYPES.UPDATE_CLIENT]: 'update_client',
      [ACTION_TYPES.CREATE_EMPLOYEE]: 'create_employee',
      [ACTION_TYPES.UPDATE_EMPLOYEE]: 'update_employee',
    };
    return actionNames[action] || action;
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <ActionIcon className="h-4 w-4 text-muted-foreground" />
          <ActionBadge action={log.action} />
        </div>
      </TableCell>
      <TableCell>
        <div className="min-w-0">
          <div className="font-medium text-sm sm:text-base truncate font-mono">
            {getActionName(log.action)}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="min-w-0">
          <div className="font-medium text-sm sm:text-base truncate">
            {log.name}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground truncate font-mono">
            {log.userId}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="text-sm truncate max-w-[300px]">{log.details}</div>
      </TableCell>
      <TableCell className="text-xs sm:text-sm">
        <div className="truncate">
          {log.timestamp instanceof Date
            ? formatDate(log.timestamp.getTime())
            : formatDate(log.timestamp)}
        </div>
      </TableCell>
    </TableRow>
  );
};

function ActivityLog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [fakeLogs] = useState(generateFakeActivityLogs());
  const [viewMode, setViewMode] = useState('table');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort logs
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = [...fakeLogs];

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.userId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          log.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          log.actionLabel.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Date filter
    if (dateFilter === 'custom' && startDate && endDate) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return logDate >= start && logDate <= end;
      });
    } else if (dateFilter !== 'all' && dateFilter !== 'custom') {
      const now = new Date();
      let startDateFilter;

      switch (dateFilter) {
        case 'today':
          startDateFilter = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDateFilter = null;
      }

      if (startDateFilter) {
        filtered = filtered.filter(
          (log) => new Date(log.timestamp) >= startDateFilter
        );
      }
    }

    // Always sort by newest first
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filtered;
  }, [
    fakeLogs,
    debouncedSearchTerm,
    actionFilter,
    dateFilter,
    startDate,
    endDate,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredAndSortedLogs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, actionFilter, dateFilter, startDate, endDate]);

  // Read filters and pagination from URL on mount
  useEffect(() => {
    const search = searchParams.get('search');
    const action = searchParams.get('action');
    const date = searchParams.get('date');
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    
    if (search !== null) setSearchTerm(search);
    if (action !== null) setActionFilter(action);
    if (date !== null) setDateFilter(date);
    if (start !== null) {
      try {
        setStartDate(new Date(start));
      } catch (e) {
        // Invalid date, ignore
      }
    }
    if (end !== null) {
      try {
        setEndDate(new Date(end));
      } catch (e) {
        // Invalid date, ignore
      }
    }
    if (page !== null) {
      const pageNum = parseInt(page, 10);
      if (pageNum >= 1) setCurrentPage(pageNum);
    }
    if (limit !== null) {
      const limitNum = parseInt(limit, 10);
      if ([10, 20, 30, 40, 50].includes(limitNum)) setItemsPerPage(limitNum);
    }
  }, []); // Only on mount

  // Update URL when filters change (using debounced search)
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (actionFilter !== 'all') params.set('action', actionFilter);
    if (dateFilter !== 'all') params.set('date', dateFilter);
    if (startDate) params.set('startDate', startDate.toISOString());
    if (endDate) params.set('endDate', endDate.toISOString());
    
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, actionFilter, dateFilter, startDate, endDate, setSearchParams]);

  // Update URL when pagination changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    
    if (itemsPerPage !== 20) {
      params.set('limit', itemsPerPage.toString());
    } else {
      params.delete('limit');
    }
    
    setSearchParams(params, { replace: true });
  }, [currentPage, itemsPerPage, searchParams, setSearchParams]);

  // Auto set view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    }
  }, [isMobile]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['ID', 'Foydalanuvchi ID', 'Ism', 'Harakat', 'Tafsilotlar', 'Vaqt'].join(','),
        ...filteredAndSortedLogs.map((log) =>
          [
            log.id,
            log.userId,
            log.name,
            log.actionLabel,
            `"${log.details.replace(/"/g, '""')}"`,
            log.timestamp instanceof Date
              ? formatDate(log.timestamp.getTime())
              : formatDate(log.timestamp),
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV fayl yuklab olindi');
  };

  const hasActiveFilters =
    actionFilter !== 'all' ||
    dateFilter !== 'all' ||
    startDate ||
    endDate;

  // Get unique action types for filter
  const actionTypes = [
    { value: 'all', label: 'Barcha harakatlar' },
    { value: ACTION_TYPES.CREATE_PRODUCT, label: 'Mahsulot yaratish' },
    { value: ACTION_TYPES.UPDATE_PRODUCT, label: 'Mahsulot yangilash' },
    { value: ACTION_TYPES.DELETE_PRODUCT, label: 'Mahsulot o\'chirish' },
    { value: ACTION_TYPES.PRICE_CHANGE, label: 'Narx o\'zgartirish' },
    { value: ACTION_TYPES.ORDER_STATUS_CHANGE, label: 'Buyurtma holati' },
    { value: ACTION_TYPES.CREATE_ORDER, label: 'Buyurtma yaratish' },
    { value: ACTION_TYPES.UPDATE_ORDER, label: 'Buyurtma yangilash' },
    { value: ACTION_TYPES.STOCK_ADJUSTMENT, label: 'Ombordagi miqdor' },
    { value: ACTION_TYPES.CREATE_CLIENT, label: 'Mijoz yaratish' },
    { value: ACTION_TYPES.UPDATE_CLIENT, label: 'Mijoz yangilash' },
    { value: ACTION_TYPES.CREATE_EMPLOYEE, label: 'Xodim yaratish' },
    { value: ACTION_TYPES.UPDATE_EMPLOYEE, label: 'Xodim yangilash' },
  ];

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">Faollik jurnali</h2>
          <p className="paragraph">
            Do'kon admin/xodimlarining barcha harakatlarini ko'rib chiqing
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Foydalanuvchi, harakat yoki tafsilotlar bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {isMobile ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrlar {hasActiveFilters && `(${[
              actionFilter !== 'all' ? 1 : 0,
              dateFilter !== 'all' ? 1 : 0,
            ].reduce((a, b) => a + b, 0)})`}
          </Button>
        ) : null}

        {(!isMobile || filtersOpen) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Harakat turi" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={dateFilter} 
              onValueChange={(value) => {
                setDateFilter(value);
                if (value !== 'custom') {
                  setStartDate(null);
                  setEndDate(null);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Davr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha vaqt</SelectItem>
                <SelectItem value="today">Bugun</SelectItem>
                <SelectItem value="week">Oxirgi hafta</SelectItem>
                <SelectItem value="month">Oxirgi oy</SelectItem>
                <SelectItem value="quarter">Oxirgi 3 oy</SelectItem>
                <SelectItem value="custom">Maxsus davr</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === 'custom' && (
              <>
                <div className="w-full sm:w-[180px]">
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    className="w-full"
                  />
                </div>
                <div className="w-full sm:w-[180px]">
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {!isMobile && (
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="ml-auto">
                <Download className="w-4 h-4 mr-2" />
                CSV Export
              </Button>
            )}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {isMobile && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              CSV Export
            </Button>
          </div>
        )}
      </div>

      {/* Activity Logs List */}
      {filteredAndSortedLogs.length > 0 ? (
        viewMode === 'card' || isMobile ? (
          // Card View (Mobile or Desktop Card Mode)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedLogs.map((log) => (
              <ActivityLogCard key={log.id} log={log} />
            ))}
          </div>
        ) : (
          // Table View (Desktop List Mode - Default)
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px] whitespace-nowrap">Harakat</TableHead>
                    <TableHead className="w-[200px] whitespace-nowrap">Harakat nomi</TableHead>
                    <TableHead className="w-[180px] whitespace-nowrap">Foydalanuvchi</TableHead>
                    <TableHead className="hidden md:table-cell w-[300px] whitespace-nowrap">Tafsilotlar</TableHead>
                    <TableHead className="w-[130px] whitespace-nowrap">Vaqt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <ActivityLogTableRow
                      key={log.id}
                      log={log}
                      isMobile={isMobile}
                    />
                  ))}
                </TableBody>
              </Table>
        </CardContent>
      </Card>
        )
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>
              {searchTerm || hasActiveFilters
                ? 'Faollik topilmadi'
                : 'Hech qanday faollik yo\'q'}
            </EmptyTitle>
            <EmptyDescription>
              {searchTerm || hasActiveFilters
                ? 'Qidiruv yoki filtrlash natijasiga mos faollik topilmadi. Boshqa qidiruv so\'zlarini yoki filtrlarni sinab ko\'ring.'
                : 'Hali hech qanday faollik qayd etilmagan.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Pagination */}
      {filteredAndSortedLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Sahifada ko'rsatish:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedLogs.length)} dan{' '}
              {filteredAndSortedLogs.length} ta
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-initial"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Oldingi</span>
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-initial"
            >
              <span className="text-xs sm:text-sm">Keyingi</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;

