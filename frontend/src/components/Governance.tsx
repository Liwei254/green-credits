import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import snapshot from "@snapshot-labs/snapshot.js";
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

const Governance: React.FC<Props> = ({ provider }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
    type: "",
    parameters: {} as any
  });

  const spaceId = "greencredits.eth"; // Replace with actual space ID

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      // Note: Snapshot space "greencredits.eth" doesn't exist yet
      // This is a demo implementation - proposals would load from a real Snapshot space
      // For now, we'll just show the "No proposals found" message
      setProposals([]);
    } catch (error) {
      console.error("Error loading proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const proposalTemplates = {
    parameterChange: {
      title: "Parameter Change Proposal",
      description: "Propose changes to system parameters like stake requirements, challenge windows, or reward multipliers.",
      fields: [
        { name: "challengeWindow", label: "Challenge Window (seconds)", type: "number", default: 86400 },
        { name: "submitStake", label: "Submit Stake (DEV)", type: "number", default: 0.01 },
        { name: "verifyStake", label: "Verify Stake (DEV)", type: "number", default: 0.05 },
        { name: "bufferBps", label: "Buffer Percentage (basis points)", type: "number", default: 1000 }
      ]
    },
    verifierManagement: {
      title: "Verifier Management Proposal",
      description: "Add or remove verifiers from the system.",
      fields: [
        { name: "action", label: "Action", type: "select", options: ["add", "remove"] as string[], default: "add" },
        { name: "verifierAddress", label: "Verifier Address", type: "text", default: "" }
      ]
    },
    ngoApproval: {
      title: "NGO Approval Proposal",
      description: "Approve or reject NGOs for receiving donations.",
      fields: [
        { name: "action", label: "Action", type: "select", options: ["approve", "reject"] as string[], default: "approve" },
        { name: "ngoAddress", label: "NGO Address", type: "text", default: "" },
        { name: "ngoName", label: "NGO Name", type: "text", default: "" },
        { name: "justification", label: "Justification", type: "textarea", default: "" }
      ]
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = proposalTemplates[templateKey as keyof typeof proposalTemplates];
    setProposalForm({
      title: template.title,
      description: template.description,
      type: templateKey,
      parameters: {}
    });
  };

  const handleParameterChange = (field: string, value: any) => {
    setProposalForm(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [field]: value
      }
    }));
  };

  const createProposal = async () => {
    try {
      if (!provider) {
        toast.error("Wallet not connected");
        return;
      }

      // Note: Snapshot.js proposal creation requires a Snapshot Hub API key and proper setup
      // This is a placeholder implementation showing the UI flow
      // For production, you would need to:
      // 1. Set up a Snapshot space at https://snapshot.org
      // 2. Use the Snapshot Hub API with proper authentication
      // 3. Or use a backend service to create proposals
      
      toast("Proposal creation requires Snapshot space setup. This is a demo of the UI flow.", { icon: 'ℹ️' });
      
      // Simulate proposal creation for demo purposes
      const mockProposal = {
        id: `proposal-${Date.now()}`,
        title: proposalForm.title,
        body: `${proposalForm.description}\n\nTemplate: ${selectedTemplate}\nParameters: ${JSON.stringify(proposalForm.parameters, null, 2)}`,
        choices: selectedTemplate === 'parameterChange' 
          ? ['Approve Changes', 'Reject Changes']
          : selectedTemplate === 'verifierManagement'
          ? [`${proposalForm.parameters.action?.charAt(0).toUpperCase() + proposalForm.parameters.action?.slice(1)} Verifier`, 'Reject']
          : [`${proposalForm.parameters.action?.charAt(0).toUpperCase() + proposalForm.parameters.action?.slice(1)} NGO`, 'Reject'],
        start: Math.floor(Date.now() / 1000),
        end: Math.floor(Date.now() / 1000) + 86400 * 7,
        state: 'active',
        author: await (await provider.getSigner()).getAddress(),
        scores: [0, 0],
        scores_total: 0
      };

      // In production, this would be: await snapshot.utils.propose(...)
      console.log("Would create proposal:", mockProposal);
      
      toast.success("Demo: Proposal would be created with these details (check console)");
      
      // Reset form
      setSelectedTemplate("");
      setProposalForm({
        title: "",
        description: "",
        type: "",
        parameters: {}
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

      // Note: Snapshot.js voting also requires proper setup
      // This is a placeholder showing the UI flow
      toast("Voting requires Snapshot space setup. This is a demo of the UI flow.", { icon: 'ℹ️' });
      console.log("Would vote on proposal:", { proposalId, choice, space: spaceId });
      
      toast.success("Demo: Vote would be cast (check console for details)");
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to vote");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getProposalStatus = (proposal: Proposal) => {
    const now = Date.now() / 1000;
    if (now < proposal.start) return "Pending";
    if (now < proposal.end) return "Active";
    return "Closed";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🌱 Green Credits DAO</h1>
        <p className="text-gray-600">Community governance for the Green Credits platform</p>
      </div>

      {/* Create Proposal Section */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">📝 Create Proposal</h2>

        {!selectedTemplate ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(proposalTemplates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-semibold mb-2">{template.title}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {proposalTemplates[selectedTemplate as keyof typeof proposalTemplates].title}
              </h3>
              <button
                onClick={() => setSelectedTemplate("")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to templates
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {proposalTemplates[selectedTemplate as keyof typeof proposalTemplates].fields.map((field) => (
                <div key={field.name} className="form-group">
                  <label className="label">{field.label}</label>
                  {field.type === "select" && 'options' in field ? (
                    <select
                      className="input"
                      value={proposalForm.parameters[field.name] || field.default}
                      onChange={(e) => handleParameterChange(field.name, e.target.value)}
                    >
                      {field.options.map((option: string) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="input resize-none"
                      rows={3}
                      value={proposalForm.parameters[field.name] || field.default}
                      onChange={(e) => handleParameterChange(field.name, e.target.value)}
                      placeholder={field.label}
                    />
                  ) : (
                    <input
                      className={field.type === "number" ? "input" : "input"}
                      type={field.type}
                      value={proposalForm.parameters[field.name] || field.default}
                      onChange={(e) => handleParameterChange(field.name, e.target.value)}
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <button onClick={createProposal} className="btn btn-primary">
                🚀 Create Proposal
              </button>
              <button
                onClick={() => setSelectedTemplate("")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Proposals */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">📋 Active Proposals</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No proposals found. Be the first to create one!
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{proposal.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    getProposalStatus(proposal) === "Active"
                      ? "bg-green-100 text-green-800"
                      : getProposalStatus(proposal) === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {getProposalStatus(proposal)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {proposal.body.substring(0, 200)}...
                </p>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>By {proposal.author.substring(0, 6)}...{proposal.author.substring(38)}</span>
                  <span>{formatDate(proposal.start)} - {formatDate(proposal.end)}</span>
                </div>

                {proposal.choices.length > 0 && (
                  <div className="space-y-2">
                    {proposal.choices.map((choice, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{choice}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: proposal.scores_total > 0
                                  ? `${(proposal.scores[index] / proposal.scores_total) * 100}%`
                                  : "0%"
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {proposal.scores[index]?.toFixed(0) || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {getProposalStatus(proposal) === "Active" && (
                  <div className="mt-4 flex space-x-2">
                    {proposal.choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => voteOnProposal(proposal.id, index)}
                        className="btn btn-sm btn-secondary"
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

      {/* Governance Info */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">ℹ️ How Governance Works</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">📊 Voting Power</h3>
            <p className="text-sm text-gray-600">
              Voting power is determined by your GCT token balance. 1 GCT = 1 vote.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">⏰ Proposal Timeline</h3>
            <p className="text-sm text-gray-600">
              Proposals run for 7 days. A 10% quorum is required for approval.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🔐 Execution</h3>
            <p className="text-sm text-gray-600">
              Approved proposals are executed via Gnosis Safe multisig wallet.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📋 Proposal Types</h3>
            <p className="text-sm text-gray-600">
              Parameter changes, verifier management, and NGO approvals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;
