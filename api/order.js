import fetch from "node-fetch";

export default async function handler(req, res) {
  // Sadece POST isteklerine izin ver
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, address, email, variant_id } = req.body;

  // Girdi kontrolü
  if (!name || !phone || !address || !email || !variant_id) {
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });
  }

  try {
    // 🔍 Log: gelen body
    console.log("📦 Gelen body:", req.body);

    // Shopify sipariş verisi
    const orderData = {
      order: {
        line_items: [
          { variant_id: Number(variant_id), quantity: 1 },
          { variant_id: 8075753029679, quantity: 1 } // 90₺ kapıda ödeme ücreti varyantı
        ],
        email,
        phone,
        billing_address: {
          name,
          address1: address,
          phone,
          country: "TR"
        },
        shipping_address: {
          name,
          address1: address,
          phone,
          country: "TR"
        },
        note: "Kapıda Ödeme Siparişi (Otomatik oluşturuldu)",
        tags: ["Kapıda Ödeme", "Otomatik Sipariş"],
        financial_status: "pending"
      }
    };

    // 🔍 Log: gönderilen veri
    console.log("🚀 Shopify’a gönderilen sipariş:", JSON.stringify(orderData, null, 2));

    // Shopify API isteği
    const shopifyResponse = await fetch(
      https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/orders.json,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN
        },
        body: JSON.stringify(orderData)
      }
    );

    const shopifyText = await shopifyResponse.text();

    // 🔍 Log: Shopify yanıtı
    console.log("🔙 Shopify status:", shopifyResponse.status);
    console.log("🔙 Shopify response:", shopifyText);

    // Yanıt JSON değilse hata döndürme
    let shopifyData;
    try {
      shopifyData = JSON.parse(shopifyText);
    } catch {
      shopifyData = { raw: shopifyText };
    }

    if (!shopifyResponse.ok) {
      console.error("❌ Shopify API Hatası:", shopifyData);
      return res.status(shopifyResponse.status).json({
        error: shopifyData,
        message: "Shopify sipariş oluşturma başarısız."
      });
    }

    console.log("✅ Shopify siparişi oluşturuldu:", shopifyData);
    return res.status(200).json({ success: true, order: shopifyData });
  } catch (err) {
    console.error("❌ Sunucu hatası:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
