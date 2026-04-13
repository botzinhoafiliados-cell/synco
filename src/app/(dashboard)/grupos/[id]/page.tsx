'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutContainer from '@/components/layout/LayoutContainer';
import PageHeader from '@/components/shared/PageHeader';
import { ArrowLeft, Users } from 'lucide-react';
import { GroupDetailView } from '@/components/groups/GroupDetailView';
import { KineticButton } from '@/components/ui/KineticButton';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  return (
    <LayoutContainer type="operational">
       <div className="mb-6">
         <KineticButton 
           onClick={() => router.back()}
           className="h-10 px-4 bg-transparent shadow-none text-white/40 hover:text-white/80 hover:bg-white/5 transition-all flex items-center gap-2"
         >
           <ArrowLeft size={16} />
           <span className="text-xs font-bold uppercase tracking-widest leading-none mt-0.5">Voltar</span>
         </KineticButton>
       </div>

       <div className="space-y-8">
          <GroupDetailView groupId={groupId} />
       </div>
    </LayoutContainer>
  );
}
