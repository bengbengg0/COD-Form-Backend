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
        line_items: [
          { variant_id: req.body.variant_id || 1234567890, quantity: 1 },
        ],
        shipping_address: {
          first_name: req.body.name || "Test",
          address1: req.body.address || "Adres",
          phone: req.body.phone || "0000000000",
          country: "TR",
        },
        email: req.body.email || "test@example.com",
        tags: ["COD", "Kapıda Ödeme"],
      },
    }),
  }
);
