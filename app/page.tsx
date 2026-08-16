"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type Document = {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  extracted_data: {
    supplier_name?: string;
    total?: number;
    currency?: string;
    invoice_number?: string;
    invoice_date?: string;
    confidence?: number;
  } | null;
};

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [name, setName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserEmail(user?.email ?? null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function loadData() {
    setLoading(true);

    const [
      { data: clientsData, error: clientsError },
      { data: documentsData, error: documentsError },
    ] = await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("documents")
        .select(
          "id,file_name,status,created_at,extracted_data"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (clientsError) {
      console.error("CLIENT LOAD ERROR:", clientsError);
    }

    if (documentsError) {
      console.error("DOCUMENT LOAD ERROR:", documentsError);
    }

    setClients(clientsData ?? []);
    setDocuments(documentsData ?? []);
    setLoading(false);
  }

  async function addClient() {
    if (!name.trim()) {
      alert("Enter a client name first.");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .insert({
        name: name.trim(),
      });

    if (error) {
      console.error("CLIENT INSERT ERROR:", error);
      alert(error.message);
      return;
    }

    setName("");
    await loadData();
  }

  async function uploadDocument(file: File) {
    if (!selectedClient) {
      alert("Select a client first.");
      return;
    }

    setUploading(true);

    let documentId: string | null = null;

    try {
      const { data: document, error: dbError } =
        await supabase
          .from("documents")
          .insert({
            client_id: selectedClient,
            file_name: file.name,
            document_type: "invoice",
            status: "processing",
          })
          .select("id")
          .single();

      if (dbError || !document) {
        throw new Error(
          dbError?.message ||
            "Could not create document record."
        );
      }

      documentId = document.id;

      const filePath =
        `${selectedClient}/${documentId}-${file.name}`;

      const { error: uploadError } =
        await supabase.storage
          .from("documents")
          .upload(filePath, file);

      if (uploadError) {
        await supabase
          .from("documents")
          .update({
            status: "failed",
          })
          .eq("id", documentId);

        throw new Error(uploadError.message);
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.data) {
        await supabase
          .from("documents")
          .update({
            status: "failed",
          })
          .eq("id", documentId);

        throw new Error(
          result.error ||
            "Invoice analysis failed."
        );
      }

      const { error: updateError } =
        await supabase
          .from("documents")
          .update({
            extracted_data: result.data,
            confidence:
              typeof result.data.confidence ===
              "number"
                ? result.data.confidence
                : null,
            status: "completed",
            processed_at:
              new Date().toISOString(),
          })
          .eq("id", documentId);

      if (updateError) {
        await supabase
          .from("documents")
          .update({
            status: "failed",
          })
          .eq("id", documentId);

        throw new Error(updateError.message);
      }

      await loadData();

      alert(
        `Invoice analyzed successfully!\n\nSupplier: ${
          result.data.supplier_name ||
          "Unknown"
        }\nInvoice Number: ${
          result.data.invoice_number ||
          "Unknown"
        }\nTotal: ${
          result.data.total ?? "Unknown"
        } ${
          result.data.currency || ""
        }`
      );
    } catch (error) {
      console.error("PROCESS ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Invoice processing failed."
      );

      await loadData();
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    loadUser();
    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const approvedInvoices =
    documents.filter(
      (doc) => doc.status === "approved"
    );

  const completedInvoices =
    documents.filter(
      (doc) => doc.status === "completed"
    );

  const processingInvoices =
    documents.filter(
      (doc) => doc.status === "processing"
    );

  const pendingInvoices =
    documents.filter(
      (doc) => doc.status === "pending"
    );

  const rejectedInvoices =
    documents.filter(
      (doc) => doc.status === "rejected"
    );

  const failedInvoices =
    documents.filter(
      (doc) => doc.status === "failed"
    );

  const needsReview =
    documents.filter((doc) => {
      if (doc.status === "approved") return false;
      if (doc.status === "processing") return false;
      if (doc.status === "pending") return false;

      if (doc.status === "failed") return true;
      if (doc.status === "rejected") return true;

      if (doc.status === "completed") {
        const data = doc.extracted_data;

        if (!data?.supplier_name) return true;
        if (data.total == null) return true;

        if (
          data.confidence != null &&
          data.confidence < 0.9
        ) {
          return true;
        }

        return true;
      }

      return true;
    }).length;

  const totalInvoiceValue =
    documents.reduce(
      (sum, doc) => {
        const total =
          doc.extracted_data?.total;

        return (
          sum +
          (typeof total === "number"
            ? total
            : 0)
        );
      },
      0
    );

  const approvedValue =
    approvedInvoices.reduce(
      (sum, doc) => {
        const total =
          doc.extracted_data?.total;

        return (
          sum +
          (typeof total === "number"
            ? total
            : 0)
        );
      },
      0
    );

  const processedValue =
    documents
      .filter(
        (doc) =>
          doc.status === "completed" ||
          doc.status === "approved"
      )
      .reduce(
        (sum, doc) => {
          const total =
            doc.extracted_data?.total;

          return (
            sum +
            (typeof total === "number"
              ? total
              : 0)
          );
        },
        0
      );

  const rejectedValue =
    rejectedInvoices.reduce(
      (sum, doc) => {
        const total =
          doc.extracted_data?.total;

        return (
          sum +
          (typeof total === "number"
            ? total
            : 0)
        );
      },
      0
    );

  const currency =
    documents.find(
      (doc) =>
        doc.extracted_data?.currency
    )?.extracted_data?.currency || "";

  const reviewableInvoices =
    documents.filter(
      (doc) =>
        doc.status === "completed" ||
        doc.status === "approved" ||
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

  const monthEndReady =
    documents.length > 0
      ? Math.round(
          (approvedInvoices.length /
            documents.length) *
            100
        )
      : 0;

  const formatMoney = (value: number) =>
    `${value.toLocaleString()} ${currency}`;

  const recentInvoices =
    documents.slice(0, 5);

  function getStatusClass(status: string) {
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
      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              LedgerFlow
            </h1>

            <p className="mt-1 text-slate-500">
              AI Accounting Operations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {userEmail && (
              <div className="rounded-lg bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                {userEmail}
              </div>
            )}

            <a
              href="/invoices"
              className="inline-flex rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              View Invoices
            </a>

            <button
              onClick={signOut}
              className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign Out
            </button>

          </div>
        </header>

        {/* KPI CARDS */}

        <section className="grid gap-5 md:grid-cols-3 lg:grid-cols-7">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Clients
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {clients.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Invoices
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {documents.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Approved
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {approvedInvoices.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {completedInvoices.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Processing
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {processingInvoices.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Rejected
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedInvoices.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Needs Review
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {needsReview}
            </p>
          </div>

        </section>

        {/* MONTH END */}

        <section className="mt-5">
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Month-End Ready
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {monthEndReady}%
                </p>
              </div>

              <div className="w-full md:max-w-md">

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${monthEndReady}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {approvedInvoices.length} of{" "}
                  {documents.length} invoices approved
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* FINANCIAL SUMMARY */}

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-slate-900 p-7 text-white shadow-sm">
            <p className="text-sm text-slate-300">
              Total Invoice Value
            </p>

            <p className="mt-3 text-3xl font-bold">
              {formatMoney(totalInvoiceValue)}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Across all invoices
            </p>
          </div>

          <div className="rounded-xl bg-white p-7 shadow-sm">
            <p className="text-sm text-slate-500">
              Approved Value
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {formatMoney(approvedValue)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Approved invoices
            </p>
          </div>

          <div className="rounded-xl bg-white p-7 shadow-sm">
            <p className="text-sm text-slate-500">
              Processed Value
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatMoney(processedValue)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Completed + approved
            </p>
          </div>

          <div className="rounded-xl bg-white p-7 shadow-sm">
            <p className="text-sm text-slate-500">
              Rejected Value
            </p>

            <p className="mt-3 text-3xl font-bold text-red-600">
              {formatMoney(rejectedValue)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Requires correction
            </p>
          </div>

        </section>

        {/* OPERATIONS STATUS */}

        <section className="mt-8 rounded-xl bg-white p-7 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Operations Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current invoice processing activity
              </p>
            </div>

            <a
              href="/invoices"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              View all →
            </a>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Completed
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {completedInvoices.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Approved
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {approvedInvoices.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Processing
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {processingInvoices.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {pendingInvoices.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Rejected
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {rejectedInvoices.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Approval Rate
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {approvalRate}%
              </p>
            </div>

          </div>
        </section>

        {/* RECENT INVOICES */}

        <section className="mt-8 rounded-xl bg-white p-7 shadow-sm">

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Invoices
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest accounting documents processed by LedgerFlow
              </p>
            </div>

            <a
              href="/invoices"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              View all →
            </a>

          </div>

          <div className="mt-6 overflow-x-auto">

            {recentInvoices.length === 0 ? (

              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No invoices yet.
              </div>

            ) : (

              <table className="w-full text-left">

                <thead className="border-b bg-slate-50">
                  <tr>

                    <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                      Supplier
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                      Invoice #
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                      Total
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                      Confidence
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {recentInvoices.map(
                    (invoice) => {
                      const data =
                        invoice.extracted_data;

                      return (
                        <tr
                          key={invoice.id}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >

                          <td className="px-5 py-5">
                            <p className="font-medium text-slate-900">
                              {data?.supplier_name ||
                                "Unknown"}
                            </p>

                            <p className="text-xs text-slate-400">
                              {invoice.file_name}
                            </p>
                          </td>

                          <td className="px-5 py-5 text-slate-600">
                            {data?.invoice_number ||
                              "—"}
                          </td>

                          <td className="px-5 py-5 font-semibold text-slate-900">
                            {data?.total != null
                              ? `${data.total.toLocaleString()} ${
                                  data.currency || ""
                                }`
                              : "—"}
                          </td>

                          <td className="px-5 py-5">

                            {data?.confidence != null ? (
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
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

                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                invoice.status
                              )}`}
                            >
                              {invoice.status}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <a
                              href={`/invoices/${invoice.id}`}
                              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
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

        <section className="mt-8 rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            Clients
          </h2>

          {/* ADD CLIENT */}

          <div className="mt-6 flex flex-col gap-3 md:flex-row">

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addClient();
                }
              }}
              placeholder="Client company name"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />

            <button
              onClick={addClient}
              className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
            >
              Add Client
            </button>

          </div>

          {/* UPLOAD */}

          <div className="mt-8 rounded-lg border border-slate-200 p-5">

            <h3 className="font-medium text-slate-900">
              Upload Invoice
            </h3>

            <div className="mt-4 flex flex-wrap gap-3">

              <select
                value={selectedClient}
                onChange={(e) =>
                  setSelectedClient(
                    e.target.value
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-3"
              >

                <option value="">
                  Select client
                </option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.name}
                  </option>
                ))}

              </select>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={uploading}
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadDocument(file);
                  }
                }}
                className="rounded-lg border border-slate-300 p-2"
              />

            </div>

            {uploading && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">

                <p className="text-sm font-medium text-blue-700">
                  AI is analyzing the invoice...
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  Please wait while LedgerFlow extracts the invoice data.
                </p>

              </div>
            )}

          </div>

          {/* CLIENT LIST */}

          <div className="mt-8 space-y-3">

            {loading ? (

              <p className="text-slate-500">
                Loading...
              </p>

            ) : clients.length === 0 ? (

              <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No clients yet.
              </p>

            ) : (

              clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-lg border border-slate-200 p-4"
                >

                  <p className="font-medium text-slate-900">
                    {client.name}
                  </p>

                  {client.email && (
                    <p className="mt-1 text-sm text-slate-500">
                      {client.email}
                    </p>
                  )}

                  {client.phone && (
                    <p className="mt-1 text-sm text-slate-500">
                      {client.phone}
                    </p>
                  )}

                </div>
              ))

            )}

          </div>

        </section>

      </div>
    </main>
  );
}