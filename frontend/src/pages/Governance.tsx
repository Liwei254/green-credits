import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

interface Proposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  state: string;
  author: string;
  scores: number[];
  scores_total: number;
}

interface TemplateField {
  name: string;
  label: string;
  type: "number" | "text" | "textarea" | "select";
  default: number | string;
  options?: string[];
}

const Governance: React.FC<Props> = ({ provider }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
    type: "",
    parameters: {} as Record<string, string | number>,
  });

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setProposals([]);
    } catch (error) {
      console.error("Error loading proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const proposalTemplates: Record<
    string,
    { title: string; description: string; fields: TemplateField[] }
  > = {
    parameterChange: {
      title: "Parameter Change Proposal",
      description: "Propose changes to system parameters like stake requirements, challenge windows, or reward multipliers.",
      fields: [
        { name: "challengeWindow", label: "Challenge Window (seconds)", type: "number", default: 86400 },
        { name: "submitStake", label: "Submit Stake (DEV)", type: "number", default: 0.01 },
        { name: "verifyStake", label: "Verify Stake (DEV)", type: "number", default: 0.05 },
        { name: "bufferBps", label: "Buffer Percentage (basis points)", type: "number", default: 1000 },
      ],
    },
    verifierManagement: {
      title: "Verifier Management Proposal",
      description: "Add or remove verifiers from the system.",
      fields: [
        { name: "action", label: "Action", type: "select", options: ["add", "remove"], default: "add" },
        { name: "verifierAddress", label: "Verifier Address", type: "text", default: "" },
      ],
    },
    ngoApproval: {
      title: "NGO Approval Proposal",
      description: "Approve or reject NGOs for receiving donations.",
      fields: [
        { name: "action", label: "Action", type: "select", options: ["approve", "reject"], default: "approve" },
        { name: "ngoAddress", label: "NGO Address", type: "text", default: "" },
        { name: "ngoName", label: "NGO Name", type: "text", default: "" },
        { name: "justification", label: "Justification", type: "textarea", default: "" },
      ],
    },
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = proposalTemplates[templateKey];
    setProposalForm({
      title: template.title,
      description: template.description,
      type: templateKey,
      parameters: {},
    });
  };

  const handleParameterChange = (field: string, value: string | number) => {
    setProposalForm((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [field]: value,
      },
    }));
  };

  const createProposal = async () => {
    try {
      if (!provider) {
        toast.error("Wallet not connected");
        return;
      }

      toast("Proposal creation requires Snapshot space setup. This is a demo of the UI flow.", { icon: "ℹ️" });

      const mockProposal: Proposal = {
        id: `proposal-${Date.now()}`,
        title: proposalForm.title,
        body: `${proposalForm.description}\n\nTemplate: ${selectedTemplate}\nParameters: ${JSON.stringify(
          proposalForm.parameters,
          null,
          2
        )}`,
        choices:
          selectedTemplate === "parameterChange"
            ? ["Approve Changes", "Reject Changes"]
            : selectedTemplate === "verifierManagement"
            ? [
                `${String(proposalForm.parameters.action ?? "add")
                  .charAt(0)
                  .toUpperCase()}${String(proposalForm.parameters.action ?? "add").slice(1)} Verifier`,
                "Reject",
              ]
            : [
                `${String(proposalForm.parameters.action ?? "approve")
                  .charAt(0)
                  .toUpperCase()}${String(proposalForm.parameters.action ?? "approve").slice(1)} NGO`,
                "Reject",
              ],
        start: Math.floor(Date.now() / 1000),
        end: Math.floor(Date.now() / 1000) + 86400 * 7,
        state: "active",
        author: await (await provider.getSigner()).getAddress(),
        scores: [0, 0],
        scores_total: 0,
      };

      console.log("Would create proposal:", mockProposal);
      toast.success("Demo: Proposal would be created with these details (check console)");

      setSelectedTemplate("");
      setProposalForm({
        title: "",
        description: "",
        type: "",
        parameters: {},
      });
    } catch (error: any) {
      console.error("Error creating proposal:", error);
      toast.error(error.message || "Failed to create proposal");
    }
  };

  const voteOnProposal = async (proposalId: string, choice: number) => {
    try {
      if (!provider) {
        toast.error("Wallet not connected");
        return;
      }

      toast("Voting requires Snapshot space setup. This is a demo of the UI flow.", { icon: "ℹ️" });
      console.log("Would vote on proposal:", { proposalId, choice });

      toast.success("Demo: Vote would be cast (check console for details)");
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to vote");
    }
  };

  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString();

  const getProposalStatus = (proposal: Proposal) => {
    const now = Date.now() / 1000;
    if (now < proposal.start) return "Pending";
    if (now < proposal.end) return "Active";
    return "Closed";
  };

  return (
    <div className="container-responsive">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🌱 Green Credits DAO</h1>
          <p className="text-gray-600 text-lg">Community governance for the Green Credits platform</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📝 Create Proposal</h2>
            <p className="card-description">Submit proposals to improve the Green Credits ecosystem</p>
          </div>

          {!selectedTemplate ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(proposalTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleTemplateSelect(key)}
                  className="group p-6 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary-bg transition-all duration-200 text-left"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">
                    {key === "parameterChange" ? "⚙️" : key === "verifierManagement" ? "👥" : "🏢"}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {proposalTemplates[selectedTemplate].title}
                </h3>
                <button onClick={() => setSelectedTemplate("")} className="btn btn-secondary">
                  ← Back to templates
                </button>
              </div>

              <div className="bg-info-bg border border-info rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {proposalTemplates[selectedTemplate].description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {proposalTemplates[selectedTemplate].fields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="label">{field.label}</label>
                    {field.type === "select" && field.options ? (
                      <select
                        className="input"
                        value={proposalForm.parameters[field.name] ?? field.default}
                        onChange={(e) => handleParameterChange(field.name, e.target.value)}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        className="input resize-none"
                        rows={4}
                        value={proposalForm.parameters[field.name] ?? field.default}
                        onChange={(e) => handleParameterChange(field.name, e.target.value)}
                        placeholder={field.label}
                      />
                    ) : (
                      <input
                        className="input"
                        type={field.type}
                        value={proposalForm.parameters[field.name] ?? field.default}
                        onChange={(e) =>
                          handleParameterChange(
                            field.name,
                            field.type === "number" ? Number(e.target.value) : e.target.value
                          )
                        }
                        placeholder={field.label}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={createProposal} className="btn btn-primary btn-lg">
                  🚀 Create Proposal
                </button>
                <button onClick={() => setSelectedTemplate("")} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Active Proposals</h2>
            <p className="card-description">Vote on proposals to shape the future of Green Credits</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="loading-skeleton h-8 w-64 mx-auto mb-4"></div>
              <div className="loading-skeleton h-4 w-96 mx-auto"></div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No active proposals</h3>
              <p className="text-gray-600 mb-6">Be the first to create a proposal and help shape the ecosystem!</p>
              <button className="btn btn-primary btn-lg">Create First Proposal</button>
            </div>
          ) : (
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{proposal.title}</h3>
                    <span
                      className={`status-chip ${
                        getProposalStatus(proposal) === "Active"
                          ? "status-verified"
                          : getProposalStatus(proposal) === "Pending"
                          ? "status-pending"
                          : "status-rejected"
                      }`}
                    >
                      {getProposalStatus(proposal)}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
                    {proposal.body.substring(0, 300)}...
                  </p>

                  <div className="flex-between text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-2">
                      <span>By:</span>
                      <span className="font-mono">
                        {proposal.author.substring(0, 8)}...{proposal.author.substring(proposal.author.length - 6)}
                      </span>
                    </span>
                    <span>
                      {formatDate(proposal.start)} - {formatDate(proposal.end)}
                    </span>
                  </div>

                  {proposal.choices.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h4 className="font-semibold text-gray-900">Voting Results</h4>
                      {proposal.choices.map((choice, index) => (
                        <div key={choice} className="space-y-2">
                          <div className="flex-between">
                            <span className="text-sm font-medium text-gray-700">{choice}</span>
                            <span className="text-sm text-gray-600">
                              {proposal.scores[index]?.toFixed(0) || 0} votes
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-primary h-3 rounded-full transition-all duration-500"
                              style={{
                                width:
                                  proposal.scores_total > 0
                                    ? `${(proposal.scores[index] / proposal.scores_total) * 100}%`
                                    : "0%",
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center text-sm text-gray-500">
                        Total votes: {proposal.scores_total.toFixed(0)}
                      </div>
                    </div>
                  )}

                  {getProposalStatus(proposal) === "Active" && (
                    <div className="flex gap-3">
                      {proposal.choices.map((choice, index) => (
                        <button
                          key={choice}
                          onClick={() => voteOnProposal(proposal.id, index)}
                          className="btn btn-secondary flex-1"
                        >
                          Vote {choice}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">ℹ️ How Governance Works</h2>
            <p className="card-description">Learn about the Green Credits governance process</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">📊</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Voting Power</h3>
                  <p className="text-sm text-gray-600">Voting power is determined by your GCT token balance. 1 GCT = 1 vote.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">⏰</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Proposal Timeline</h3>
                  <p className="text-sm text-gray-600">Proposals run for 7 days. A 10% quorum is required for approval.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🔐</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Execution</h3>
                  <p className="text-sm text-gray-600">Approved proposals are executed via Gnosis Safe multisig wallet.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">📋</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Proposal Types</h3>
                  <p className="text-sm text-gray-600">Parameter changes, verifier management, and NGO approvals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;
