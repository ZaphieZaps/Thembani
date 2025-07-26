import React, { useState, useEffect, useCallback } from 'react';
import { LuWallet, LuChartBar, LuUsers, LuMapPin, LuGitPullRequest, LuLightbulb, LuTrafficCone } from 'react-icons/lu';
import { ethers } from 'ethers';

// --- Smart Contract Configuration ---
// These values are constant and do not depend on component state or props,
// so they can be defined once outside the component to prevent re-creation on renders.
const CONTRACT_ADDRESS = "0x0b371Dd39a65fcBfF7F320c8AF405CD1157c0d71"; // YOUR NEWLY DEPLOYED CONTRACT ADDRESS
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potholeId",
				"type": "uint256"
			}
		],
		"name": "contributeToPothole",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potholeId",
				"type": "uint256"
			}
		],
		"name": "markPotholeFixed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "contributor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "currentRaisedFunds",
				"type": "uint256"
			}
		],
		"name": "PotholeContributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "fixer",
				"type": "address"
			}
		],
		"name": "PotholeFixed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requiredFunds",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "reporter",
				"type": "address"
			}
		],
		"name": "PotholeReported",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_coordinates",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_imageUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_requiredFunds",
				"type": "uint256"
			}
		],
		"name": "reportPothole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "getAllPotholeIds",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potholeId",
				"type": "uint256"
			}
		],
		"name": "getPothole",
		"outputs": [
			{
				"internalType": "string",
				"name": "location_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "coordinates_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl_",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "requiredFunds_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "raisedFunds_",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isFixed_",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "reportedDate_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "contributorsCount_",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPotholeCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "potholeIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "potholes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "coordinates",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "requiredFunds",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "raisedFunds",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isFixed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "reportedDate",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "reporter",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "contributorsCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalContributions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
// --- End Smart Contract Configuration ---


// Main App component
function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [potholes, setPotholes] = useState([]); // State to hold pothole data from blockchain
  const [totalRaised, setTotalRaised] = useState('$0.00');
  const [activePotholes, setActivePotholes] = useState(0);
  const [fixedPotholes, setFixedPotholes] = useState(0);
  const [contributors, setContributors] = useState(0);
  const [contractName, setContractName] = useState('InfraDAO');
  const [activeTab, setActiveTab] = useState('dashboard'); // New state for active tab

  // State for reporting a new pothole modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [newPotholeLocation, setNewPotholeLocation] = useState('');
  const [newPotholeDescription, setNewPotholeDescription] = useState('');
  const [newPotholeCoordinates, setNewPotholeCoordinates] = useState('');
  const [newPotholeFile, setNewPotholeFile] = useState(null); // State for the actual file object
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // State for image preview URL
  const [newPotholeRequiredFunds, setNewPotholeRequiredFunds] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false); // State for upload loading indicator


  // Function to display a custom message box (replaces alert())
  const showMessageBox = (title, message, type = 'info') => {
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    let titleColor = 'text-gray-800';
    if (type === 'error') {
      titleColor = 'text-red-600';
    } else if (type === 'success') {
      titleColor = 'text-green-600';
    }

    messageBox.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full rounded-xl">
        <p class="text-lg font-semibold ${titleColor} mb-4">${title}</p>
        <p class="text-gray-700 mb-6">${message}</p>
        <button id="closeMessageBox" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          OK
        </button>
      </div>
    `;
    document.body.appendChild(messageBox);
    document.getElementById('closeMessageBox').onclick = () => document.body.removeChild(messageBox);
  };

  // Function to connect MetaMask
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setWalletConnected(true);

        const network = await provider.getNetwork();
        setNetworkId(network.chainId);

        showMessageBox("Success", `MetaMask connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts.length - 4)} on Network ID: ${network.chainId}`, 'success');

        // Listen for account and network changes
        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            setWalletConnected(true);
            showMessageBox("Account Changed", `Switched to account: ${newAccounts[0].substring(0, 6)}...${newAccounts[0].substring(newAccounts[0].length - 4)}`, 'info');
          } else {
            setWalletConnected(false);
            setAccount('');
            showMessageBox("Disconnected", "MetaMask account disconnected.", 'info');
          }
        });

        window.ethereum.on('chainChanged', (newChainId) => {
          setNetworkId(parseInt(newChainId, 16));
          showMessageBox("Network Changed", `Switched to network ID: ${parseInt(newChainId, 16)}`, 'info');
          fetchBlockchainData(); // Re-fetch data on network change
        });

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        showMessageBox("Connection Error", `Failed to connect MetaMask: ${error.message}. Please ensure it's installed and unlocked.`, 'error');
      }
    } else {
      showMessageBox("MetaMask Not Found", "MetaMask is not installed. Please install it to connect your wallet.", 'error');
    }
  };

  // Function for fetching real-time data from smart contracts
  const fetchBlockchainData = useCallback(async () => {
    // Fallback to dummy data if MetaMask not detected or contract not configured
    if (typeof window.ethereum === 'undefined' || !CONTRACT_ADDRESS || CONTRACT_ABI.length === 0) {
      console.warn("MetaMask not detected or contract not configured. Using dummy data.");
      setTotalRaised('$1150.00');
      setActivePotholes(0);
      setFixedPotholes(0);
      setContributors(0);
      setPotholes([]); // Clear potholes if contract not configured
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Fetch Total Contributions
      const rawTotalContributions = await contract.totalContributions(); // Using public state variable getter
      setTotalRaised(`$${ethers.utils.formatEther(rawTotalContributions)}`);

      // Fetch Pothole Count
      const potholeCount = await contract.getPotholeCount();
      let active = 0;
      let fixed = 0;
      let allPotholes = [];
      let uniqueContributors = new Set(); // To count unique contributors across all potholes

      // Fetch all pothole IDs
      const allPotholeIds = await contract.getAllPotholeIds();

      for (let i = 0; i < allPotholeIds.length; i++) {
        const potholeId = allPotholeIds[i];
        // Destructure named outputs from getPothole
        const [
          location,
          description,
          coordinates,
          imageUrl, // Added imageUrl here
          requiredFunds,
          raisedFunds,
          isFixed,
          reportedDate,
          contributorsCount
        ] = await contract.getPothole(potholeId);

        if (isFixed) {
          fixed++;
        } else {
          active++;
        }

        allPotholes.push({
          id: potholeId.toNumber(),
          location,
          coords: coordinates,
          description,
          imageUrl: imageUrl, // Assign imageUrl
          required: ethers.utils.formatEther(requiredFunds),
          progress: ethers.utils.formatEther(raisedFunds),
          isFixed,
          contributors: contributorsCount.toNumber(), // Use the count from the struct
          date: new Date(reportedDate.toNumber() * 1000).toLocaleDateString() // Convert timestamp to readable date
        });
      }

      setActivePotholes(active);
      setFixedPotholes(fixed);
      setPotholes(allPotholes);

      const totalUniqueContributorsSum = allPotholes.reduce((sum, p) => sum + p.contributors, 0);
      setContributors(totalUniqueContributorsSum);

      // Fetch Contract Name
      try {
          const nameAbiEntry = CONTRACT_ABI.find(item => item.name === 'name' && item.type === 'function' && item.stateMutability === 'view');
          if (nameAbiEntry) {
              const fetchedName = await contract.name();
              setContractName(fetchedName);
          } else {
              console.warn("Contract does not appear to have a public 'name' state variable getter in ABI.");
              setContractName('InfraDAO'); // Default fallback
          }
      } catch (nameError) {
          console.error("Error fetching contract name:", nameError);
          setContractName('InfraDAO'); // Default fallback
      }


    } catch (error) {
      console.error("Error fetching blockchain data:", error);
      showMessageBox("Blockchain Data Error", `Failed to fetch data from contract: ${error.message}. Check console for details.`, 'error');
      // Fallback to dummy data on error
      setTotalRaised('$1150.00');
      setActivePotholes(0);
      setFixedPotholes(0);
      setContributors(0);
      setPotholes([]);
    }
  }, []); // Dependencies for useCallback: None, as CONTRACT_ADDRESS and CONTRACT_ABI are external constants


  // Load data on component mount and when wallet connection changes
  useEffect(() => {
    fetchBlockchainData();
  }, [walletConnected, fetchBlockchainData]);

  // New useEffect to get network ID on initial load
  useEffect(() => {
    const getInitialNetwork = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          setNetworkId(network.chainId);
        } catch (error) {
          console.error("Error getting initial network ID:", error);
          // Don't show message box here, just log, as it's an initial check
        }
      }
    };
    getInitialNetwork();
  }, []); // Empty dependency array means this runs once on mount

  // Handle file selection for image upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewPotholeFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result); // Set Base64 string for preview
      };
      reader.readAsDataURL(file); // Read file as Base64
    } else {
      setNewPotholeFile(null);
      setImagePreviewUrl(null);
    }
  };


  // Function to handle reporting a new issue
  const handleReportIssue = async () => {
    if (!walletConnected || !account) {
      showMessageBox("Wallet Required", "Please connect your MetaMask wallet to report an issue.", 'info');
      return;
    }
    if (!newPotholeLocation || !newPotholeDescription || !newPotholeRequiredFunds) {
      showMessageBox("Missing Information", "Please fill in all required fields for the new pothole (Location, Description, Required Funds).", 'warning');
      return;
    }

    setUploadingImage(true); // Start loading indicator
    let imageUrlToStore = '';

    if (newPotholeFile) {
      // For demo: Convert file to Base64 to store on-chain.
      // WARNING: Storing large Base64 strings on-chain is extremely expensive and inefficient.
      // In a real DApp, you would upload to IPFS/Arweave and store the CID here.
      const reader = new FileReader();
      reader.readAsDataURL(newPotholeFile);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          imageUrlToStore = reader.result;
          resolve();
        };
      });
      showMessageBox("Warning (Demo Only)", "Image is being stored as Base64 on-chain for demonstration. In production, use IPFS/Arweave and store the CID.", 'warning');
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      showMessageBox("Reporting Pothole...", "Please confirm the transaction in MetaMask.", 'info');

      const requiredFundsWei = ethers.utils.parseEther(newPotholeRequiredFunds.toString());
      const tx = await contract.reportPothole(
        newPotholeLocation,
        newPotholeDescription,
        newPotholeCoordinates, // Can be empty string
        imageUrlToStore, // Pass the Base64 image data or empty string
        requiredFundsWei
      );
      await tx.wait();

      showMessageBox("Success", "Pothole reported successfully!", 'success');
      setShowReportModal(false); // Close modal
      // Clear form fields and image states
      setNewPotholeLocation('');
      setNewPotholeDescription('');
      setNewPotholeCoordinates('');
      setNewPotholeFile(null);
      setImagePreviewUrl(null);
      setNewPotholeRequiredFunds('');
      fetchBlockchainData(); // Refresh data
    } catch (error) {
      console.error("Error reporting pothole:", error);
      showMessageBox("Transaction Failed", `Failed to report pothole: ${error.message}. Check console for details.`, 'error');
    } finally {
      setUploadingImage(false); // End loading indicator
    }
  };


  // Function for contributing to a pothole
  const contributeToPothole = async (potholeId, amount) => {
    if (!walletConnected || !account) {
      showMessageBox("Wallet Required", "Please connect your MetaMask wallet to contribute.", 'info');
      return;
    }
    if (!CONTRACT_ADDRESS || CONTRACT_ABI.length === 0) {
      showMessageBox("Contract Not Configured", "Smart contract address or ABI is missing. Cannot contribute.", 'error');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      showMessageBox("Contributing...", `Please confirm the transaction in MetaMask to contribute ${amount} ETH.`, 'info');
      const tx = await contract.contributeToPothole(potholeId, { value: ethers.utils.parseEther(amount.toString()) });
      await tx.wait(); // Wait for the transaction to be mined

      showMessageBox("Success", `Contributed ${amount} ETH to Pothole #${potholeId}! Total contributions updated.`, 'success');
      fetchBlockchainData(); // Refresh data after contribution
    } catch (error) {
      console.error("Error contributing:", error);
      showMessageBox("Transaction Failed", `Failed to contribute: ${error.message}. Check console for details.`, 'error');
    }
  };

  // Function to mark a pothole as fixed
  const markPotholeFixed = async (potholeId) => {
    if (!walletConnected || !account) {
      showMessageBox("Wallet Required", "Please connect your MetaMask wallet to mark a pothole as fixed.", 'info');
      return;
    }
    if (!CONTRACT_ADDRESS || CONTRACT_ABI.length === 0) {
      showMessageBox("Contract Not Configured", "Smart contract address or ABI is missing. Cannot mark pothole fixed.", 'error');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      showMessageBox("Marking Fixed...", `Please confirm the transaction in MetaMask to mark Pothole #${potholeId} as fixed.`, 'info');
      const tx = await contract.markPotholeFixed(potholeId);
      await tx.wait();

      showMessageBox("Success", `Pothole #${potholeId} marked as fixed!`, 'success');
      fetchBlockchainData(); // Refresh data
    } catch (error) {
      console.error("Error marking pothole fixed:", error);
      showMessageBox("Transaction Failed", `Failed to mark pothole fixed: ${error.message}. Check console for details.`, 'error');
    }
  };


  return (
    // Main container with full height and background
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col text-gray-800">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm py-3 px-6 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-blue-700">{contractName || 'InfraDAO'}</h1>
            <span className="text-sm text-gray-500">Community-Driven Infrastructure</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">Polygon Network</span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-mono">
              {networkId ? `ID: ${networkId}` : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow container mx-auto p-6">
        {/* Main Navigation Tabs */}
        <nav className="bg-white p-2 rounded-lg shadow-md mb-6 flex justify-center space-x-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-700 border-blue-700' : 'text-gray-600 hover:text-blue-700 hover:border-blue-700 border-transparent'
            }`}
          >
            <LuChartBar className="text-lg" />
            <span>Dashboard</span>
          </button>
          {/* Removed "Contribute" as a separate tab, as its functionality is integrated into the Dashboard */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'analytics' ? 'text-blue-700 border-blue-700' : 'text-gray-600 hover:text-blue-700 hover:border-blue-700 border-transparent'
            }`}
          >
            <LuChartBar className="text-lg" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center space-x-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'team' ? 'text-blue-700 border-blue-700' : 'text-gray-600 hover:text-blue-700 hover:border-blue-700 border-transparent'
            }`}
          >
            <LuUsers className="text-lg" />
            <span>Team</span>
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center space-x-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'business' ? 'text-blue-700 border-blue-700' : 'text-gray-600 hover:text-blue-700 hover:border-blue-700 border-transparent'
            }`}
          >
            <LuLightbulb className="text-lg" />
            <span>Business</span>
          </button>
          <button
            onClick={() => setActiveTab('tokenomics')}
            className={`flex items-center space-x-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'tokenomics' ? 'text-blue-700 border-blue-700' : 'text-gray-600 hover:text-blue-700 hover:border-blue-700 border-transparent'
            }`}
          >
            <LuTrafficCone className="text-lg" />
            <span>Tokenomics</span>
          </button>
        </nav>


        {/* Conditional Rendering for Tabs */}
        {activeTab === 'dashboard' && (
          <>
            {/* MetaMask Connection Section */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">MetaMask Connection</h2>
              <p className="text-gray-600 mb-4">Connect your MetaMask wallet to interact with smart contracts.</p>
              <button
                onClick={connectMetaMask}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center space-x-2"
              >
                <LuWallet className="text-lg" />
                <span>{walletConnected ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect MetaMask'}</span>
              </button>
              {walletConnected && (
                <p className="text-sm text-gray-500 mt-2">
                  Your Account: {account} <br/>
                  Network ID: {networkId}
                </p>
              )}
            </section>

            {/* Infrastructure DAO Dashboard */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Infrastructure DAO Dashboard</h2>
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    // Reset image states when opening modal
                    setNewPotholeFile(null);
                    setImagePreviewUrl(null);
                    setUploadingImage(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center space-x-2"
                >
                  <LuMapPin className="text-lg" />
                  <span>Report Issue</span>
                </button>
              </div>
              <p className="text-gray-600 mb-6">Community-driven infrastructure repair funding</p>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Total Raised</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{totalRaised}</p>
                  <p className="text-sm text-gray-500">ETH</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Active Potholes</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{activePotholes}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Fixed Potholes</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{fixedPotholes}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Total Contributors</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{contributors}</p>
                </div>
              </div>
            </section>

            {/* Recent Reports Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Reports</h2>
              {potholes.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No potholes reported yet. Be the first!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {potholes.map(pothole => (
                    <div key={pothole.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                      {/* Pothole Image */}
                      {(pothole.imageUrl && pothole.imageUrl.startsWith('data:image')) ? ( // Check for Base64 image
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={pothole.imageUrl}
                            alt={`Pothole ${pothole.id}`}
                            className="w-full h-48 object-cover object-center"
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                              e.target.src = `https://placehold.co/600x400/e0e0e0/555555?text=Image+Error`; // Placeholder on error
                            }}
                          />
                        </div>
                      ) : (pothole.imageUrl && pothole.imageUrl.startsWith('http')) ? ( // Check for external URL
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={pothole.imageUrl}
                            alt={`Pothole ${pothole.id}`}
                            className="w-full h-48 object-cover object-center"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://placehold.co/600x400/e0e0e0/555555?text=Image+Error`;
                            }}
                          />
                        </div>
                      ) : ( // No image or invalid URL
                        <div className="mb-4 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center h-48">
                          <span className="text-gray-500">No Image Provided</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold">Pothole #{pothole.id}</h3>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${pothole.isFixed ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {pothole.isFixed ? 'Fixed' : 'Active'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{pothole.location}</p>
                      <p className="text-gray-500 text-sm mb-4">{pothole.coords}</p>
                      <p className="text-gray-700 mb-4">{pothole.description}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{pothole.progress} ETH / {pothole.required} ETH</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(parseFloat(pothole.progress) / parseFloat(pothole.required)) * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>Reported: {pothole.date}</span>
                        <span><LuUsers className="inline-block mr-1" /> {pothole.contributors} Contributors</span>
                      </div>
                      <div className="flex space-x-2 mt-auto">
                        <button
                          onClick={() => contributeToPothole(pothole.id, 0.01)} // Example: contribute 0.01 ETH
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={pothole.isFixed}
                        >
                          Contribute
                        </button>
                        {!pothole.isFixed && (
                          <button
                            onClick={() => markPotholeFixed(pothole.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                          >
                            Mark Fixed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'analytics' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h2>
            <p className="text-gray-600 mb-4">
              This section would display various data visualizations related to InfraDAO's performance.
              For example:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Contribution trends over time.</li>
              <li>Pothole reporting frequency by location.</li>
              <li>Average time to fix a pothole.</li>
              <li>Top contributors.</li>
              <li>Distribution of required funds vs. raised funds.</li>
            </ul>
            <p className="mt-4 text-gray-500">
              (Integration with charting libraries like Recharts or D3.js would go here.)
            </p>
          </section>
        )}

        {activeTab === 'team' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Team</h2>
            <p className="text-gray-600 mb-4">
              Meet the dedicated team behind InfraDAO!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <LuUsers className="text-5xl text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-blue-800">Core Developers</h3>
                <p className="text-blue-700 text-sm">Building the smart contracts and frontend.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <LuLightbulb className="text-5xl text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-green-800">Community Managers</h3>
                <p className="text-green-700 text-sm">Engaging with users and fostering growth.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <LuChartBar className="text-5xl text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-purple-800">Strategy & Operations</h3>
                <p className="text-purple-700 text-sm">Guiding the project's vision and execution.</p>
              </div>
            </div>
            <p className="mt-6 text-gray-500">
              (Detailed team member profiles and roles would be listed here.)
            </p>
          </section>
        )}

        {activeTab === 'business' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Model</h2>
            <p className="text-gray-600 mb-4">
              InfraDAO operates on a transparent and community-driven business model.
              Key aspects include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>**Decentralized Funding:** Funds are raised directly from community contributions.</li>
              <li>**Transparent Spending:** All expenditures for pothole repairs are recorded on-chain.</li>
              <li>**Governance:** Future plans include a DAO governance model where token holders can vote on proposals.</li>
              <li>**Sustainability:** Exploring mechanisms for long-term project sustainability and growth.</li>
            </ul>
            <p className="mt-4 text-gray-500">
              (More detailed whitepaper or business plan information would be linked here.)
            </p>
          </section>
        )}

        {activeTab === 'tokenomics' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tokenomics</h2>
            <p className="text-gray-600 mb-4">
              Information about the InfraDAO token ($INFRA) and its economic model.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-yellow-800 mb-2">Token Utility</h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  <li>Governance voting rights.</li>
                  <li>Staking rewards.</li>
                  <li>Incentives for reporting and fixing infrastructure issues.</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-red-800 mb-2">Token Distribution</h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>Community Treasury: XX%</li>
                  <li>Liquidity Pools: XX%</li>
                  <li>Team & Advisors: XX%</li>
                  <li>Public Sale/Airdrop: XX%</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-gray-500">
              (Detailed tokenomics paper and audit reports would be linked here.)
            </p>
          </section>
        )}

      </div>

      {/* Report Pothole Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Report New Pothole</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  id="location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Main St & 1st Ave"
                  value={newPotholeLocation}
                  onChange={(e) => setNewPotholeLocation(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Large pothole causing traffic issues near the intersection."
                  value={newPotholeDescription}
                  onChange={(e) => setNewPotholeDescription(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700 mb-1">Coordinates (Optional)</label>
                <input
                  type="text"
                  id="coordinates"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., -28.2341, 30.2473"
                  value={newPotholeCoordinates}
                  onChange={(e) => setNewPotholeCoordinates(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
                {imagePreviewUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img src={imagePreviewUrl} alt="Pothole Preview" className="max-w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="requiredFunds" className="block text-sm font-medium text-gray-700 mb-1">Required Funds (ETH)</label>
                <input
                  type="number"
                  id="requiredFunds"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 0.5"
                  value={newPotholeRequiredFunds}
                  onChange={(e) => setNewPotholeRequiredFunds(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  // Clear form fields and image states on cancel
                  setNewPotholeLocation('');
                  setNewPotholeDescription('');
                  setNewPotholeCoordinates('');
                  setNewPotholeFile(null);
                  setImagePreviewUrl(null);
                  setNewPotholeRequiredFunds('');
                  setUploadingImage(false);
                }}
                className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={uploadingImage} // Disable button during upload
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Report Pothole'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-auto rounded-t-lg shadow-lg">
        <div className="container mx-auto text-center text-sm flex flex-wrap justify-center items-center space-x-4">
          <span>&copy; {new Date().getFullYear()} InfraDAO - Fixing Infrastructure Together</span>
          <span className="hidden md:inline">|</span>
          <span>Built on Polygon</span>
          <span className="hidden md:inline">|</span>
          <span>Powered by Community</span>
          <span className="hidden md:inline">|</span>
          <a href="https://potholedao.space" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">potholedao.space</a>
        </div>
      </footer>
    </div>
  );
}

export default App;











