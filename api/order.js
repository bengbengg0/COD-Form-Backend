import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/draft_orders.json,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          draft_order: {
            note: "Kapıda Ödeme Siparişi",
            line_items: [{ variant_id: req.body.variant_id || 1234567890, quantity: 1 }],
            shipping_address: {
              first_name: req.body.name || "Test",
              address1: req.body.address || "Adres",
              phone: req.body.phone || "0000000000",
              country: "TR"
            },
            email: req.body.email || "test@example.com",
            tags: ["COD", "Kapıda Ödeme"]
          }
        })
      }
    );

    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Shopify API error", details: err.message });
  }
}
