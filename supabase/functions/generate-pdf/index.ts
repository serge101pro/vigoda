import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  type: 'invoice' | 'upd';
  organizationId: string;
  amount?: number;
  periodStart?: string;
  periodEnd?: string;
}

// Simple PDF generation (Base64 encoded) - for production use a library like pdf-lib
function generateInvoicePDF(
  invoiceNumber: string,
  organization: any,
  amount: number,
  dueDate: string
): string {
  // This creates a simple text-based PDF structure
  // In production, use pdf-lib or jsPDF for proper PDF generation
  const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 24 Tf
50 700 Td
(СЧЕТ НА ОПЛАТУ) Tj
/F1 14 Tf
0 -40 Td
(Счет № ${invoiceNumber}) Tj
0 -25 Td
(Дата: ${new Date().toLocaleDateString('ru-RU')}) Tj
0 -25 Td
(Срок оплаты: ${dueDate}) Tj
0 -40 Td
(Плательщик: ${organization.name || 'Организация'}) Tj
0 -25 Td
(ИНН: ${organization.inn || 'Не указан'}) Tj
0 -25 Td
(КПП: ${organization.kpp || 'Не указан'}) Tj
0 -25 Td
(Адрес: ${organization.legal_address || 'Не указан'}) Tj
0 -50 Td
/F1 18 Tf
(ИТОГО К ОПЛАТЕ: ${amount.toLocaleString('ru-RU')} руб.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000818 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
897
%%EOF
`;
  return btoa(content);
}

function generateUPDPDF(
  documentNumber: string,
  organization: any,
  periodStart: string,
  periodEnd: string,
  totalAmount: number
): string {
  const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 600 >>
stream
BT
/F1 20 Tf
50 700 Td
(УНИВЕРСАЛЬНЫЙ ПЕРЕДАТОЧНЫЙ ДОКУМЕНТ) Tj
/F1 14 Tf
0 -40 Td
(Документ № ${documentNumber}) Tj
0 -25 Td
(Период: ${periodStart} - ${periodEnd}) Tj
0 -25 Td
(Дата формирования: ${new Date().toLocaleDateString('ru-RU')}) Tj
0 -40 Td
(Получатель: ${organization.name || 'Организация'}) Tj
0 -25 Td
(ИНН: ${organization.inn || 'Не указан'}) Tj
0 -25 Td
(КПП: ${organization.kpp || 'Не указан'}) Tj
0 -25 Td
(Адрес: ${organization.legal_address || 'Не указан'}) Tj
0 -50 Td
/F1 16 Tf
(Услуги за период:) Tj
0 -25 Td
(- Доставка продуктов питания) Tj
0 -25 Td
(- Организация корпоративного питания) Tj
0 -40 Td
/F1 18 Tf
(ИТОГО: ${totalAmount.toLocaleString('ru-RU')} руб.) Tj
0 -25 Td
(НДС (20%): ${Math.round(totalAmount * 0.2).toLocaleString('ru-RU')} руб.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000918 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
997
%%EOF
`;
  return btoa(content);
}

const handler = async (req: Request): Promise<Response> => {
  console.log("generate-pdf function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, organizationId, amount, periodStart, periodEnd }: InvoiceRequest = await req.json();

    console.log("Request params:", { type, organizationId, amount, periodStart, periodEnd });

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (orgError || !organization) {
      console.error("Organization not found:", orgError);
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let pdfBase64: string;
    let documentData: any;

    if (type === "invoice") {
      // Generate invoice
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const dueDateStr = dueDate.toLocaleDateString("ru-RU");

      pdfBase64 = generateInvoicePDF(invoiceNumber, organization, amount || 0, dueDateStr);

      // Save invoice to database
      const { data: invoice, error: invoiceError } = await supabase
        .from("org_invoices")
        .insert({
          organization_id: organizationId,
          invoice_number: invoiceNumber,
          amount: amount || 0,
          status: "pending",
          due_date: dueDate.toISOString().split("T")[0],
          pdf_url: `data:application/pdf;base64,${pdfBase64}`,
        })
        .select()
        .single();

      if (invoiceError) {
        console.error("Error saving invoice:", invoiceError);
        throw invoiceError;
      }

      documentData = invoice;
      console.log("Invoice created:", invoiceNumber);

    } else if (type === "upd") {
      // Generate UPD
      const documentNumber = `UPD-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculate total amount for the period
      const { data: transactions, error: txError } = await supabase
        .from("org_balance_transactions")
        .select("amount")
        .eq("organization_id", organizationId)
        .eq("type", "order_payment")
        .gte("created_at", periodStart)
        .lte("created_at", periodEnd);

      const totalAmount = transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || amount || 0;

      pdfBase64 = generateUPDPDF(
        documentNumber,
        organization,
        new Date(periodStart!).toLocaleDateString("ru-RU"),
        new Date(periodEnd!).toLocaleDateString("ru-RU"),
        totalAmount
      );

      // Save UPD to database
      const { data: upd, error: updError } = await supabase
        .from("org_upd_documents")
        .insert({
          organization_id: organizationId,
          document_number: documentNumber,
          period_start: periodStart,
          period_end: periodEnd,
          total_amount: totalAmount,
          pdf_url: `data:application/pdf;base64,${pdfBase64}`,
        })
        .select()
        .single();

      if (updError) {
        console.error("Error saving UPD:", updError);
        throw updError;
      }

      documentData = upd;
      console.log("UPD created:", documentNumber);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid document type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: documentData,
        pdfBase64,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in generate-pdf function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
