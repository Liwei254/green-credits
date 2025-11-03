import React, { useState } from "react";

interface Step {
  title: string;
  content: React.ReactNode;
  showButtons?: boolean;
}

interface WalkthroughProps {
  onClose: () => void;
  onConnect: () => void;
  onDemo: () => void;
}

const Walkthrough: React.FC<WalkthroughProps> = ({ onClose, onConnect, onDemo }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "Welcome to Green Credits",
      content: (
        <div className="text-center">
          <p className="mb-4">
            Green Credits is a platform that rewards you with Green Credit Tokens (GCT) for real-world eco-actions verified on the Moonbeam blockchain.
          </p>
          <p className="mb-4">
            Earn tokens by submitting proof of your positive environmental impact, such as planting trees, reducing waste, or supporting sustainable practices.
          </p>
          <p>
            Join a transparent, community-driven ecosystem that incentivizes planetary healing.
          </p>
        </div>
      ),
      showButtons: true
    },
    {
      title: "Connect Your Wallet or Try Demo",
      content: (
        <div className="text-center">
          <p className="mb-4">
            To start earning and managing your GCT tokens, connect a Web3 wallet like MetaMask.
          </p>
          <p className="mb-4">
            Alternatively, explore the platform in demo mode to see how it works without connecting a wallet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onConnect} className="btn btn-primary">
              🔗 Connect Wallet
            </button>
            <button onClick={onDemo} className="btn btn-secondary">
              🎮 Try Demo Mode
            </button>
          </div>
        </div>
      ),
      showButtons: false
    },
    {
      title: "Mobile Wallet Recommendations",
      content: (
        <div className="text-center">
          <p className="mb-4">
            For the best mobile experience, we recommend using mobile-friendly wallets that support Web3 connections.
          </p>
          <div className="mb-4 space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">MetaMask Mobile</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Popular browser extension wallet with a mobile app. Supports dApps and easy network switching.
              </p>
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                Download MetaMask Mobile
              </a>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200">WalletConnect</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Connects your mobile wallet to dApps via QR code scanning. Works with wallets like Trust Wallet, Rainbow, and more.
              </p>
              <a href="https://walletconnect.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline">
                Learn about WalletConnect
              </a>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200">Trust Wallet</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                User-friendly mobile wallet with built-in dApp browser and multi-chain support.
              </p>
              <a href="https://trustwallet.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 underline">
                Download Trust Wallet
              </a>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>FAQ:</strong> If connection fails, ensure your wallet app is updated and try refreshing the page. For mobile, use the in-app browser or scan QR codes for WalletConnect.
          </p>
          <p className="text-xs text-green-600 mt-2">
            💡 Pro tip: Use MetaMask Mobile for the best experience on your phone!
          </p>
        </div>
      ),
      showButtons: true
    },
    {
      title: "How to Submit an Action",
      content: (
        <div className="text-center">
          <p className="mb-4">
            Go to the "Submit Action" page to share your eco-friendly activities.
          </p>
          <p className="mb-4">
            Fill out the form with a description, optional proof image, and details. Your submission will be verified by the community.
          </p>
          <p>
            Once verified, you'll earn GCT tokens based on the impact of your action.
          </p>
        </div>
      ),
      showButtons: true
    },
    {
      title: "How to Donate",
      content: (
        <div className="text-center">
          <p className="mb-4">
            Use your earned GCT tokens to support environmental causes and NGOs.
          </p>
          <p className="mb-4">
            On the "Donate" page, select an allowlisted NGO and specify the amount to contribute.
          </p>
          <p>
            Your donations help fund real-world conservation efforts.
          </p>
        </div>
      ),
      showButtons: true
    },
    {
      title: "Moonbase Network Requirement",
      content: (
        <div className="text-center">
          <p className="mb-4">
            All transactions on Green Credits occur on the Moonbase Alpha testnet, part of the Moonbeam ecosystem on Polkadot.
          </p>
          <p className="mb-4">
            This allows for fast, low-cost testing and development while maintaining security and interoperability.
          </p>
          <p>
            Your wallet will automatically switch to Moonbase Alpha when connecting.
          </p>
        </div>
      ),
      showButtons: true
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finish = () => {
    localStorage.setItem("onboardingCompleted", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index <= currentStep ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            {steps[currentStep].title}
          </h2>

          {/* Content */}
          <div className="mb-6 text-gray-600 dark:text-gray-300">
            {steps[currentStep].content}
          </div>

          {/* Buttons */}
          {steps[currentStep].showButtons && (
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={currentStep === steps.length - 1 ? finish : nextStep}
                className="btn btn-primary"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;
