import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, address, email, variant_id } = req.body;

  try {
    const response = await fetch(
      https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/orders.json,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          order: {
            line_items: [
              { variant_id: variant_id, quantity: 1 },
              { variant_id: 8075753029679, quantity: 1 } // 90₺ kapıda ödeme ücreti
            ],
            email: email,
            phone: phone,
            billing_address: {
              name: name,
              address1: address,
              phone: phone,
              country: "TR"
            },
            shipping_address: {
              name: name,
              address1: address,
              phone: phone,
              country: "TR"
            },
            note: "Kapıda Ödeme Siparişi (Otomatik oluşturuldu)",
            tags: ["Kapıda Ödeme", "Otomatik Sipariş"],
            financial_status: "pending"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Shopify API Error:", data);
      return res.status(response.status).json({ error: data });
    }

    console.log("✅ Shopify siparişi oluşturuldu:", data);
    res.status(200).json({ success: true, order: data });
  } catch (error) {
    console.error("❌ Hata:", error);
    res.status(500).json({ error: "Shopify API error" });
  }
}
