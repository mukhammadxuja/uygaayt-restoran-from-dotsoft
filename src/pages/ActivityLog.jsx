import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

function ActivityLog() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6" />
            <CardTitle>Activity Log</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Activity log will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityLog;

