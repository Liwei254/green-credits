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

const GovernanceNew: React.FC<Props> = ({ provider }) => {
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
    <div className="container-responsive">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🌱 Green Credits DAO</h1>
          <p className="text-gray-600 text-lg">Community governance for the Green Credits platform</p>
        </div>

        {/* Create Proposal Section */}
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
                    {key === 'parameterChange' ? '⚙️' : key === 'verifierManagement' ? '👥' : '🏢'}
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
                  {proposalTemplates[selectedTemplate as keyof typeof proposalTemplates].title}
                </h3>
                <button
                  onClick={() => setSelectedTemplate("")}
                  className="btn btn-secondary"
                >
                  ← Back to templates
                </button>
              </div>

              <div className="bg-info-bg border border-info rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {proposalTemplates[selectedTemplate as keyof typeof proposalTemplates].description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {proposalTemplates[selectedTemplate as keyof typeof proposalTemplates].fields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="label">{field.label}</label>
                    {field.type === "select" && 'options' in field ? (
                      <select
                        export { default } from "../pages/Governance";
                        value={proposalForm.parameters[field.name] || field.default}
