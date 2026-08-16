"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Invoice = {
  id: string;
  client_id: string;
  file_name: string;
  status: string;
  rejection_reason: string | null;
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

type AuditLog = {
  id: string;
  document_id: string;
  action: string;
  details: string | null;
  old_status: string | null;
  new_status: string | null;
  created_at: string;
};

export default function InvoiceDetail() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  /*
   * =========================
   * LOAD INVOICE
   * =========================
   */

  async function loadInvoice() {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("INVOICE LOAD ERROR:", error);
      setInvoice(null);
    } else {
      setInvoice(data);
      setRejectionReason(data.rejection_reason || "");
    }

    setLoading(false);
  }

  /*
   * =========================
   * LOAD AUDIT LOGS
   * =========================
   */

  async function loadAuditLogs() {
    if (!id) return;

    setLoadingLogs(true);

    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        `
        id,
        document_id,
        action,
        details,
        old_status,
        new_status,
        created_at
        `
      )
      .eq("document_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("AUDIT LOG LOAD ERROR:", error);
      setAuditLogs([]);
    } else {
      setAuditLogs(data ?? []);
    }

    setLoadingLogs(false);
  }

  /*
   * =========================
   * REFRESH
   * =========================
   */

  async function refreshData() {
    await Promise.all([
      loadInvoice(),
      loadAuditLogs(),
    ]);
  }

  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {
    if (!id) return;

    refreshData();
  }, [id]);

  /*
   * =========================
   * APPROVE INVOICE
   * =========================
   */

  async function approveInvoice() {
    if (!invoice) return;

    if (invoice.status === "approved") {
      return;
    }

    if (invoice.status !== "completed") {
      alert(
        "Only completed invoices can be approved."
      );
      return;
    }

    setApproving(true);

    try {
      /*
       * Update invoice
       */

      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status: "approved",
          rejection_reason: null,
        })
        .eq("id", invoice.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      /*
       * Create audit log
       */

      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          document_id: invoice.id,
          action: "Invoice approved",
          details:
            "Invoice manually approved by administrator.",
          old_status: "completed",
          new_status: "approved",
        });

      if (auditError) {
        console.error(
          "AUDIT LOG ERROR:",
          auditError
        );
      }

      await refreshData();

      alert(
        "Invoice approved successfully!"
      );
    } catch (error) {
      console.error(
        "APPROVAL ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Could not approve invoice."
      );
    } finally {
      setApproving(false);
    }
  }

  /*
   * =========================
   * REJECT INVOICE
   * =========================
   */

  async function rejectInvoice() {
    if (!invoice) return;

    if (invoice.status === "rejected") {
      return;
    }

    if (invoice.status !== "completed") {
      alert(
        "Only completed invoices can be rejected."
      );
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      alert(
        "Please enter a rejection reason."
      );
      return;
    }

    setRejecting(true);

    try {
      /*
       * Update invoice
       */

      const { error: updateError } =
        await supabase
          .from("documents")
          .update({
            status: "rejected",
            rejection_reason: reason,
          })
          .eq("id", invoice.id);

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      /*
       * Create audit log
       */

      const { error: auditError } =
        await supabase
          .from("audit_logs")
          .insert({
            document_id: invoice.id,
            action: "Invoice rejected",
            details: reason,
            old_status: "completed",
            new_status: "rejected",
          });

      if (auditError) {
        console.error(
          "AUDIT LOG ERROR:",
          auditError
        );
      }

      setShowRejectForm(false);

      await refreshData();

      alert(
        "Invoice rejected successfully!"
      );
    } catch (error) {
      console.error(
        "REJECTION ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Could not reject invoice."
      );
    } finally {
      setRejecting(false);
    }
  }

  /*
   * =========================
   * FORMAT DATE
   * =========================
   */

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  /*
   * =========================
   * STATUS STYLE
   * =========================
   */

  function getStatusClass(
    status: string
  ) {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "completed":
        return "bg-green-100 text-green-700";

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

  /*
   * =========================
   * LOADING
   * =========================
   */

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

  /*
   * =========================
   * NOT FOUND
   * =========================
   */

  if (!invoice) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">

          <a
            href="/admin"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to admin
          </a>

          <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
            <p className="text-slate-500">
              Invoice not found.
            </p>
          </div>

        </div>
      </main>
    );
  }

  /*
   * =========================
   * DATA
   * =========================
   */

  const data =
    invoice.extracted_data;

  const isApproved =
    invoice.status === "approved";

  const isRejected =
    invoice.status === "rejected";

  const isCompleted =
    invoice.status === "completed";

  const confidence =
    data?.confidence != null
      ? Math.round(
          data.confidence * 100
        )
      : null;

  /*
   * =========================
   * PAGE
   * =========================
   */

  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <div className="mx-auto max-w-5xl">

        {/* BACK */}

        <a
          href="/admin"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to admin
        </a>

        {/* HEADER */}

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Invoice Review
            </h1>

            <p className="mt-1 text-slate-500">
              {invoice.file_name}
            </p>

          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusClass(
              invoice.status
            )}`}
          >
            {invoice.status}
          </span>

        </div>

        {/* REJECTED NOTICE */}

        {isRejected && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">

            <p className="font-semibold text-red-800">
              Invoice Rejected
            </p>

            <p className="mt-2 text-sm text-red-700">
              This invoice was rejected and
              requires correction or review.
            </p>

            {invoice.rejection_reason && (
              <div className="mt-4 rounded-lg bg-white p-4">

                <p className="text-sm font-medium text-slate-700">
                  Rejection Reason
                </p>

                <p className="mt-1 text-slate-900">
                  {invoice.rejection_reason}
                </p>

              </div>
            )}

          </div>
        )}

        {/* APPROVED NOTICE */}

        {isApproved && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">

            <p className="font-semibold text-emerald-800">
              Invoice Approved
            </p>

            <p className="mt-2 text-sm text-emerald-700">
              This invoice has been reviewed
              and approved.
            </p>

          </div>
        )}

        {/* MAIN DATA */}

        <section className="mt-8 grid gap-5 md:grid-cols-2">

          {/* EXTRACTED DATA */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
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

                <p className="text-3xl font-bold text-slate-900">
                  {data?.total ?? "—"}{" "}
                  {data?.currency || ""}
                </p>
              </div>

            </div>

          </div>

          {/* AI REVIEW */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              AI Confidence
            </h2>

            <div className="mt-8">

              <div className="text-5xl font-bold text-slate-900">
                {confidence != null
                  ? `${confidence}%`
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
                  : isRejected
                  ? "Invoice has been rejected."
                  : confidence != null &&
                    confidence >= 90
                  ? "High confidence — ready for approval."
                  : "Human review recommended before approval."}

              </p>

            </div>

            {/* ACTIONS */}

            {isCompleted && (
              <div className="mt-8 space-y-3">

                <button
                  onClick={approveInvoice}
                  disabled={
                    approving ||
                    rejecting
                  }
                  className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {approving
                    ? "Approving..."
                    : "✓ Approve Invoice"}
                </button>

                <button
                  onClick={() =>
                    setShowRejectForm(
                      !showRejectForm
                    )
                  }
                  disabled={
                    approving ||
                    rejecting
                  }
                  className="w-full rounded-lg border border-red-300 bg-white px-5 py-3 font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ✕ Reject Invoice
                </button>

              </div>
            )}

            {/* REJECT FORM */}

            {showRejectForm &&
              isCompleted && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5">

                  <label className="text-sm font-medium text-red-800">
                    Rejection Reason
                  </label>

                  <textarea
                    value={rejectionReason}
                    onChange={(e) =>
                      setRejectionReason(
                        e.target.value
                      )
                    }
                    placeholder="Explain why this invoice should be rejected..."
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-400"
                  />

                  <div className="mt-3 flex gap-3">

                    <button
                      onClick={rejectInvoice}
                      disabled={
                        rejecting ||
                        approving ||
                        !rejectionReason.trim()
                      }
                      className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {rejecting
                        ? "Rejecting..."
                        : "Confirm Rejection"}
                    </button>

                    <button
                      onClick={() =>
                        setShowRejectForm(
                          false
                        )
                      }
                      disabled={rejecting}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                  </div>

                </div>
              )}

            {/* APPROVED STATE */}

            {isApproved && (
              <div className="mt-8 w-full rounded-lg bg-emerald-600 px-5 py-3 text-center font-medium text-white">
                Invoice Approved ✓
              </div>
            )}

            {/* REJECTED STATE */}

            {isRejected && (
              <div className="mt-8 w-full rounded-lg bg-red-600 px-5 py-3 text-center font-medium text-white">
                Invoice Rejected ✕
              </div>
            )}

          </div>

        </section>

        {/* AUDIT LOG */}

        <section className="mt-8 rounded-xl bg-white p-7 shadow-sm">

          <div>

            <h2 className="text-xl font-semibold text-slate-900">
              Audit Log
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete activity history for this invoice.
            </p>

          </div>

          {loadingLogs ? (

            <div className="mt-6 text-sm text-slate-500">
              Loading activity...
            </div>

          ) : auditLogs.length === 0 ? (

            <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">

              <p className="font-medium text-slate-900">
                No activity yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Invoice activity will appear here.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {auditLogs.map(
                (log) => (

                  <div
                    key={log.id}
                    className="rounded-lg border border-slate-200 p-5"
                  >

                    <div className="flex gap-4">

                      <div
                        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                          log.new_status ===
                          "approved"
                            ? "bg-emerald-500"
                            : log.new_status ===
                              "rejected"
                            ? "bg-red-500"
                            : log.new_status ===
                              "completed"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      />

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                          <p className="font-semibold text-slate-900">
                            {log.action}
                          </p>

                          <p className="text-xs text-slate-400">
                            {formatDate(
                              log.created_at
                            )}
                          </p>

                        </div>

                        {(log.old_status ||
                          log.new_status) && (

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">

                            {log.old_status && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                                {log.old_status}
                              </span>
                            )}

                            {log.old_status &&
                              log.new_status && (
                                <span className="text-slate-400">
                                  →
                                </span>
                              )}

                            {log.new_status && (
                              <span
                                className={`rounded-full px-3 py-1 ${getStatusClass(
                                  log.new_status
                                )}`}
                              >
                                {log.new_status}
                              </span>
                            )}

                          </div>

                        )}

                        {log.details && (
                          <div className="mt-4 rounded-lg bg-slate-50 p-4">

                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Details
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                              {log.details}
                            </p>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}