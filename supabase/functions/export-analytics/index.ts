import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  organizationId: string;
  format: "excel" | "pdf";
  period: "week" | "month" | "quarter" | "year";
  startDate?: string;
  endDate?: string;
}

function generateCSV(data: Record<string, unknown>[], headers: string[]): string {
  const headerRow = headers.join(";");
  const rows = data.map(row => 
    headers.map(h => {
      const value = row[h];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(";")) return `"${value}"`;
      return String(value);
    }).join(";")
  );
  return [headerRow, ...rows].join("\n");
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(amount);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { organizationId, format, period, startDate, endDate }: ExportRequest = await req.json();

    console.log(`Exporting analytics for org ${organizationId}, format: ${format}, period: ${period}`);

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single();

    if (orgError) throw new Error("Organization not found");

    // Calculate date range
    const now = new Date();
    let start = new Date();
    let end = now;

    switch (period) {
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(now.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);

    // Get members with spending
    const { data: members, error: membersError } = await supabase
      .from("org_members")
      .select("user_id, role, monthly_limit, current_month_spent")
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    if (membersError) throw membersError;

    // Get profiles
    const userIds = members?.map(m => m.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, email")
      .in("user_id", userIds);

    // Create employee spending data
    const employeeData = members?.map(member => {
      const profile = profiles?.find(p => p.user_id === member.user_id);
      return {
        "Сотрудник": profile?.display_name || "Неизвестно",
        "Email": profile?.email || "-",
        "Роль": member.role === "admin" ? "Администратор" : member.role === "manager" ? "Менеджер" : "Сотрудник",
        "Лимит": member.monthly_limit,
        "Потрачено": member.current_month_spent,
        "Остаток": member.monthly_limit - member.current_month_spent,
        "% использования": Math.round((member.current_month_spent / member.monthly_limit) * 100),
      };
    }) || [];

    // Get balance transactions for category breakdown
    const { data: transactions } = await supabase
      .from("org_balance_transactions")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("type", "expense")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    // Category summary (mock data for demo, would be based on real transactions)
    const categoryData = [
      { "Категория": "Обеды", "Сумма": 45000, "Доля %": 47 },
      { "Категория": "Офисная кухня", "Сумма": 18500, "Доля %": 19 },
      { "Категория": "Корпоративы", "Сумма": 25000, "Доля %": 26 },
      { "Категория": "Прочее", "Сумма": 7000, "Доля %": 8 },
    ];

    // Generate report
    const totalSpent = members?.reduce((sum, m) => sum + m.current_month_spent, 0) || 0;
    const totalLimit = members?.reduce((sum, m) => sum + m.monthly_limit, 0) || 0;

    if (format === "excel") {
      // Generate CSV (Excel-compatible)
      const reportHeader = [
        `Аналитический отчёт: ${org.name}`,
        `Период: ${formatDate(start)} - ${formatDate(end)}`,
        `Дата формирования: ${formatDate(now)}`,
        "",
        `Общая сумма расходов: ${formatCurrency(totalSpent)}`,
        `Общий лимит: ${formatCurrency(totalLimit)}`,
        `Использование бюджета: ${Math.round((totalSpent / totalLimit) * 100)}%`,
        "",
      ].join("\n");

      const employeeCSV = generateCSV(employeeData, ["Сотрудник", "Email", "Роль", "Лимит", "Потрачено", "Остаток", "% использования"]);
      const categoryCSV = generateCSV(categoryData, ["Категория", "Сумма", "Доля %"]);

      const fullReport = [
        reportHeader,
        "РАСХОДЫ ПО СОТРУДНИКАМ",
        employeeCSV,
        "",
        "РАСХОДЫ ПО КАТЕГОРИЯМ",
        categoryCSV,
      ].join("\n");

      // Add BOM for proper UTF-8 encoding in Excel
      const bom = "\uFEFF";
      const csvContent = bom + fullReport;

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="analytics_${period}_${formatDate(now).replace(/\./g, "-")}.csv"`,
          ...corsHeaders,
        },
      });
    } else {
      // Generate HTML for PDF (will be converted client-side)
      const html = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>Аналитический отчёт</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            .summary { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>📊 Аналитический отчёт</h1>
          <p><strong>Организация:</strong> ${org.name}</p>
          <p><strong>Период:</strong> ${formatDate(start)} - ${formatDate(end)}</p>
          <p><strong>Дата формирования:</strong> ${formatDate(now)}</p>
          
          <div class="summary">
            <p><strong>💰 Общая сумма расходов:</strong> ${formatCurrency(totalSpent)}</p>
            <p><strong>📊 Общий лимит:</strong> ${formatCurrency(totalLimit)}</p>
            <p><strong>📈 Использование бюджета:</strong> ${Math.round((totalSpent / totalLimit) * 100)}%</p>
          </div>
          
          <h2>👥 Расходы по сотрудникам</h2>
          <table>
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Лимит</th>
                <th>Потрачено</th>
                <th>Остаток</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              ${employeeData.map(emp => `
                <tr>
                  <td>${emp["Сотрудник"]}</td>
                  <td>${emp["Email"]}</td>
                  <td>${emp["Роль"]}</td>
                  <td>${formatCurrency(emp["Лимит"])}</td>
                  <td>${formatCurrency(emp["Потрачено"])}</td>
                  <td>${formatCurrency(emp["Остаток"])}</td>
                  <td>${emp["% использования"]}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <h2>📂 Расходы по категориям</h2>
          <table>
            <thead>
              <tr>
                <th>Категория</th>
                <th>Сумма</th>
                <th>Доля</th>
              </tr>
            </thead>
            <tbody>
              ${categoryData.map(cat => `
                <tr>
                  <td>${cat["Категория"]}</td>
                  <td>${formatCurrency(cat["Сумма"])}</td>
                  <td>${cat["Доля %"]}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders,
        },
      });
    }
  } catch (error: unknown) {
    console.error("Error in export-analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
