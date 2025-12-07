import React, { useState } from 'react';
// If using Heroicons or Lucide for icons:
import { Info, ChevronDown, Upload } from 'lucide-react';

// Reusable card section component with optional tooltip
const CardSection = ({
  icon,
  title,
  subtitle,
  tooltip,
  children
}: {
  icon?: React.ReactNode,
  title: string,
  subtitle?: string,
  tooltip?: string,
  children: React.ReactNode
}) => (
  <section className="bg-white bg-opacity-95 rounded-2xl shadow-xl mb-8 px-8 py-6 relative transition-all duration-200 border border-slate-100">
    <div className="flex items-center mb-4">
      {icon && <span className="mr-2">{icon}</span>}
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mr-2">{title}</h2>
      {tooltip && (
        <span className="group relative inline-block ml-1">
          <Info className="w-5 h-5 text-green-600 cursor-pointer" />
          <span className="absolute left-6 z-10 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg">
            {tooltip}
          </span>
        </span>
      )}
    </div>
    {subtitle && <p className="text-sm text-gray-500 mb-5">{subtitle}</p>}
    {children}
  </section>
);

const SubmitEcoAction = () => {
  const [form, setForm] = useState({
    description: "",
    type: "Reduction (cutting emissions)",
    impact: "",
    methodology: "",
    project: "",
    baseline: "",
    evidence: null as File | null,
  });

  // Open/close advanced section
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 via-green-950 to-gray-800 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="w-full max-w-3xl mx-auto pt-10 pb-2 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-400 drop-shadow mb-2">
          Submit Eco-Action
        </h1>
        <p className="text-lg font-medium text-gray-100 flex justify-center items-center gap-2 mb-6">
          <span>💚</span>
          Share your positive environmental impact and earn Green Credit Tokens
        </p>
      </div>

      <form
        className="w-full max-w-3xl mx-auto px-4 sm:px-0"
        /* onSubmit=... */
      >
        <CardSection
          icon={<span role="img" aria-label="flag">🚩</span>}
          title="Action Details"
          subtitle="Describe your environmental action and its impact"
        >
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your eco-friendly action. For example: Planted 5 trees in the local park or Organized a neighborhood clean-up event"
            rows={3}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder-gray-400 resize-none mb-2"
          />
          <div className="text-xs text-gray-500 mt-1">Be specific so others can understand and verify your impact</div>
        </CardSection>

        <CardSection
          icon={<span className="text-green-500">🌱</span>}
          title="Carbon Credit Details"
          subtitle="Provide technical details for carbon credit calculation"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Type of Credit</label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                >
                  <option>Reduction (cutting emissions)</option>
                  <option>Removals (carbon sequestration)</option>
                  <option>Renewable energy</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Choose the type that best matches your action</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1 flex items-center">
                Impact Amount (grams CO₂e)
                <span className="ml-1">
                  <Info className="w-4 h-4 text-green-600" title="How much CO₂ equivalent did you offset? 1 ton = 1,000,000 grams" />
                </span>
              </label>
              <input
                type="number"
                value={form.impact}
                onChange={e => setForm({ ...form, impact: e.target.value })}
                placeholder="e.g. 500000 (0.5 tons)"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder-gray-400"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1 flex items-center">
                Methodology
                <span className="ml-1">
                  <Info className="w-4 h-4 text-green-600" title="Describe your verification process. Ex: photo, GPS, audit." />
                </span>
              </label>
              <input
                type="text"
                value={form.methodology}
                onChange={e => setForm({ ...form, methodology: e.target.value })}
                placeholder="e.g. Tree Planting v2.0"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1 flex items-center">
                Project Name
              </label>
              <input
                type="text"
                value={form.project}
                onChange={e => setForm({ ...form, project: e.target.value })}
                placeholder="e.g. Local Park Restoration"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder-gray-400"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-900 mb-1 flex items-center">
              Baseline
              <span className="ml-1">
                <Info className="w-4 h-4 text-green-600" title="The reference point for measuring your impact" />
              </span>
            </label>
            <input
              type="text"
              value={form.baseline}
              onChange={e => setForm({ ...form, baseline: e.target.value })}
              placeholder="e.g. Standard Urban Baseline"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder-gray-400"
            />
          </div>
        </CardSection>

        {/* Advanced section, collapsible */}
        <div className="mb-8">
          <button
            type="button"
            className="flex items-center gap-2 font-semibold text-green-600 hover:underline mb-2"
            onClick={() => setShowAdvanced(v => !v)}
          >
            <span>Advanced Options</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>
          {showAdvanced && (
            <CardSection
              icon={<span className="text-blue-400">🧑‍🔬</span>}
              title="Advanced Options"
              subtitle="Optional technical parameters for detailed carbon accounting"
            >
              {/* Example advanced fields */}
              {/* ... */}
            </CardSection>
          )}
        </div>

        <CardSection
          icon={<span className="text-yellow-400"><Upload className="w-5 h-5"/></span>}
          title="Proof & Submission"
          subtitle="Upload evidence and submit your action for verification"
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={e => setForm({ ...form, evidence: e.target.files?.[0] ?? null })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </CardSection>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-emerald-300 focus:outline-none focus:ring-4 focus:ring-green-400"
          >
            Submit Eco-Action
          </button>
        </div>
      </form>
    </main>
  );
};

export default SubmitEcoAction;