// src/components/destinations/SaveListDialog.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KineticButton } from "@/components/ui/KineticButton";
import { useCreateDestination, useDestinations } from "@/hooks/use-destinations";
import { toast } from 'sonner';

interface SaveListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroupIds: string[];
  userId: string;
}

export function SaveListDialog({ open, onOpenChange, selectedGroupIds, userId }: SaveListDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: createList, isPending } = useCreateDestination();
  const { data: existingLists } = useDestinations(userId);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Dê um nome para sua lista.');
      return;
    }

    // Validação de nome duplicado (Case Insensitive)
    const isDuplicate = existingLists?.some(l => l.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      toast.error('Já existe uma lista com este nome. Escolha outro.');
      return;
    }

    createList({
      destination: {
        user_id: userId,
        name: name.trim(),
        description: description.trim(),
        is_active: true
      },
      groupIds: selectedGroupIds
    }, {
      onSuccess: () => {
        setName('');
        setDescription('');
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-anthracite-surface border-none shadow-skeuo-elevated sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-kinetic-orange font-black uppercase tracking-widest text-sm">
            Salvar Coleção de Destinos
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase font-bold text-white/30">
            Crie uma lista reutilizável com os {selectedGroupIds.length} grupos selecionados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Nome da Lista
            </Label>
            <Input
              id="name"
              placeholder="Ex: Grupos de Promoção 01"
              className="bg-deep-void border-none shadow-skeuo-pressed text-xs uppercase font-black tracking-widest h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Observação (Opcional)
            </Label>
            <Input
              id="description"
              placeholder="Descreva o propósito da lista..."
              className="bg-deep-void border-none shadow-skeuo-pressed text-xs h-11"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <KineticButton
            className="w-full h-12 font-black uppercase tracking-widest text-xs"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar Lista'}
          </KineticButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
