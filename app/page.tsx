"use client";

import Link from "next/link";

const features = [
  {
    icon: "✦",
    title: "AI Invoice Extraction",
    description:
      "Extract supplier names, invoice numbers, dates, taxes, totals and currencies automatically.",
  },
  {
    icon: "✓",
    title: "Approval Workflow",
    description:
      "Review completed invoices and approve or reject them with a clear accounting workflow.",
  },
  {
    icon: "◉",
    title: "Confidence Scoring",
    description:
      "Know how confident the AI is before your team makes an accounting decision.",
  },
  {
    icon: "⌁",
    title: "Audit Trail",
    description:
      "Track invoice activity, status changes, approvals and rejection reasons.",
  },
  {
    icon: "◆",
    title: "Client Management",
    description:
      "Keep your clients organized and connect every accounting document to the right company.",
  },
  {
    icon: "▣",
    title: "Operations Dashboard",
    description:
      "Monitor invoices, financial values, approvals and month-end readiness in one place.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Upload",
    description:
      "Upload an invoice document from your accounting workflow.",
  },
  {
    number: "02",
    title: "AI Extracts",
    description:
      "LedgerFlow analyzes the document and extracts structured accounting data.",
  },
  {
    number: "03",
    title: "Review",
    description:
      "Your team checks the extracted information and AI confidence.",
  },
  {
    number: "04",
    title: "Approve",
    description:
      "Approve or reject the invoice while keeping a complete audit history.",
  },
];

