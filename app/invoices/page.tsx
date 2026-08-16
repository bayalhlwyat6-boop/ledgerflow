"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadInvoices() {
    setLoading(true);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("INVOICE LOAD ERROR:", error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setInvoices(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const data = invoice.extracted_data;

      const matchesSearch =
        !query ||
        data?.supplier_name?.toLowerCase().includes(query) ||
        data?.invoice_number?.toLowerCase().includes(query) ||
        invoice.file_name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const completedCount = invoices.filter(
    (invoice) => invoice.status === "completed"
  ).length;

  const processingCount = invoices.filter(
    (invoice) => invoice.status === "processing"
  ).length;

  const approvedCount = invoices.filter(
    (invoice) => invoice.status === "approved"
  ).length;

  const rejectedCount = invoices.filter(
    (invoice) => invoice.status === "rejected"
  ).length;

  const pendingCount = invoices.filter(
    (invoice) => invoice.status === "pending"
  ).length;

  const failedCount = invoices.filter(
    (invoice) => invoice.status === "failed"
  ).length;

  const totalAmount = invoices.reduce((sum, invoice) => {
    const total = invoice.extracted_data?.total;

    return sum + (typeof total === "number" ? total : 0);
  }, 0);

  const currency =
    invoices.find((invoice) => invoice.extracted_data?.currency)
      ?.extracted_data?.currency || "";

  function getStatusClass(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "approved":
        return "bg-emerald-100 text-emerald-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "completed":
        return "Completed";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      case "processing":
        return "Processing";

      case "pending":
        return "Pending";

      case "failed":
        return "Failed";

      default:
        return status;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

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
            className="inline-flex w-fit rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Dashboard
          </a>

        </div>

        {/* STATISTICS */}

        <section className="mt-8 grid gap-5 md:grid-cols-3 lg:grid-cols-6">

          {/* TOTAL */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Invoices
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {invoices.length}
            </p>

          </div>

          {/* COMPLETED */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {completedCount}
            </p>

          </div>

          {/* PROCESSING */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Processing
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {processingCount}
            </p>

          </div>

          {/* APPROVED */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {approvedCount}
            </p>

          </div>

          {/* REJECTED */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </p>

          </div>

          {/* TOTAL VALUE */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Value
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalAmount.toLocaleString()} {currency}
            </p>

          </div>

        </section>

        {/* SEARCH + FILTER */}

        <section className="mt-8 rounded-xl bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplier, invoice number or file..."
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none"
            >

              <option value="all">
                All statuses
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="failed">
                Failed
              </option>

            </select>

          </div>

          <div className="mt-3 text-sm text-slate-500">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>

        </section>

        {/* INVOICE TABLE */}

        <div className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm">

          {loading ? (

            <div className="p-8 text-slate-500">
              Loading invoices...
            </div>

          ) : filteredInvoices.length === 0 ? (

            <div className="p-12 text-center">

              <p className="text-lg font-medium text-slate-900">
                No invoices found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Supplier
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Invoice #
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Total
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Confidence
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredInvoices.map((invoice) => {

                    const data = invoice.extracted_data;

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >

                        {/* SUPPLIER */}

                        <td className="px-6 py-5">

                          <div className="font-medium text-slate-900">
                            {data?.supplier_name || "Unknown"}
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {invoice.file_name}
                          </div>

                        </td>

                        {/* INVOICE NUMBER */}

                        <td className="px-6 py-5 text-slate-600">
                          {data?.invoice_number || "—"}
                        </td>

                        {/* DATE */}

                        <td className="px-6 py-5 text-slate-600">
                          {data?.invoice_date || "—"}
                        </td>

                        {/* TOTAL */}

                        <td className="px-6 py-5 font-semibold text-slate-900">

                          {data?.total != null
                            ? data.total.toLocaleString()
                            : "—"}

                          {" "}

                          {data?.currency || ""}

                        </td>

                        {/* CONFIDENCE */}

                        <td className="px-6 py-5">

                          {data?.confidence != null ? (

                            <span
                              className={`rounded-full px-3 py-1 text-sm ${
                                data.confidence >= 0.9
                                  ? "bg-green-100 text-green-700"
                                  : data.confidence >= 0.7
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {Math.round(
                                data.confidence * 100
                              )}
                              %
                            </span>

                          ) : (

                            <span className="text-slate-400">
                              —
                            </span>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                              invoice.status
                            )}`}
                          >
                            {getStatusLabel(invoice.status)}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5">

                          <a
                            href={`/invoices/${invoice.id}`}
                            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                          >
                            Review
                          </a>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* FOOTER SUMMARY */}

        {!loading && invoices.length > 0 && (

          <div className="mt-5 flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

            <span>
              {approvedCount} approved ·{" "}
              {rejectedCount} rejected ·{" "}
              {completedCount} completed ·{" "}
              {processingCount} processing ·{" "}
              {pendingCount} pending ·{" "}
              {failedCount} failed
            </span>

            <span className="font-medium text-slate-700">

              Total value:{" "}
              {totalAmount.toLocaleString()} {currency}

            </span>

          </div>

        )}

      </div>
    </main>
  );
}