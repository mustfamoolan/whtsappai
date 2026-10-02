import React from 'react';
import PageContainer from './layout/PageContainer';
import { Card, CardContent } from './ui/card';

export default function Placeholder({ title }) {
  return (
    <PageContainer title={title} description="قريباً...">
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>هذه الصفحة قيد التطوير...</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
