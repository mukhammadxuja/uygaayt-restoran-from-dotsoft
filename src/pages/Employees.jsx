import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddEmployee from '@/components/dashboard/dialogs/AddEmployee';
import { useAppContext } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Plus, Search, Phone, User, Calendar } from 'lucide-react';

function Employees() {
  const { employees } = useAppContext();
  const navigate = useNavigate();

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredEmployees = employees.filter((employee) => {
    const search = debouncedSearch.toLowerCase();
    const matchesSearch =
      employee.name.toLowerCase().includes(search) ||
      employee.phone.includes(search);

    const matchesType = filterType === 'all' || employee.type === filterType;
    const matchesPosition =
      filterPosition === 'all' || employee.position === filterPosition;

    return matchesSearch && matchesType && matchesPosition;
  });

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

  const handleEmployeeClick = (employee) => {
    navigate(`/dashboard/employees/${employee.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Xodimlar</h1>
          <p className="text-muted-foreground">
            Barcha xodimlaringizni boshqaring
          </p>
        </div>
        <Button
          onClick={() => setShowAddEmployee(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Xodim qo'shish
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Xodimlarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ishchi turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            <SelectItem value="studio">Studio ishchi</SelectItem>
            <SelectItem value="freelance">Yollanma ishchi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Vazifa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha vazifalar</SelectItem>
            <SelectItem value="video_operator">Video operator</SelectItem>
            <SelectItem value="photograph">Fotograf</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Xodimlar ro'yxati
            <Badge variant="secondary">
              {filteredEmployees.length} ta xodim
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ism</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Vazifa</TableHead>
                  <TableHead>Ishchi turi</TableHead>
                  <TableHead>Qo'shilgan sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {employee.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {employee.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPositionLabel(employee.position)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeVariant(employee.type)}>
                        {getTypeLabel(employee.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(employee.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filterType !== 'all' || filterPosition !== 'all'
                  ? 'Xodim topilmadi'
                  : "Hali xodimlar yo'q"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' || filterPosition !== 'all'
                  ? "Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang"
                  : "Birinchi xodimingizni qo'shing"}
              </p>
              {!searchTerm &&
                filterType === 'all' &&
                filterPosition === 'all' && (
                  <Button onClick={() => setShowAddEmployee(true)}>
                    Xodim qo'shish
                  </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <AddEmployee open={showAddEmployee} onOpenChange={setShowAddEmployee} />
    </div>
  );
}

export default Employees;
