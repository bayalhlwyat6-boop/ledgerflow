"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "user";
  created_at: string | null;
};

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string | null;
};

type ExtractedData = {
  supplier_name?: string;
  total?: number;
  currency?: string;
  invoice_number?: string;
  invoice_date?: string;
  confidence?: number;
};

type Document = {
  id: string;
  client_id: string | null;
  file_name: string;
  document_type: string | null;
  status: string | null;
  confidence: number | null;
  created_at: string | null;
  extracted_data: ExtractedData | null;
  processed_at: string | null;
  rejection_reason: string | null;
};

const STATUS_OPTIONS = [
  "approved",
  "completed",
  "processing",
  "pending",
  "rejected",
  "failed",
];

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * =========================
   * AUTHENTICATION
   * =========================
   */

  async function checkAdmin() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return false;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id,email,full_name,role,created_at"
        )
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error(
          "PROFILE ERROR:",
          profileError
        );

        router.replace("/");
        return false;
      }

      if (profileData.role !== "admin") {
        router.replace("/");
        return false;
      }

      setProfile(profileData);
      setAuthorized(true);

      return true;
    } catch (error) {
      console.error(
        "ADMIN AUTH ERROR:",
        error
      );

      router.replace("/login");
      return false;
    }
  }

  /*
   * =========================
   * LOAD DATA
   * =========================
   */

  async function loadData(
    showRefresh = false
  ) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        clientsResult,
        documentsResult,
      ] = await Promise.all([
        supabase
          .from("clients")
          .select(
            "id,name,email,phone,created_at"
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("documents")
          .select(
            `
              id,
              client_id,
              file_name,
              document_type,
              status,
              confidence,
              created_at,
              extracted_data,
              processed_at,
              rejection_reason
            `
          )
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (clientsResult.error) {
        console.error(
          "CLIENTS ERROR:",
          clientsResult.error
        );
      }

      if (documentsResult.error) {
        console.error(
          "DOCUMENTS ERROR:",
          documentsResult.error
        );
      }

      setClients(
        clientsResult.data ?? []
      );

      setDocuments(
        documentsResult.data ?? []
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /*
   * =========================
   * INITIALIZATION
   * =========================
   */

  useEffect(() => {
    async function initialize() {
      const isAdmin =
        await checkAdmin();

      if (isAdmin) {
        await loadData();
      }
    }

    initialize();
  }, []);

  /*
   * =========================
   * LOGOUT
   * =========================
   */

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  /*
   * =========================
   * STATISTICS
   * =========================
   */

  const totalClients =
    clients.length;

  const totalInvoices =
    documents.length;

  const approvedInvoices =
    documents.filter(
      (doc) =>
        doc.status === "approved"
    );

  const completedInvoices =
    documents.filter(
      (doc) =>
        doc.status === "completed"
    );

  const processingInvoices =
    documents.filter(
      (doc) =>
        doc.status === "processing"
    );

  const pendingInvoices =
    documents.filter(
      (doc) =>
        doc.status === "pending"
    );

  const rejectedInvoices =
    documents.filter(
      (doc) =>
        doc.status === "rejected"
    );

  const failedInvoices =
    documents.filter(
      (doc) =>
        doc.status === "failed"
    );

  /*
   * =========================
   * NEEDS REVIEW
   * =========================
   */

  const needsReview =
    documents.filter((doc) => {
      if (
        doc.status === "rejected" ||
        doc.status === "failed"
      ) {
        return true;
      }

      if (doc.status === "completed") {
        const data =
          doc.extracted_data;

        if (!data?.supplier_name) {
          return true;
        }

        if (data.total == null) {
          return true;
        }

        if (
          data.confidence != null &&
          data.confidence < 0.9
        ) {
          return true;
        }
      }

      return false;
    });

  /*
   * =========================
   * FINANCIALS
   * =========================
   */

  function getTotal(
    invoice: Document
  ) {
    const total =
      invoice.extracted_data?.total;

    return typeof total === "number"
      ? total
      : 0;
  }

  const totalValue =
    documents.reduce(
      (sum, doc) =>
        sum + getTotal(doc),
      0
    );

  const approvedValue =
    approvedInvoices.reduce(
      (sum, doc) =>
        sum + getTotal(doc),
      0
    );

  const completedValue =
    completedInvoices.reduce(
      (sum, doc) =>
        sum + getTotal(doc),
      0
    );

  const rejectedValue =
    rejectedInvoices.reduce(
      (sum, doc) =>
        sum + getTotal(doc),
      0
    );

  const currency =
    documents.find(
      (doc) =>
        doc.extracted_data?.currency
    )?.extracted_data?.currency || "";

  /*
   * =========================
   * APPROVAL RATE
   * =========================
   */

  const reviewableInvoices =
    documents.filter(
      (doc) =>
        doc.status === "approved" ||
        doc.status === "completed" ||
        doc.status === "rejected"
    );

  const approvalRate =
    reviewableInvoices.length > 0
      ? Math.round(
          (approvedInvoices.length /
            reviewableInvoices.length) *
            100
        )
      : 0;

  /*
   * =========================
   * MONTH END
   * =========================
   */

  const monthEndReady =
    totalInvoices > 0
      ? Math.round(
          (approvedInvoices.length /
            totalInvoices) *
            100
        )
      : 0;

  /*
   * =========================
   * MONEY FORMAT
   * =========================
   */

  function formatMoney(
    value: number
  ) {
    return `${value.toLocaleString()} ${
      currency
    }`;
  }

  /*
   * =========================
   * FILTERED DOCUMENTS
   * =========================
   */

  const filteredDocuments =
    useMemo(() => {
      return documents.filter(
        (doc) => {
          const data =
            doc.extracted_data;

          const searchText =
            `
              ${data?.supplier_name || ""}
              ${data?.invoice_number || ""}
              ${doc.file_name}
              ${doc.document_type || ""}
              ${doc.status || ""}
            `.toLowerCase();

          const matchesSearch =
            searchText.includes(
              search
                .trim()
                .toLowerCase()
            );

          const matchesStatus =
            statusFilter === "all" ||
            doc.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      documents,
      search,
      statusFilter,
    ]);

  /*
   * =========================
   * STATUS STYLE
   * =========================
   */

  function statusClass(
    status: string | null
  ) {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

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

  if (loading || !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="rounded-2xl bg-white px-10 py-8 text-center shadow-sm ring-1 ring-slate-200">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
            L
          </div>

          <p className="font-medium text-slate-900">
            Loading admin dashboard...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Checking administrator access
          </p>

        </div>

      </main>
    );
  }

  /*
   * =========================
   * ADMIN DASHBOARD
   * =========================
   */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
              L
            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                LedgerFlow
              </h1>

              <p className="text-xs text-slate-500">
                Admin Dashboard
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden text-right lg:block">

              <p className="text-sm font-semibold text-slate-900">
                {profile?.full_name ||
                  "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                {profile?.email}
              </p>

              <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Admin
              </span>

            </div>

            <a
              href="/"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Main Dashboard
            </a>

            <button
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Sign Out
            </button>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* TITLE */}

        <section className="mb-8">

          <p className="text-sm font-semibold text-slate-500">
            Administration
          </p>

          <div className="mt-1 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Accounting Overview
              </h2>

              <p className="mt-2 text-slate-500">
                Monitor clients, invoices,
                approvals and accounting
                operations.
              </p>

            </div>

            <button
              onClick={() =>
                loadData(true)
              }
              disabled={refreshing}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh Data"}
            </button>

          </div>

        </section>

        {/* KPI */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Total Clients
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalClients}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Total Invoices
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalInvoices}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {approvedInvoices.length}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Needs Review
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {needsReview.length}
            </p>

          </div>

        </section>

        {/* STATUS */}

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {completedInvoices.length}
            </p>

          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Processing
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {processingInvoices.length}
            </p>

          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {pendingInvoices.length}
            </p>

          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Rejected
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {rejectedInvoices.length}
            </p>

          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Failed
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {failedInvoices.length}
            </p>

          </div>

        </section>

        {/* FINANCIAL */}

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

            <p className="text-sm text-slate-300">
              Total Invoice Value
            </p>

            <p className="mt-3 text-3xl font-bold">
              {formatMoney(totalValue)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Across all invoices
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Approved Value
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {formatMoney(approvedValue)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Approved invoices
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Completed Value
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatMoney(completedValue)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Completed invoices
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Rejected Value
            </p>

            <p className="mt-3 text-3xl font-bold text-red-600">
              {formatMoney(rejectedValue)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Requires correction
            </p>

          </div>

        </section>

        {/* PERFORMANCE */}

        <section className="mt-8 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">

          <div className="grid gap-10 md:grid-cols-2">

            <div>

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Approval Rate
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {approvalRate}%
                  </p>

                </div>

              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${approvalRate}%`,
                  }}
                />

              </div>

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Month-End Ready
              </p>

              <p className="mt-2 text-4xl font-bold text-slate-900">
                {monthEndReady}%
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${monthEndReady}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* INVOICE MANAGEMENT */}

        <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b p-7">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-xl font-semibold text-slate-900">
                  Invoice Management
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search and monitor all accounting documents.
                </p>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search invoice..."
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none"
                >

                  <option value="all">
                    All statuses
                  </option>

                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status
                          .charAt(0)
                          .toUpperCase() +
                          status.slice(1)}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            {filteredDocuments.length ===
            0 ? (

              <div className="p-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  📄
                </div>

                <p className="mt-4 font-medium text-slate-900">
                  No invoices found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing the search or status filter.
                </p>

              </div>

            ) : (

              <table className="w-full min-w-[900px] text-left">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Supplier
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invoice #
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Confidence
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredDocuments.map(
                    (invoice) => {

                      const data =
                        invoice.extracted_data;

                      const confidence =
                        data?.confidence ??
                        invoice.confidence;

                      return (
                        <tr
                          key={invoice.id}
                          className="border-t border-slate-100 transition hover:bg-slate-50"
                        >

                          <td className="px-6 py-5">

                            <p className="font-medium text-slate-900">
                              {data?.supplier_name ||
                                "Unknown"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {invoice.file_name}
                            </p>

                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {data?.invoice_number ||
                              "—"}
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-slate-900">

                            {data?.total !=
                            null
                              ? `${data.total.toLocaleString()} ${
                                  data.currency ||
                                  currency
                                }`
                              : "—"}

                          </td>

                          <td className="px-6 py-5">

                            {confidence !=
                            null ? (

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  confidence >=
                                  0.9
                                    ? "bg-green-100 text-green-700"
                                    : confidence >=
                                      0.7
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {Math.round(
                                  confidence *
                                    100
                                )}
                                %
                              </span>

                            ) : (

                              <span className="text-slate-400">
                                —
                              </span>

                            )}

                          </td>

                          <td className="px-6 py-5">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                                invoice.status
                              )}`}
                            >
                              {invoice.status ||
                                "unknown"}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <a
                              href={`/invoices/${invoice.id}`}
                              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                              View
                            </a>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            )}

          </div>

        </section>

        {/* CLIENTS */}

        <section className="mt-8 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                Clients
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All clients registered in LedgerFlow.
              </p>

            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {clients.length}
            </span>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {clients.length === 0 ? (

              <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center">

                <p className="font-medium text-slate-900">
                  No clients yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Clients will appear here when they are added.
                </p>

              </div>

            ) : (

              clients.map(
                (client) => (

                  <div
                    key={client.id}
                    className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <p className="font-semibold text-slate-900">
                        {client.name}
                      </p>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                        CLIENT
                      </span>

                    </div>

                    {client.email && (
                      <p className="mt-3 text-sm text-slate-500">
                        {client.email}
                      </p>
                    )}

                    {client.phone && (
                      <p className="mt-1 text-sm text-slate-500">
                        {client.phone}
                      </p>
                    )}

                    <p className="mt-4 text-xs text-slate-400">
                      Client ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-500">
                      {client.id}
                    </p>

                  </div>

                )
              )

            )}

          </div>

        </section>

      </div>

    </main>
  );
}