"use client";

import { useState } from "react";

interface PricingModalProps {
  onClose: () => void;
}

export function PricingModal({ onClose }: PricingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#1c1c22] p-8 shadow-2xl border border-gray-800">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Unlock Limitless Potential</h2>
          <p className="text-gray-400 mb-8">Choose the plan that fits your learning pace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Plan */}
          <div className="rounded-xl border border-blue-500/30 bg-[#252530] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Pro Plan</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold text-white">$9.99</span>
              <span className="text-gray-500 ml-1">/ mo</span>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                500 AI Tutor requests per day
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Faster response times
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Access to Gemini 2.5 Pro model
              </li>
            </ul>
            <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
              Upgrade to Pro
            </button>
          </div>

          {/* Max Plan */}
          <div className="rounded-xl border border-purple-500/30 bg-[#252530] p-6 bg-gradient-to-b from-[#2a2438] to-[#252530]">
            <h3 className="text-lg font-bold text-white mb-1">Max Plan</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold text-white">$19.99</span>
              <span className="text-gray-500 ml-1">/ mo</span>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Unlimited AI Tutor requests
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Priority backend execution
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Access to all upcoming AI models
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Early access to new features
              </li>
            </ul>
            <button className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700">
              Go Max
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
