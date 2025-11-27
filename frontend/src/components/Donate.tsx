import React, { useState } from "react";
import { BrowserProvider, parseUnits, formatEther } from "ethers";
import { getContracts } from "../utils/contract";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const DonateNew: React.FC<Props> = ({ provider }) => {
  const [ngo, setNgo] = useState("");
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  export { default } from "../pages/Donate";
  const [estimatedGasDonate, setEstimatedGasDonate] = useState<string>("");
