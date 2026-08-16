"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Invoice = {
  id: string;
  file_name: string;
  status: string;
  extracted_data: {
    supplier_name?: string;
    invoice_number?: string;
    invoice_date?: string;
    currency?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    confidence?: number;
  } | null;
  created_at: string;
};

export default function InvoiceDetail() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    async function loadInvoice() {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("INVOICE LOAD ERROR:", error);
      } else {
        setInvoice(data);
      }

      setLoading(false);
    }

    if (id) {
      loadInvoice();
    }
  }, [id]);

  async function approveInvoice() {
    if (!invoice) return;

    if (invoice.status === "approved") {
      return;
    }

    setApproving(true);

    try {
      const { data, error } = await supabase
        .from("documents")
        .update({
          status: "approved",
        })
        .eq("id", invoice.id)
        .select("*")
        .single();

      if (error) {
        console.error("APPROVE ERROR:", error);
        throw new Error(error.message);
      }

      setInvoice(data);

      alert("Invoice approved successfully!");
    } catch (error) {
      console.error("APPROVAL ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Could not approve invoice."
      );
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-500">
            Loading invoice...
          </p>
        </div>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-500">
            Invoice not found.
          </p>
        </div>
      </main>
    );
  }

  const data = invoice.extracted_data;
  const isApproved = invoice.status === "approved";

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">

        <a
          href="/invoices"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to invoices
        </a>

        <div className="mt-6 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Invoice Review
            </h1>

            <p className="mt-1 text-slate-500">
              {invoice.file_name}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm ${
              isApproved
                ? "bg-blue-100 text-blue-700"
                : invoice.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {invoice.status}
          </span>

        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-2">

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold">
              Extracted Data
            </h2>

            <div className="mt-6 space-y-5">

              <div>
                <p className="text-sm text-slate-500">
                  Supplier
                </p>

                <p className="font-medium text-slate-900">
                  {data?.supplier_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Invoice Number
                </p>

                <p className="font-medium text-slate-900">
                  {data?.invoice_number || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Invoice Date
                </p>

                <p className="font-medium text-slate-900">
                  {data?.invoice_date || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Subtotal
                </p>

                <p className="font-medium text-slate-900">
                  {data?.subtotal ?? "—"}{" "}
                  {data?.currency || ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Tax
                </p>

                <p className="font-medium text-slate-900">
                  {data?.tax ?? "—"}{" "}
                  {data?.currency || ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {data?.total ?? "—"}{" "}
                  {data?.currency || ""}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold">
              AI Confidence
            </h2>

            <div className="mt-8">

              <div className="text-5xl font-bold text-slate-900">
                {data?.confidence != null
                  ? `${Math.round(
                      data.confidence * 100
                    )}%`
                  : "—"}
              </div>

              <p className="mt-3 text-slate-500">
                Confidence score from AI extraction.
              </p>

            </div>

            <div className="mt-8 rounded-lg bg-slate-50 p-5">

              <p className="text-sm font-medium text-slate-900">
                Review recommendation
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {isApproved
                  ? "Invoice has been approved."
                  : data?.confidence != null &&
                    data.confidence >= 0.9
                  ? "High confidence — ready for approval."
                  : "Human review recommended before approval."}
              </p>

            </div>

            <button
              onClick={approveInvoice}
              disabled={
                approving ||
                isApproved ||
                invoice.status !== "completed"
              }
              className={`mt-8 w-full rounded-lg px-5 py-3 font-medium text-white ${
                isApproved
                  ? "cursor-not-allowed bg-blue-600"
                  : invoice.status !== "completed"
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {approving
                ? "Approving..."
                : isApproved
                ? "Invoice Approved ✓"
                : "Approve Invoice"}
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}