import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">WCAG AI Platform</h1>
            <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              v5.0
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/scans" className="text-sm font-medium">
              Scans
            </Link>
            <Link href="/reports" className="text-sm font-medium">
              Reports
            </Link>
            <Link href="/templates" className="text-sm font-medium">
              Templates
            </Link>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-5xl font-bold tracking-tight">
              Enterprise Accessibility Compliance
            </h2>
            <h3 className="mt-4 text-3xl font-semibold text-muted-foreground">
              Powered by Multi-Agent AI
            </h3>
            <p className="mt-6 text-lg text-muted-foreground">
              Automated WCAG 2.2 auditing across 87 success criteria, AI-powered analysis
              with GPT-4o and Claude 3.5 Sonnet, and FDCPA-compliant document generation.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">Documentation</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h3 className="mb-12 text-center text-3xl font-bold">
              5 Specialized AI Agents
            </h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Coordinator Agent"
                description="LangGraph-based workflow orchestration managing the complete audit pipeline"
              />
              <FeatureCard
                title="WCAG Auditor Agent"
                description="Axe-core 4.8 + Pa11y integration covering all 87 WCAG 2.2 success criteria"
              />
              <FeatureCard
                title="Content Analyzer Agent"
                description="Dual AI analysis with OpenAI GPT-4o and Anthropic Claude 3.5 Sonnet"
              />
              <FeatureCard
                title="Template Generator Agent"
                description="FDCPA-compliant debt collection document generation with variable substitution"
              />
              <FeatureCard
                title="Report Synthesizer Agent"
                description="Comprehensive PDF, HTML, JSON, and CSV report generation with executive summaries"
              />
              <FeatureCard
                title="Enterprise Security"
                description="AES-256 encryption, MFA, RBAC, OAuth, SOC 2 audit logging, and rate limiting"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-24">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold">Ready to get started?</h3>
            <p className="mt-4 text-lg text-muted-foreground">
              Start auditing your websites for WCAG compliance today
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/dashboard">Launch Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 WCAG AI Platform v5. Built for digital accessibility and compliance.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h4 className="mb-2 text-xl font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
