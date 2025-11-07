import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamManagement from './TeamManagement';
import APIKeys from './APIKeys';

function SystemSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'team';

  return (
    <Tabs 
      value={activeTab}
      onValueChange={(value) => {
        setSearchParams({ tab: value }, { replace: true });
      }}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="team" className="text-xs sm:text-sm">
          Jamoa
        </TabsTrigger>
        <TabsTrigger value="api-keys" className="text-xs sm:text-sm">
          API kalitlar
        </TabsTrigger>
      </TabsList>
      <TabsContent value="team">
        <TeamManagement />
      </TabsContent>
      <TabsContent value="api-keys">
        <APIKeys />
      </TabsContent>
    </Tabs>
  );
}

export default SystemSettings;

