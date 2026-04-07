// src/components/channels/WasenderConnectionDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode, RefreshCw, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Channel } from '@/types/group';

interface WasenderConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
}

export function WasenderConnectionDialog({ isOpen, onClose, channel }: WasenderConnectionDialogProps) {
  const [step, setStep] = useState<'initial' | 'creating' | 'qr' | 'connected' | 'error'>('initial');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(channel.config?.status || 'disconnected');
  const [loading, setLoading] = useState(false);

  // Poll status when in QR step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'qr') {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/wasender/sessions', {
            method: 'POST',
            body: JSON.stringify({ channelId: channel.id, action: 'status' }),
          });
          const { data } = await res.json();
          if (data.status === 'connected') {
            setStep('connected');
            setStatus('connected');
            toast.success('Dispositivo conectado com sucesso!');
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [step, channel.id]);

  const handleAction = async (action: 'create' | 'connect' | 'status') => {
    setLoading(true);
    try {
      const res = await fetch('/api/wasender/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channel.id, action }),
      });
      const result = await res.json();
      
      if (result.error) throw new Error(result.error);

      if (action === 'create') {
        setStep('creating');
        await handleAction('connect');
      } else if (action === 'connect') {
        fetchQR();
      } else if (action === 'status') {
        setStatus(result.data.status);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na operação');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchQR = async () => {
    try {
      const res = await fetch(`/api/wasender/sessions/${channel.id}/qr`);
      const result = await res.json();
      if (result.data?.qr) {
        setQrCode(result.data.qr);
        setStep('qr');
      } else {
        throw new Error('QR Code não disponível ainda.');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-deep-void border-none shadow-skeuo-elevated">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <QrCode className="text-kinetic-orange" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Sincronize o canal <span className="text-white font-bold">{channel.name}</span> com a WasenderAPI.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center min-h-[300px]">
          {step === 'initial' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-muted-foreground/30">
                <RefreshCw className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Inicie o processo para gerar uma nova sessão e escanear o QR Code.
              </p>
              <Button 
                onClick={() => handleAction('create')} 
                disabled={loading}
                className="font-black bg-kinetic-orange hover:bg-kinetic-orange/90 text-white shadow-glow-orange-intense"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                GERAR NOVA SESSÃO
              </Button>
            </div>
          )}

          {step === 'qr' && qrCode && (
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="p-4 bg-white rounded-2xl shadow-xl inline-block border-8 border-white">
                <QRCodeSVG value={qrCode} size={200} level="H" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-kinetic-orange uppercase tracking-widest animate-pulse">
                  Aguardando scan...
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold max-w-[200px] mx-auto leading-tight">
                  Abra o WhatsApp {'>'} Dispositivos Conectados {'>'} Conectar um dispositivo
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchQR} className="text-xs font-bold gap-2 text-muted-foreground hover:text-white">
                <RefreshCw className="w-3 h-3" /> ATUALIZAR QR CODE
              </Button>
            </div>
          )}

          {step === 'connected' && (
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-green-500 shadow-glow-orange" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white uppercase italic">Conectado!</h4>
                <p className="text-xs text-muted-foreground font-medium">Sua sessão está ativa e pronta para envio.</p>
              </div>
              <Button onClick={onClose} variant="outline" className="font-bold border-muted-foreground/20 text-muted-foreground hover:text-white">
                FECHAR
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-red-400">Falha na conexão</p>
              <Button onClick={() => setStep('initial')} variant="ghost" className="text-xs font-bold">Tentar novamente</Button>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center border-t border-white/5 pt-4">
           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1">
              <AlertCircle size={10} /> 
              Status: {status.toUpperCase()}
           </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
