import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

function Finance() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            <CardTitle>Finance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Finance management will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Finance;