const faqs = [
  {
    question: "What is LedgerFlow?",
    answer:
      "LedgerFlow is an AI-powered accounting operations platform designed to help teams process, review and approve invoices.",
  },
  {
    question: "Does LedgerFlow automatically approve invoices?",
    answer:
      "No. AI assists with extraction and confidence scoring, while important approval decisions remain under human control.",
  },
  {
    question: "What information can LedgerFlow extract?",
    answer:
      "LedgerFlow can work with supplier information, invoice numbers, dates, subtotal, tax, total, currency and confidence scores.",
  },
  {
    question: "Can I manage multiple clients?",
    answer:
      "Yes. LedgerFlow includes client management so accounting documents can be associated with the appropriate client.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-950 shadow-lg">
              L
            </div>

            <div>
              <div className="font-bold tracking-tight">
                LedgerFlow
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                AI Accounting
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">

            <a
              href="#features"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Workflow
            </a>

            <a
              href="#pricing"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Pricing
            </a>

            <a
              href="#faq"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              FAQ
            </a>

          </nav>

          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start Free
            </Link>

          </div>

        </div>

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative pt-32">

        {/* Background glow */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

          <div className="absolute right-0 top-64 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />

        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-24">

          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              AI-powered accounting operations

            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">

              Invoice processing,

              <span className="block bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                without the chaos.
              </span>

            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">

              LedgerFlow turns invoices into structured accounting
              operations with AI extraction, human approval and
              complete visibility.

            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/login"
                className="rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 shadow-xl shadow-white/5 transition hover:-translate-y-0.5 hover:bg-slate-200"
              >
                Start Free →
              </Link>

              <Link
                href="/admin"
                className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                View Dashboard
              </Link>

            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-500">

              <span>✓ AI extraction</span>
              <span>✓ Human approval</span>
              <span>✓ Audit history</span>
              <span>✓ Client management</span>

            </div>

          </div>

          {/* =================================================
              DASHBOARD PREVIEW
          ================================================= */}

          <div className="relative mx-auto mt-20 max-w-6xl">

            <div className="absolute -inset-10 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative rounded-2xl border border-white/10 bg-slate-900/90 p-2 shadow-2xl shadow-black/50">

              <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">

                {/* Browser bar */}

                <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-5 py-3">

                  <div className="h-3 w-3 rounded-full bg-red-400/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <div className="h-3 w-3 rounded-full bg-green-400/70" />

                  <div className="mx-auto hidden max-w-md flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-1.5 text-center text-xs text-slate-600 sm:block">
                    app.ledgerflow.ai
                  </div>

                </div>

                <div className="grid md:grid-cols-[210px_1fr]">

                  {/* Sidebar */}

                  <aside className="hidden border-r border-white/10 bg-slate-900/60 p-5 md:block">

                    <div className="mb-8 flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-950">
                        L
                      </div>

                      <span className="font-semibold">
                        LedgerFlow
                      </span>

                    </div>

                    <div className="space-y-2 text-sm">

                      {[
                        "Overview",
                        "Invoices",
                        "Clients",
                        "Approvals",
                        "Audit Log",
                      ].map((item, index) => (

                        <div
                          key={item}
                          className={`rounded-lg px-3 py-2.5 ${
                            index === 0
                              ? "bg-white/10 text-white"
                              : "text-slate-500"
                          }`}
                        >
                          {item}
                        </div>

                      ))}

                    </div>

                  </aside>

                  {/* Dashboard */}

                  <div className="p-5 sm:p-7">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                      <div>
                        <p className="text-xs text-slate-500">
                          Overview
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          Accounting Operations
                        </h3>
                      </div>

                      <button className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-950">
                        Upload Invoice
                      </button>

                    </div>

                    {/* Stats */}

                    <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

                      {[
                        ["Clients", "24"],
                        ["Invoices", "184"],
                        ["Approved", "91%"],
                        ["Review", "12"],
                      ].map(([label, value]) => (

                        <div
                          key={label}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                        >

                          <p className="text-xs text-slate-500">
                            {label}
                          </p>

                          <p className="mt-2 text-2xl font-bold">
                            {value}
                          </p>

                        </div>

                      ))}

                    </div>

                    {/* Main cards */}

                    <div className="mt-5 grid gap-5 lg:grid-cols-3">

                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">

                        <div className="flex items-center justify-between">

                          <div>
                            <p className="text-xs text-slate-500">
                              Recent Invoices
                            </p>

                            <p className="mt-1 font-semibold">
                              Latest accounting activity
                            </p>
                          </div>

                          <span className="text-xs text-slate-500">
                            View all →
                          </span>

                        </div>

                        <div className="mt-5 space-y-3">

                          {[
                            [
                              "IMPORT EXPORT SOLUTIONS",
                              "12,500 SAR",
                              "approved",
                            ],
                            [
                              "Skysoft Corporation",
                              "529 SAR",
                              "rejected",
                            ],
                            [
                              "Accounting Services",
                              "7,300 SAR",
                              "processing",
                            ],
                          ].map(([name, amount, status]) => (

                            <div
                              key={name}
                              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                            >

                              <div className="min-w-0">

                                <p className="truncate text-sm font-medium">
                                  {name}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  Invoice document
                                </p>

                              </div>

                              <div className="ml-4 text-right">

                                <p className="text-sm font-semibold">
                                  {amount}
                                </p>

                                <p
                                  className={`mt-1 text-xs ${
                                    status === "approved"
                                      ? "text-emerald-400"
                                      : status === "rejected"
                                      ? "text-red-400"
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

                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

                        <p className="text-xs text-slate-500">
                          Month-End Ready
                        </p>

                        <p className="mt-2 text-4xl font-bold">
                          87%
                        </p>

                        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">

                          <div className="h-full w-[87%] rounded-full bg-emerald-400" />

                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                          160 of 184 invoices approved
                          or completed.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="border-t border-white/10 bg-white/[0.02]"
      >

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Everything in one place
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Built around your accounting workflow.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Stop moving between spreadsheets, email attachments
              and disconnected tools. LedgerFlow brings the operation
              together.
            </p>

          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => (

              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-slate-950 p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-emerald-400">
                  {feature.icon}
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {feature.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          WORKFLOW
      ===================================================== */}

      <section
        id="workflow"
        className="mx-auto max-w-7xl px-6 py-24"
      >

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-400">
            The workflow
          </p>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Four steps. One flow.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Designed to make invoice operations faster without
            removing human control.
          </p>

        </div>

        <div className="relative mt-16 grid gap-5 md:grid-cols-4">

          <div className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />

          {workflow.map((step) => (

            <div
              key={step.number}
              className="relative rounded-2xl border border-white/10 bg-slate-950 p-7"
            >

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-emerald-400">
                {step.number}
              </div>

              <h3 className="mt-7 text-xl font-semibold">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {step.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* =====================================================
          PRICING
      ===================================================== */}

      <section
        id="pricing"
        className="border-y border-white/10 bg-white/[0.02]"
      >

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Simple pricing
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Start simple. Scale when you need to.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              Get your accounting operation organized before
              worrying about complicated plans.
            </p>

          </div>

          <div className="mx-auto mt-14 max-w-md">

            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950 p-8 shadow-2xl">

              <div className="absolute right-6 top-6 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                START HERE
              </div>

              <p className="text-lg font-semibold">
                Free
              </p>

              <div className="mt-5 flex items-end gap-2">

                <span className="text-5xl font-bold">
                  $0
                </span>

                <span className="pb-1 text-slate-500">
                  / month
                </span>

              </div>

              <p className="mt-4 leading-7 text-slate-400">
                Explore the LedgerFlow workflow and start
                organizing your accounting operations.
              </p>

              <Link
                href="/login"
                className="mt-8 block rounded-xl bg-white px-6 py-3.5 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Create Account
              </Link>

              <div className="mt-8 space-y-4">

                {[
                  "Invoice management",
                  "AI extraction workflow",
                  "Client management",
                  "Approval workflow",
                  "Audit history",
                  "Operations dashboard",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >

                    <span className="text-emerald-400">
                      ✓
                    </span>

                    {item}

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section
        id="faq"
        className="mx-auto max-w-4xl px-6 py-24"
      >

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-400">
            FAQ
          </p>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Questions, answered.
          </h2>

        </div>

        <div className="mt-12 space-y-4">

          {faqs.map((faq) => (

            <details
              key={faq.question}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >

              <summary className="cursor-pointer list-none pr-8 font-semibold">

                <div className="flex items-center justify-between">

                  <span>
                    {faq.question}
                  </span>

                  <span className="text-slate-500 transition group-open:rotate-45">
                    +
                  </span>

                </div>

              </summary>

              <p className="mt-4 max-w-3xl leading-7 text-slate-400">
                {faq.answer}
              </p>

            </details>

          ))}

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="px-6 pb-24">

        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] px-6 py-16 text-center sm:px-12">

          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative">

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-400">
              LedgerFlow
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Your invoices deserve a better workflow.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Start organizing your accounting operations
              with LedgerFlow today.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              Start Free →
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/10 bg-slate-950">

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950">
                L
              </div>

              <span className="font-semibold">
                LedgerFlow
              </span>

            </div>

            <p className="mt-3 text-sm text-slate-600">
              AI Accounting Operations
            </p>

          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500">

            <a
              href="#features"
              className="transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="transition hover:text-white"
            >
              Workflow
            </a>

            <a
              href="#pricing"
              className="transition hover:text-white"
            >
              Pricing
            </a>

            <Link
              href="/login"
              className="transition hover:text-white"
            >
              Sign in
            </Link>

            <Link
              href="/admin"
              className="transition hover:text-white"
            >
              Admin
            </Link>

          </div>

        </div>

        <div className="border-t border-white/5 py-5 text-center text-xs text-slate-700">
          © {new Date().getFullYear()} LedgerFlow. All rights reserved.
        </div>

      </footer>

    </main>
  );
}