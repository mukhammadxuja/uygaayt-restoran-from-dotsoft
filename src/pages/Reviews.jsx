import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

function Reviews() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6" />
            <CardTitle>Reviews</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Reviews management will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Reviews;

