// Cloudflare Pages Function
// 路径: functions/api/order.js
// 访问地址自动变成: https://你的域名/api/order

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    // 基本校验
    if (!data.product || !data.size || !data.days || !data.contact) {
      return new Response(JSON.stringify({ ok: false, error: "缺少字段" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 组装订单记录
    const order = {
      product: String(data.product).slice(0, 100),
      size: String(data.size).slice(0, 20),
      days: Number(data.days),
      contact: String(data.contact).slice(0, 100),
      createdAt: new Date().toISOString(),
      ip: request.headers.get("CF-Connecting-IP") || "",
    };

    // 写入 KV，key 用时间戳+随机数，方便后台翻看
    const key = `order:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    await env.ORDERS.put(key, JSON.stringify(order));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// 阻止直接GET访问
export async function onRequestGet() {
  return new Response("Method Not Allowed", { status: 405 });
}
