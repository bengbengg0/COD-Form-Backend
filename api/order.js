import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          draft_order: {
            note: "Kapıda Ödeme Siparişi",
            line_items: [
              {
                variant_id: req.body.variant_id,
                quantity: 1,
              },
            ],
            shipping_address: {
              first_name: req.body.name,
              address1: req.body.address,
              phone: req.body.phone,
              country: "TR",
            },
            email: req.body.email,
            tags: ["COD", "Kapıda Ödeme"],
          },
        }),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Shopify API Error:", err);
    res.status(500).json({ error: "Shopify API error" });
  }
}
