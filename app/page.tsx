"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
const [selectedClient, setSelectedClient] = useState("");
const [uploading, setUploading] = useState(false);

  async function loadClients() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD ERROR:", error);
      alert("Load error: " + error.message);
    }

    setClients(data ?? []);
    setLoading(false);
  }
async function uploadDocument(file: File) {
  if (!selectedClient) {
    alert("Select a client first");
    return;
  }

  setUploading(true);

  const filePath = `${selectedClient}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (uploadError) {
    alert("Upload error: " + uploadError.message);
    setUploading(false);
    return;
  }

  const { error: dbError } = await supabase.from("documents").insert({
    client_id: selectedClient,
    file_name: file.name,
    document_type: "unknown",
    status: "pending",
  });

  if (dbError) {
    alert("Database error: " + dbError.message);
  } else {
    alert("Document uploaded successfully");
  }

  setUploading(false);
}

  async function addClient() {
    if (!name.trim()) return;

    const { error } = await supabase
      .from("clients")
      .insert({ name: name.trim() });

    if (error) {
      console.error("INSERT ERROR:", error);
      alert("Insert error: " + error.message);
      return;
    }

    setName("");
    await loadClients();
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            LedgerFlow
          </h1>
          <p className="mt-1 text-slate-500">
            AI Accounting Operations
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Clients</p>
            <p className="mt-2 text-3xl font-bold">{clients.length}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Documents</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Needs Review</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Month-End Ready</p>
            <p className="mt-2 text-3xl font-bold">0%</p>
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
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />

            <button
              onClick={addClient}
              className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white"
            >
              Add Client
            </button>
          </div>

<div className="mt-6 rounded-lg border border-slate-200 p-5">
  <h3 className="font-medium text-slate-900">
    Upload Document
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
        if (file) uploadDocument(file);
      }}
      className="rounded-lg border border-slate-300 p-2"
    />
  </div>
</div>
          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
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