import fetch from "node-fetch";

export default async function handler(req, res) {
  // CORS izinleri
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, address, email, variant_id } = req.body;

  if (!name || !phone || !address || !email || !variant_id) {
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });
  }

  try {
    // 🔹 Shopify Draft Order API'yi kullanıyoruz
    const draftData = {
      draft_order: {
        line_items: [
          { variant_id: Number(variant_id), quantity: 1 },
          { variant_id: 8075753029679, quantity: 1 } // Kapıda ödeme ücreti
        ],
        note: "Kapıda Ödeme Siparişi (Otomatik oluşturuldu)",
        tags: ["Kapıda Ödeme", "Otomatik Sipariş"],
        customer: {
          first_name: name.split(" ")[0],
          last_name: name.split(" ")[1] || "",
          email: email,
          phone: phone
        },
        shipping_address: {
          name: name,
          address1: address,
          phone: phone,
          country: "TR"
        },
        billing_address: {
          name: name,
          address1: address,
          phone: phone,
          country: "TR"
        },
        email: email,
        use_customer_default_address: false
      }
    };

    console.log("🚀 Shopify’a gönderilen veri:", JSON.stringify(draftData, null, 2));

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN
        },
        body: JSON.stringify(draftData)
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

    console.log("✅ Taslak sipariş oluşturuldu:", data);
    return res.status(200).json({ success: true, order: data });
  } catch (error) {
    console.error("🔥 Sunucu hatası:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
