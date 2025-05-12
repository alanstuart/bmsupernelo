import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { order } = await req.json()

    // Store order in database
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_info: order.customer,
          order_items: order.products,
          pickup_info: order.pickup,
          total_amount: order.total,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase
      .from('order_notifications')
      .insert([
        {
          order_id: data.id,
          type: 'new_order',
          status: 'pending'
        }
      ])

    // Send email notification
    const emailNotification = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'orders@bmsupernelo.com',
        to: order.pickup.store === 'Lima' ? 'lima@bmsupernelo.com' : 'sanrafael@bmsupernelo.com',
        subject: `Nuevo pedido #${data.id}`,
        html: `Nuevo pedido para recoger en ${order.pickup.date} a las ${order.pickup.time}`
      })
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})