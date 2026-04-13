import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WasenderClient } from '@/lib/wasender/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const logPrefix = `[MESH-DETAIL] [${new Date().toISOString()}]`;
  
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    console.log(`${logPrefix} Iniciando sync profundo para grupo local: ${groupId}`);

    // 1. Buscar o grupo e o canal vinculado
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, remote_id, channel_id, channels(config)')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single();

    if (groupError || !group || !group.remote_id) {
       console.error(`${logPrefix} Grupo não encontrado ou sem remote_id: ${groupId}`);
       return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const { config } = group.channels as any;
    if (!config?.sessionId) {
       console.error(`${logPrefix} Sessão não configurada para o canal do grupo: ${groupId}`);
       return NextResponse.json({ error: 'Channel session not found' }, { status: 404 });
    }

    const sessionId = config.sessionId;
    const remoteId = group.remote_id;

    // 1.1 Buscar Session API Key nas secrets
    const { data: secrets } = await supabase
      .from('channel_secrets')
      .select('session_api_key')
      .eq('channel_id', group.channel_id)
      .single();

    let sessionApiKey = secrets?.session_api_key;
    
    // 1.2 PONTE DE AUTENTICAÇÃO AUTÔNOMA (Zero-User-Auth)
    if (!sessionApiKey || sessionApiKey.includes(':')) {
      console.log(`${logPrefix} Chave operacional ausente. Iniciando ponte administrativa para ${sessionId}...`);
      
      try {
        const sessionData = await WasenderClient.getSession(sessionId);
        const fetchedKey = sessionData.api_key || sessionData.data?.api_key;
        
        if (fetchedKey) {
          console.log(`${logPrefix} Chave recuperada com sucesso via PAT. Persistindo...`);
          
          await supabase.from('channel_secrets').upsert({
            channel_id: group.channel_id,
            user_id: user.id,
            session_api_key: fetchedKey,
            updated_at: new Date().toISOString()
          }, { onConflict: 'channel_id' });
          
          sessionApiKey = fetchedKey;
        }

        // Validação de estado físico da sessão
        const status = sessionData.status || sessionData.data?.status;
        if (status !== 'CONNECTED') {
           console.warn(`${logPrefix} Sessão em estado: ${status}. Abortando deep sync.`);
           return NextResponse.json({ 
             error: 'session_disconnected', 
             message: 'Sessão desconectada — reconecte via QR Code',
             status 
           }, { status: 400 });
        }
      } catch (bridgeErr: any) {
        console.error(`${logPrefix} Falha na ponte de autenticação administrativa:`, bridgeErr.message);
      }
    }

    // 2. Buscar dados na WasenderAPI (4 chamadas em paralelo para Malha Profunda)
    console.log(`${logPrefix} Buscando malha real para ${remoteId} (Session: ${sessionId})...`);
    const [metaRes, participantsRes, pictureRes, inviteRes] = await Promise.all([
      WasenderClient.getGroupMetadata(sessionId, remoteId, sessionApiKey).catch((err) => {
        console.warn(`${logPrefix} Erro ao buscar metadados:`, err.message);
        return null;
      }),
      WasenderClient.getGroupParticipants(sessionId, remoteId, sessionApiKey).catch((err) => {
        console.warn(`${logPrefix} Erro ao buscar integrantes:`, err.message);
        return null;
      }),
      WasenderClient.getGroupPicture(sessionId, remoteId, sessionApiKey).catch((err) => {
        console.warn(`${logPrefix} Erro ao buscar avatar:`, err.message);
        return null;
      }),
      WasenderClient.getGroupInviteLink(sessionId, remoteId, sessionApiKey).catch((err) => {
        console.warn(`${logPrefix} Erro ao buscar link de convite:`, err.message);
        return null;
      })
    ]);

    // Normalização de Payloads
    const metadata = metaRes?.data || metaRes;
    const rawParticipants = participantsRes?.data || participantsRes?.participants || participantsRes || [];
    const participants = Array.isArray(rawParticipants) ? rawParticipants : [];
    const pictureData = pictureRes?.data || pictureRes;
    const inviteData = inviteRes?.data || inviteRes;

    console.log(`${logPrefix} Resumo Malha: Meta=${!!metadata}, Members=${participants.length}, Avatar=${!!pictureData}, Link=${!!inviteData}`);

    // 3. Persistir Metadados no Grupo
    if (metadata) {
      const groupOwner = metadata.owner?.jid || metadata.owner || metadata.creator || metadata.subjectOwner || null;
      const createdAt = metadata.creation || metadata.createdAt;
      
      const updateData: any = {
        description: metadata.description || metadata.desc || null,
        invite_link: inviteData?.url || inviteData?.link || metadata.invite_link || metadata.link || null,
        owner: groupOwner,
        remote_created_at: createdAt ? new Date(createdAt * 1000).toISOString() : null,
        permissions: metadata.permissions || {},
        avatar_url: pictureData?.url || pictureData?.image || metadata.avatar || metadata.profile_picture || null,
        updated_at: new Date().toISOString()
      };
      
      console.log(`${logPrefix} Sincronizando metadados em public.groups...`);
      const { error: groupUpdateErr } = await supabase.from('groups').update(updateData).eq('id', groupId);
      if (groupUpdateErr) {
        console.error(`${logPrefix} Erro ao atualizar metadados do grupo:`, JSON.stringify(groupUpdateErr, null, 2));
      }

      // 4. Persistir Contatos e Participantes
      if (participants.length > 0) {
        console.log(`${logPrefix} Sincronizando ${participants.length} integrantes da malha...`);
        
        // a. Preparar contatos para upsert (Prioridade JID > LID)
        const contactsPayload = participants.map((p: any) => {
          const pJid = p.jid; // Geralmente @s.whatsapp.net
          const pLid = p.id || p.remote_id; // Geralmente @lid ou o ID bruto
          const bestId = pJid || pLid;
          
          if (!bestId) return null;

          return {
            user_id: user.id,
            channel_id: group.channel_id,
            remote_id: bestId,
            push_name: p.pushName || p.pushname || p.name || p.verifiedName || null,
            name: p.name || p.pushName || p.pushname || null,
            updated_at: new Date().toISOString()
          };
        }).filter(Boolean);

        console.log(`${logPrefix} Executando upsert de ${contactsPayload.length} contatos em public.contacts...`);
        const { data: syncedContacts, error: contactError } = await supabase
          .from('contacts')
          .upsert(contactsPayload, { onConflict: 'channel_id,remote_id' })
          .select('id, remote_id');

        if (contactError) {
          console.error(`${logPrefix} Erro no upsert de contatos:`, JSON.stringify(contactError, null, 2));
        } else if (syncedContacts) {
          console.log(`${logPrefix} ${syncedContacts.length} contatos sincronizados no banco.`);
          
          // b. Mapear remote_id para o local contact_id
          const contactMap = new Map(syncedContacts.map(c => [c.remote_id, c.id]));

          // c. Preparar participantes com auditoria
          const participantPayload = participants.map((p: any) => {
            const pJid = p.jid;
            const pLid = p.id || p.remote_id;
            const bestId = pJid || pLid;
            
            // Tentar localizar no mapa por JID (preferencial) ou LID
            const cId = contactMap.get(pJid) || contactMap.get(pLid);
            if (!cId) {
              console.warn(`${logPrefix} [AUDIT] Falha ao mapear ID para participante: JID=${pJid}, LID=${pLid}`);
              return null;
            }

            // Normalização para comparação do criador
            const normalize = (id: string) => id?.split('@')[0];
            const isOwner = normalize(pJid) === normalize(groupOwner) || 
                            normalize(pLid) === normalize(groupOwner) || 
                            pJid === groupOwner || 
                            pLid === groupOwner;

            // Lógica de papéis: Creator > Superadmin > Admin > Member
            const rawRole = (p.role || '').toLowerCase();
            const isAdminFlag = p.admin || p.isAdmin || rawRole === 'admin' || rawRole === 'superadmin' || p.is_admin || p.isSuperAdmin;
            
            let role = 'member';
            if (isOwner) {
              role = 'creator';
            } else if (rawRole === 'superadmin' || p.isSuperAdmin) {
              role = 'superadmin';
            } else if (isAdminFlag) {
              role = 'admin';
            }
            
            console.log(`${logPrefix} [AUDIT] Participante: ID=${bestId}, ROLE=${role}${isOwner ? ' (CREATOR)' : ''}`);
            
            return {
              group_id: groupId,
              contact_id: cId,
              role: role,
              last_synced_at: new Date().toISOString()
            };
          }).filter(Boolean);

          // Upsert participantes em lote
          if (participantPayload.length > 0) {
            console.log(`${logPrefix} Executando upsert de ${participantPayload.length} em public.group_participants...`);
            const { error: partErr } = await supabase
              .from('group_participants')
              .upsert(participantPayload, { onConflict: 'group_id,contact_id' });
            
            if (partErr) {
              console.error(`${logPrefix} Erro no upsert de integrantes:`, JSON.stringify(partErr, null, 2));
            } else {
              // d. Recalcular contadores reais
              const adminRoles = ['creator', 'admin', 'superadmin'];
              const actualAdminCount = participantPayload.filter(p => p && adminRoles.includes(p.role)).length;
              const actualMemberCount = participantPayload.length;

              console.log(`${logPrefix} Sync finalizado: ${actualMemberCount} membros, ${actualAdminCount} admins.`);
              await supabase.from('groups').update({
                admin_count: actualAdminCount,
                members_count: actualMemberCount,
                updated_at: new Date().toISOString()
              }).eq('id', groupId);
            }
          } else {
            console.warn(`${logPrefix} Nenhum participante mapeado após processamento.`);
          }
        }
      } else {
        console.warn(`${logPrefix} Wasender retornou lista de participantes vazia.`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      metadata: metadata || {},
      participants_count: participants.length
    });

  } catch (error: any) {
    console.error(`${logPrefix} ERRO GET /api/wasender/groups/[id]/details:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
