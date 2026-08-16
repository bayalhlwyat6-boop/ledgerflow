"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-950">
              L
            </div>

            <div>
              <p className="text-lg font-bold">
                LedgerFlow
              </p>

              <p className="text-xs text-slate-400">
                AI Accounting Operations
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#security"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Get Started
            </Link>
          </div>

        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                AI-powered accounting operations
              </div>

              <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Turn invoices into
                <span className="block text-slate-400">
                  accounting operations.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
                LedgerFlow uses AI to extract invoice data,
                process accounting documents, monitor approvals,
                and keep your month-end operations under control.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">

                <Link
                  href="/login"
                  className="rounded-xl bg-white px-6 py-3.5 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Start Managing Invoices
                </Link>

                <a
                  href="#workflow"
                  className="rounded-xl border border-white/15 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  See How It Works
                </a>

              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">

                <span>✓ AI invoice extraction</span>
                <span>✓ Approval workflow</span>
                <span>✓ Audit history</span>

              </div>

            </div>

            {/* DASHBOARD PREVIEW */}

            <div className="relative">

              <div className="absolute -inset-10 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl">

                <div className="rounded-xl border border-white/10 bg-slate-900">

                  {/* MOCK HEADER */}

                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950">
                        L
                      </div>

                      <span className="font-semibold">
                        LedgerFlow
                      </span>

                    </div>

                    <div className="h-2 w-2 rounded-full bg-emerald-400" />

                  </div>

                  {/* MOCK CONTENT */}

                  <div className="p-5">

                    <div className="mb-5">

                      <p className="text-xs text-slate-500">
                        Accounting Overview
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        Operations Dashboard
                      </p>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-slate-500">
                          Clients
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                          24
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-slate-500">
                          Invoices
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                          184
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-slate-500">
                          Approved
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-400">
                          91%
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-slate-500">
                          Review
                        </p>
                        <p className="mt-2 text-2xl font-bold text-orange-400">
                          12
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-xs text-slate-500">
                            Month-End Ready
                          </p>

                          <p className="mt-1 text-3xl font-bold">
                            87%
                          </p>
                        </div>

                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-400/30">
                          <span className="text-sm font-bold text-emerald-400">
                            87%
                          </span>
                        </div>

                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[87%] rounded-full bg-emerald-400" />
                      </div>

                    </div>

                    <div className="mt-5 space-y-3">

                      {[
                        ["IMPORT EXPORT SOLUTIONS", "12,500 SAR", "Approved"],
                        ["Skysoft Corporation", "529 SAR", "Review"],
                        ["Acme Trading", "7,300 SAR", "Processing"],
                      ].map(([name, amount, status]) => (

                        <div
                          key={name}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4"
                        >

                          <div>
                            <p className="text-sm font-medium">
                              {name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Invoice document
                            </p>
                          </div>

                          <div className="text-right">

                            <p className="text-sm font-semibold">
                              {amount}
                            </p>

                            <p
                              className={`mt-1 text-xs ${
                                status === "Approved"
                                  ? "text-emerald-400"
                                  : status === "Review"
                                  ? "text-orange-400"
                                  : "text-blue-400"
                              }`}
                            >
                              {status}
                            </p>

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= TRUST BAR ================= */}

      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-center text-sm text-slate-400 sm:grid-cols-3">

          <div>
            <p className="font-semibold text-white">
              AI Extraction
            </p>
            <p className="mt-1">
              Turn invoice files into structured data.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white">
              Human Approval
            </p>
            <p className="mt-1">
              Keep accountants in control of decisions.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white">
              Full Visibility
            </p>
            <p className="mt-1">
              Track every document and operation.
            </p>
          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24"
      >

        <div className="max-w-2xl">

          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Built for accounting teams
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to manage invoice operations.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            From the moment an invoice arrives until it is
            approved and completed, LedgerFlow keeps the entire
            process organized.
          </p>

        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {[
            {
              title: "AI Invoice Extraction",
              text: "Automatically extract supplier, invoice number, date, totals, tax and currency from uploaded documents.",
            },
            {
              title: "Approval Workflow",
              text: "Review completed invoices and approve or reject them with a clear human-controlled workflow.",
            },
            {
              title: "Confidence Scoring",
              text: "See how confident the AI is in extracted information before making an accounting decision.",
            },
            {
              title: "Audit Logs",
              text: "Maintain a clear history of invoice status changes and accounting activity.",
            },
            {
              title: "Client Management",
              text: "Keep your clients organized and connect accounting documents to the correct company.",
            },
            {
              title: "Operations Dashboard",
              text: "Monitor processing, approvals, rejected invoices, financial values and month-end readiness.",
            },
          ].map((feature) => (

            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-950">
                ✓
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {feature.text}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ================= WORKFLOW ================= */}

      <section
        id="workflow"
        className="border-y border-white/10 bg-white/[0.02]"
      >

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Simple workflow
            </p>

            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              From invoice to approval.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              LedgerFlow turns a manual accounting process into
              a clear operational workflow.
            </p>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">

            {[
              ["01", "Upload", "Upload an invoice document into LedgerFlow."],
              ["02", "Extract", "AI analyzes the document and extracts accounting data."],
              ["03", "Review", "Check confidence and review the extracted information."],
              ["04", "Approve", "Approve or reject the invoice and keep the audit trail."],
            ].map(([number, title, text]) => (

              <div
                key={number}
                className="relative rounded-2xl border border-white/10 bg-slate-950 p-7"
              >

                <span className="text-sm font-bold text-slate-600">
                  {number}
                </span>

                <h3 className="mt-6 text-xl font-semibold">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= SECURITY ================= */}

      <section
        id="security"
        className="mx-auto max-w-7xl px-6 py-24"
      >

        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Control & visibility
            </p>

            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Your accounting team stays in control.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              AI helps process documents, but important accounting
              decisions remain visible and controlled by your team.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {[
              "Role-based access",
              "Invoice status tracking",
              "Approval history",
              "Rejection reasons",
              "AI confidence scores",
              "Client organization",
            ].map((item) => (

              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >

                <div className="flex items-center gap-3">

                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                    ✓
                  </span>

                  <span className="font-medium">
                    {item}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="px-6 pb-24">

        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-16 text-center sm:px-12">

          <h2 className="text-4xl font-bold sm:text-5xl">
            Ready to streamline your invoice operations?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Start using LedgerFlow to organize invoices,
            automate extraction and manage approvals.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Open LedgerFlow
          </Link>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <span className="font-semibold text-slate-300">
              LedgerFlow
            </span>{" "}
            • AI Accounting Operations
          </div>

          <div className="flex gap-6">

            <Link
              href="/login"
              className="transition hover:text-white"
            >
              Sign In
            </Link>

            <Link
              href="/admin"
              className="transition hover:text-white"
            >
              Admin
            </Link>

          </div>

        </div>

      </footer>

    </main>
  );
}