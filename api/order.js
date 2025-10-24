import fetch from "node-fetch";

export default async function handler(req, res) {
  // ✅ Yalnızca POST izinli
  if (req.method !== "POST") {
    console.log("⛔ Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, address, email, variant_id } = req.body;

  if (!name || !phone || !address || !email || !variant_id) {
    console.log("⚠ Eksik alan:", req.body);
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });
  }

  try {
    const orderData = {
      order: {
        line_items: [
          { variant_id: Number(variant_id), quantity: 1 },
          { variant_id: 8075753029679, quantity: 1 } // Kapıda ödeme ücreti (90₺)
        ],
        email,
        phone,
        billing_address: { name, address1: address, phone, country: "TR" },
        shipping_address: { name, address1: address, phone, country: "TR" },
        note: "Kapıda Ödeme Siparişi (Otomatik oluşturuldu)",
        tags: ["Kapıda Ödeme", "Otomatik Sipariş"],
        financial_status: "pending"
      }
    };

    console.log("🚀 Shopify’a gönderilen veri:", JSON.stringify(orderData, null, 2));

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN
        },
        body: JSON.stringify(orderData)
      }
    );

    const text = await response.text();
    console.log("🔙 Shopify status:", response.status);
    console.log("🔙 Shopify response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("❌ Shopify API hatası:", data);
      return res.status(response.status).json({ error: data });
    }

    console.log("✅ Sipariş başarıyla oluşturuldu:", data);
    return res.status(200).json({ success: true, order: data });
  } catch (error) {
    console.error("🔥 Sunucu hatası:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
