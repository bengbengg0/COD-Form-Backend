export default async function handler(req, res) {
  // CORS ayarları (Shopify bağlantısı için şart)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Shopify preflight isteği için
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // JSON body parse et
    const { variant_id, name, phone, address, email } = req.body;

    // Zorunlu alan kontrolü
    if (!variant_id || !name || !phone || !address || !email) {
      return res.status(400).json({ error: 'Eksik bilgi gönderildi.' });
    }

    console.log('✅ Yeni sipariş alındı:', { variant_id, name, phone, address, email });

    // Burada senin backend sipariş işlemini veya e-posta bildirimi gibi bir işlem yapabilirsin.
    // Şimdilik sadece başarı mesajı döndürür.

    return res.status(200).json({
      success: true,
      message: 'Order received successfully',
      received: { variant_id, name, phone, address, email }
    });

  } catch (err) {
    console.error('❌ Hata:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
