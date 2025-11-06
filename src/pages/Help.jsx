import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

function Help() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            <CardTitle>Help</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Help and support information will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Help;

