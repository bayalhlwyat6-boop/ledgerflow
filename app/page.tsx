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
  status: string;
  extracted_data: {
    supplier_name?: string;
    total?: number;
    currency?: string;
  } | null;
};

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [name, setName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadData() {
    setLoading(true);

    const [{ data: clientsData }, { data: documentsData }] =
      await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("documents")
          .select("id,status,extracted_data")
          .order("created_at", { ascending: false }),
      ]);

    setClients(clientsData ?? []);
    setDocuments(documentsData ?? []);
    setLoading(false);
  }

  async function addClient() {
    if (!name.trim()) return;

    const { error } = await supabase
      .from("clients")
      .insert({ name: name.trim() });

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    await loadData();
  }

  async function uploadDocument(file: File) {
    if (!selectedClient) {
      alert("Select a client first");
      return;
    }

    setUploading(true);

    try {
      const filePath = `${selectedClient}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: document, error: dbError } = await supabase
        .from("documents")
        .insert({
          client_id: selectedClient,
          file_name: file.name,
          document_type: "invoice",
          status: "processing",
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(dbError.message);
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invoice analysis failed");
      }

      const { error: updateError } = await supabase
        .from("documents")
        .update({
          extracted_data: result.data,
          confidence: result.data.confidence,
          status: "completed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", document.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      alert(
        `Invoice analyzed successfully!\n\nSupplier: ${
          result.data.supplier_name || "Unknown"
        }\nTotal: ${result.data.total ?? "Unknown"}`
      );

      await loadData();
    } catch (error) {
      console.error("PROCESS ERROR:", error);
      alert(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const completedInvoices = documents.filter(
    (doc) => doc.status === "completed"
  ).length;

  const needsReview = documents.filter(
    (doc) =>
      doc.status !== "completed" ||
      !doc.extracted_data?.supplier_name ||
      doc.extracted_data?.total == null
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              LedgerFlow
            </h1>
            <p className="mt-1 text-slate-500">
              AI Accounting Operations
            </p>
          </div>

          <a
            href="/invoices"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            View Invoices
          </a>
        </header>

        <section className="grid gap-5 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Clients</p>
            <p className="mt-2 text-3xl font-bold">
              {clients.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Invoices</p>
            <p className="mt-2 text-3xl font-bold">
              {completedInvoices}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Needs Review</p>
            <p className="mt-2 text-3xl font-bold">
              {needsReview}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Month-End Ready
            </p>
            <p className="mt-2 text-3xl font-bold">
              {completedInvoices > 0 ? "100%" : "0%"}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Clients
          </h2>

          <div className="mt-6 flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addClient();
              }}
              placeholder="Client company name"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none"
            />

            <button
              onClick={addClient}
              className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white"
            >
              Add Client
            </button>
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 p-5">
            <h3 className="font-medium text-slate-900">
              Upload Invoice
            </h3>

            <div className="mt-4 flex gap-3">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="rounded-lg border border-slate-300 px-4 py-3"
              >
                <option value="">Select client</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    uploadDocument(file);
                  }
                }}
                className="rounded-lg border border-slate-300 p-2"
              />
            </div>

            {uploading && (
              <p className="mt-3 text-sm text-slate-500">
                AI is analyzing the invoice...
              </p>
            )}
          </div>

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
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}