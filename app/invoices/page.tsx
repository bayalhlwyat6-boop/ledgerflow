"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Invoice = {
  id: string;
  client_id: string;
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInvoices() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("INVOICE LOAD ERROR:", error);
      alert(error.message);
      return;
    }

    setInvoices(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Invoices
            </h1>
            <p className="mt-1 text-slate-500">
              AI-processed accounting documents
            </p>
          </div>

          <a
            href="/"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Dashboard
          </a>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-slate-500">
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No invoices yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Supplier
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Invoice #
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Total
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => {
                    const data = invoice.extracted_data;

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="font-medium text-slate-900">
                            {data?.supplier_name || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {invoice.file_name}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {data?.invoice_number || "—"}
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {data?.invoice_date || "—"}
                        </td>

                        <td className="px-6 py-5 font-semibold text-slate-900">
                          {data?.total ?? "—"}{" "}
                          {data?.currency || ""}
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                            {data?.confidence != null
                              ? `${Math.round(data.confidence * 100)}%`
                              : "—"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}