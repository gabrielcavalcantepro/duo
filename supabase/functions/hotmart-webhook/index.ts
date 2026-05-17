import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();

    const event = body.event;
    if (!['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'].includes(event)) {
      return new Response(JSON.stringify({ message: 'Evento ignorado' }), { status: 200 });
    }

    const buyer = body.data?.buyer;
    const purchase = body.data?.purchase;

    if (!buyer?.email) {
      return new Response(JSON.stringify({ error: 'Email não encontrado' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('subscribers')
      .upsert({
        email: buyer.email.toLowerCase().trim(),
        name: buyer.name,
        phone: buyer.phone,
        hotmart_id: purchase?.transaction,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
