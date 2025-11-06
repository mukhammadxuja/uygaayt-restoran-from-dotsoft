import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

function Promotions() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6" />
            <CardTitle>Promotions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Promotions management will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Promotions;

