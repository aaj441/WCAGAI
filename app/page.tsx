'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="border-b border-gray-800">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="text-xl font-bold text-white">WCAGAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition">
              Sign In
            </Link>
            <Link href="/login" className="bg-[#3B82F6] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          AI-Powered WCAG Accessibility Analysis
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Ensure your website meets accessibility standards with intelligent, automated WCAG compliance checking
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/dashboard" className="bg-[#3B82F6] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#2563EB] transition">
            Get Started Free →
          </Link>
          <button className="bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition">
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <div className="text-4xl font-bold text-[#3B82F6] mb-2">10,000+</div>
            <div className="text-gray-300">Sites Analyzed</div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <div className="text-4xl font-bold text-[#3B82F6] mb-2">99.8%</div>
            <div className="text-gray-300">Accuracy</div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <div className="text-4xl font-bold text-[#3B82F6] mb-2">&lt;30s</div>
            <div className="text-gray-300">Average Analysis</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Powerful Features for Complete Accessibility
        </h2>
        <p className="text-gray-300 text-center mb-16">
          Everything you need to ensure WCAG compliance
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🤖"
            title="AI-Powered Analysis"
            description="Advanced machine learning algorithms detect accessibility issues with unprecedented accuracy"
          />
          <FeatureCard
            icon="⚡"
            title="Real-Time Results"
            description="Get comprehensive accessibility reports in seconds, not hours"
          />
          <FeatureCard
            icon="✓"
            title="WCAG Compliance"
            description="Test against WCAG 2.0, 2.1, and 2.2 standards at A, AA, and AAA levels"
          />
          <FeatureCard
            icon="</>"
            title="Code Analysis"
            description="Analyze URLs or paste your HTML/CSS/JavaScript directly for instant feedback"
          />
          <FeatureCard
            icon="💡"
            title="AI Recommendations"
            description="Get intelligent, actionable fix suggestions for every accessibility issue found"
          />
          <FeatureCard
            icon="📊"
            title="Detailed Reports"
            description="Export comprehensive reports with issue breakdowns and compliance scores"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Make Your Website Accessible?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start analyzing your website for free today
          </p>
          <Link href="/dashboard" className="bg-white text-[#3B82F6] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition inline-block">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>© 2025 WCAGAI. Built with ❤️ for accessibility.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
