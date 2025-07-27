import React, { useState, useEffect, useCallback } from 'react';
import { LuWallet, LuChartBar, LuUsers, LuMapPin, LuLightbulb, LuTrafficCone, LuShieldCheck, LuScrollText, LuBanknote } from 'react-icons/lu';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet itself for custom icon

import { ethers } from 'ethers';

// Import new components
import AdminDashboard from './AdminDashboard';
import ReportIssueModal from './ReportIssueModal';

// Fix for default marker icon issues with Webpack/Vite
// This is necessary because Leaflet's default icons rely on images
// that might not be correctly resolved by bundlers without this fix.
delete L.Icon.Default.prototype._get
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

// Custom icons for different issue types
// These use Leaflet Color Markers for visual distinction
const potholeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const trafficLightIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- Smart Contract Configuration ---
// These values are constant and do not depend on component state or props,
// so they can be defined once outside the component to prevent re-creation on renders.
const CONTRACT_ADDRESS = "0xE984862e050f5B806DaBaA493CECE39E0d87154f"; // UPDATED CONTRACT ADDRESS
const CONTRACT_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			}
		],
		"name": "ContractUpgraded",
		"type": "event"
	},
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
				"name": "_trafficLightId",
				"type": "uint256"
			}
		],
		"name": "contributeToTrafficLight",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_trafficLightId",
				"type": "uint256"
			}
		],
		"name": "markTrafficLightFixed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "pauseContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
		"name": "reportTrafficLight",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
		"name": "TrafficLightContributed",
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
		"name": "TrafficLightFixed",
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
		"name": "TrafficLightReported",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpauseContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newImplementationAddress",
				"type": "address"
			}
		],
		"name": "upgradeContract",
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
		"inputs": [],
		"name": "getAllTrafficLightIds",
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
				"name": "_trafficLightId",
				"type": "uint256"
			}
		],
		"name": "getTrafficLight",
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
		"name": "getTrafficLightCount",
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
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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
	}
];
// --- End Smart Contract Configuration ---

// --- Admin Configuration (Replace with your actual admin wallet address) ---
const ADMIN_ADDRESS = "0x02df95ebc014e7506d7911ce7607e4f4a51a92de".toLowerCase();
// --- End Admin Configuration ---

// Component to get and display user's location on the map
function LocationMarker({ setUserLocation }) {
  const map = useMapEvents({
    locationfound(e) {
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationerror(e) {
      console.error("Location error:", e.message);
      // Optionally show a message to the user that location could not be found
    },
  });

  useEffect(() => {
    map.locate(); // Request user's location when component mounts
  }, [map]);

  return null; // This component doesn't render anything visible directly
}


// Main App component
function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [potholes, setPotholes] = useState([]); // State to hold pothole data from blockchain
  const [trafficLights, setTrafficLights] = useState([]); // New state for traffic light data
  const [totalRaised, setTotalRaised] = useState('0.00'); // Changed to store raw ETH value
  const [activePotholes, setActivePotholes] = useState(0);
  const [fixedPotholes, setFixedPotholes] = useState(0);
  const [activeTrafficLights, setActiveTrafficLights] = useState(0); // New state for active traffic lights
  const [fixedTrafficLights, setFixedTrafficLights] = useState(0); // New state for fixed traffic lights
  const [contributors, setContributors] = useState(0);
  const [contractName, setContractName] = useState('InfraDAO');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [ethToZarRate, setEthToZarRate] = useState(null); // New state for ETH to ZAR rate
  const [loadingRate, setLoadingRate] = useState(true); // New state for loading indicator

  // State for the combined reporting modal
  const [showReportModal, setShowReportModal] = useState(false);

  // State for contribution amounts for each issue
  // Using an object to store amounts keyed by issue ID to manage multiple inputs
  const [contributionAmounts, setContributionAmounts] = useState({});

  // Map specific states
  const [userLocation, setUserLocation] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapFilter, setMapFilter] = useState('All Reports'); // 'All Reports', 'Potholes', 'Traffic Lights', 'National Roads', 'Provincial Roads', 'Municipal Roads'


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
        setIsAdmin(accounts[0].toLowerCase() === ADMIN_ADDRESS);

        const network = await provider.getNetwork();
        setNetworkId(network.chainId);

        showMessageBox("Success", `MetaMask connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts.length - 4)} on Network ID: ${network.chainId}`, 'success');

        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            setWalletConnected(true);
            setIsAdmin(newAccounts[0].toLowerCase() === ADMIN_ADDRESS);
            showMessageBox("Account Changed", `Switched to account: ${newAccounts[0].substring(0, 6)}...${newAccounts[0].substring(newAccounts[0].length - 4)}`, 'info');
          } else {
            setWalletConnected(false);
            setAccount('');
            setIsAdmin(false);
            showMessageBox("Disconnected", "MetaMask account disconnected.", 'info');
          }
        });

        window.ethereum.on('chainChanged', (newChainId) => {
          setNetworkId(parseInt(newChainId, 16));
          showMessageBox("Network Changed", `Switched to network ID: ${parseInt(newChainId, 16)}`, 'info');
          fetchBlockchainData();
        });

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        showMessageBox("Connection Error", `Failed to connect MetaMask: ${error.message}. Please ensure it's installed and unlocked.`, 'error');
      }
    } else {
      showMessageBox("MetaMask Not Found", "MetaMask is not installed. Please install it to connect your wallet.", 'error');
    }
  };

  // Function to convert ETH to ZAR using the fetched rate
  const convertEthToZar = (ethAmount) => {
    if (ethToZarRate === null) {
      return 'N/A'; // Or a loading indicator
    }
    return (parseFloat(ethAmount) * ethToZarRate).toFixed(2);
  };

  // Fetch ETH to ZAR rate from CoinGecko API
  useEffect(() => {
    const fetchEthToZarRate = async () => {
      setLoadingRate(true);
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=zar');
        const data = await response.json();
        if (data && data.ethereum && data.ethereum.zar) {
          setEthToZarRate(data.ethereum.zar);
        } else {
          console.error("Could not fetch ETH to ZAR rate from CoinGecko.");
          setEthToZarRate(null); // Set to null on error
        }
      } catch (error) {
        console.error("Error fetching ETH to ZAR rate:", error);
        setEthToZarRate(null); // Set to null on error
      } finally {
        setLoadingRate(false);
      }
    };

    fetchEthToZarRate();
    // Fetch rate every 5 minutes (adjust as needed, consider API rate limits)
    const intervalId = setInterval(fetchEthToZarRate, 5 * 60 * 1000); 

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


  // Function for fetching real-time data from smart contracts
  const fetchBlockchainData = useCallback(async () => {
    if (typeof window.ethereum === 'undefined' || !CONTRACT_ADDRESS || CONTRACT_ABI.length === 0) {
      console.warn("MetaMask not detected or contract not configured. Using dummy data.");
      setTotalRaised('1150.00'); // Still ETH, but without '$'
      setActivePotholes(0);
      setFixedPotholes(0);
      setActiveTrafficLights(0);
      setFixedTrafficLights(0);
      setContributors(0);
      setPotholes([]);
      setTrafficLights([]);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // --- Fetch Pothole Data ---
      let currentActivePotholes = 0;
      let currentFixedPotholes = 0;
      let allPotholes = [];
      let totalPotholeContributors = 0;

      // Ensure getAllPotholeIds exists in ABI before calling
      const getAllPotholeIdsAbiEntry = CONTRACT_ABI.find(item => item.name === 'getAllPotholeIds' && item.type === 'function' && item.stateMutability === 'view');
      if (getAllPotholeIdsAbiEntry) {
        const allPotholeIds = await contract.getAllPotholeIds();
        for (let i = 0; i < allPotholeIds.length; i++) {
          const potholeId = allPotholeIds[i];
          const [
            location,
            description,
            coordinates,
            imageUrl,
            requiredFunds,
            raisedFunds,
            isFixed,
            reportedDate,
            contributorsCount
          ] = await contract.getPothole(potholeId);

          // Parse coordinates string into an array of numbers
          const parsedCoords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
          const isValidCoords = parsedCoords.length === 2 && !isNaN(parsedCoords[0]) && !isNaN(parsedCoords[1]);

          if (isFixed) {
            currentFixedPotholes++;
          } else {
            currentActivePotholes++;
          }

          allPotholes.push({
            id: potholeId.toNumber(),
            location,
            coords: isValidCoords ? parsedCoords : [-28.2341, 30.2473], // Default to a location in SA if invalid
            description,
            imageUrl: imageUrl,
            required: ethers.utils.formatEther(requiredFunds),
            progress: ethers.utils.formatEther(raisedFunds),
            isFixed,
            contributors: contributorsCount.toNumber(),
            date: new Date(reportedDate.toNumber() * 1000).toLocaleDateString(),
            type: 'pothole',
            category: 'Municipal' // Conceptual category for now
          });
          totalPotholeContributors += contributorsCount.toNumber();
        }
      } else {
        console.warn("Smart contract does not have 'getAllPotholeIds' function. Pothole data will not be fetched.");
      }
      setActivePotholes(currentActivePotholes);
      setFixedPotholes(currentFixedPotholes);
      setPotholes(allPotholes);

      // --- Fetch Traffic Light Data (New) ---
      let currentActiveTrafficLights = 0;
      let currentFixedTrafficLights = 0;
      let allTrafficLights = [];
      let totalTrafficLightContributors = 0;

      // Check if getAllTrafficLightIds function exists in ABI before calling
      const trafficLightIdsAbiEntry = CONTRACT_ABI.find(item => item.name === 'getAllTrafficLightIds' && item.type === 'function' && item.stateMutability === 'view');
      if (trafficLightIdsAbiEntry) {
          const allTrafficLightIds = await contract.getAllTrafficLightIds();
          for (let i = 0; i < allTrafficLightIds.length; i++) {
              const trafficLightId = allTrafficLightIds[i];
              // Destructure named outputs from getTrafficLight
              const [
                  location,
                  description,
                  coordinates,
                  imageUrl,
                  requiredFunds,
                  raisedFunds,
                  isFixed,
                  reportedDate,
                  contributorsCount // Assuming contributorsCount is also returned for traffic lights
              ] = await contract.getTrafficLight(trafficLightId);

              // Parse coordinates string into an array of numbers
              const parsedCoords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
              const isValidCoords = parsedCoords.length === 2 && !isNaN(parsedCoords[0]) && !isNaN(parsedCoords[1]);

              if (isFixed) {
                  currentFixedTrafficLights++;
              } else {
                  currentActiveTrafficLights++;
              }

              allTrafficLights.push({
                  id: trafficLightId.toNumber(),
                  location,
                  coords: isValidCoords ? parsedCoords : [-28.2341, 30.2473], // Default to a location in SA if invalid
                  description,
                  imageUrl: imageUrl,
                  required: ethers.utils.formatEther(requiredFunds),
                  progress: ethers.utils.formatEther(raisedFunds),
                  isFixed,
                  contributors: contributorsCount.toNumber(),
                  date: new Date(reportedDate.toNumber() * 1000).toLocaleDateString(),
                  type: 'trafficLight',
                  category: 'National' // Conceptual category for now
              });
              totalTrafficLightContributors += contributorsCount.toNumber();
          }
      } else {
          console.warn("Smart contract does not have 'getAllTrafficLightIds' function. Traffic light data will not be fetched.");
      }

      setActiveTrafficLights(currentActiveTrafficLights);
      setFixedTrafficLights(currentFixedTrafficLights);
      setTrafficLights(allTrafficLights);

      // --- Update Combined Metrics ---
      // Ensure totalContributions exists in ABI before calling
      const totalContributionsAbiEntry = CONTRACT_ABI.find(item => item.name === 'totalContributions' && item.type === 'function' && item.stateMutability === 'view');
      if (totalContributionsAbiEntry) {
          const rawTotalContributions = await contract.totalContributions();
          setTotalRaised(ethers.utils.formatEther(rawTotalContributions)); // Store as ETH string
      } else {
          console.warn("Smart contract does not have 'totalContributions' function. Total raised will not be fetched.");
          setTotalRaised('0.00'); // Default to 0 if not available
      }

      setContributors(totalPotholeContributors + totalTrafficLightContributors); // Combined contributors

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
      setTotalRaised('1150.00');
      setActivePotholes(0);
      setFixedPotholes(0);
      setActiveTrafficLights(0);
      setFixedTrafficLights(0);
      setContributors(0);
      setPotholes([]);
      setTrafficLights([]);
    }
  }, []);


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
        }
      }
    };
    getInitialNetwork();
  }, []);

  // Function to handle changes in individual contribution input fields
  const handleContributionAmountChange = (id, value) => {
    setContributionAmounts(prevAmounts => ({
      ...prevAmounts,
      [id]: value
    }));
  };

  // Function for contributing to an issue (Pothole or Traffic Light)
  const contributeToIssue = async (id, type) => {
    const amount = contributionAmounts[id]; // Get the amount from state for this specific ID

    if (!walletConnected || !account) {
      showMessageBox("Wallet Required", "Please connect your MetaMask wallet to contribute.", 'info');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
        showMessageBox("Invalid Amount", "Please enter a valid ETH amount to contribute.", 'warning');
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
      const valueToSend = ethers.utils.parseEther(amount.toString());

      if (type === 'pothole') {
        showMessageBox("Contributing...", `Please confirm the transaction in MetaMask to contribute ${amount} ETH to Pothole #${id}.`, 'info');
        const tx = await contract.contributeToPothole(id, { value: valueToSend });
        await tx.wait();
        showMessageBox("Success", `Contributed ${amount} ETH to Pothole #${id}!`, 'success');
      } else if (type === 'trafficLight') {
          // Check if contributeToTrafficLight function exists in ABI before calling
          const contributeTrafficLightAbiEntry = CONTRACT_ABI.find(item => item.name === 'contributeToTrafficLight' && item.type === 'function' && item.stateMutability === 'payable');
          if (contributeTrafficLightAbiEntry) {
              showMessageBox("Contributing...", `Please confirm the transaction in MetaMask to contribute ${amount} ETH to Traffic Light #${id}.`, 'info');
              const tx = await contract.contributeToTrafficLight(id, { value: valueToSend });
              await tx.wait();
              showMessageBox("Success", `Contributed ${amount} ETH to Traffic Light #${id}!`, 'success');
          } else {
              showMessageBox(
                  "Contribution (Conceptual)",
                  `You conceptually contributed ${amount} ETH to Traffic Light #${id}. Your smart contract does not yet have the 'contributeToTrafficLight' function. Please deploy the updated contract.`,
                  'info'
              );
          }
      }
      // Clear the input field for this specific issue after successful contribution
      setContributionAmounts(prevAmounts => {
        const newAmounts = { ...prevAmounts };
        delete newAmounts[id]; // Or set to empty string: newAmounts[id] = '';
        return newAmounts;
      });
      fetchBlockchainData();
    } catch (error) {
      console.error("Error contributing:", error);
      showMessageBox("Transaction Failed", `Failed to contribute: ${error.message}. Check console for details.`, 'error');
    }
  };

  // Function to mark an issue as fixed (Pothole or Traffic Light)
  const markIssueFixed = async (id, type) => {
    if (!walletConnected || !account) {
      showMessageBox("Wallet Required", "Please connect your MetaMask wallet to mark an issue as fixed.", 'info');
      return;
    }
    if (!CONTRACT_ADDRESS || CONTRACT_ABI.length === 0) {
      showMessageBox("Contract Not Configured", "Smart contract address or ABI is missing. Cannot mark issue fixed.", 'error');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      if (type === 'pothole') {
        showMessageBox("Marking Fixed...", `Please confirm the transaction in MetaMask to mark Pothole #${id} as fixed.`, 'info');
        const tx = await contract.markPotholeFixed(id);
        await tx.wait();
        showMessageBox("Success", `Pothole #${id} marked as fixed!`, 'success');
      } else if (type === 'trafficLight') {
          // Check if markTrafficLightFixed function exists in ABI before calling
          const markTrafficLightFixedAbiEntry = CONTRACT_ABI.find(item => item.name === 'markTrafficLightFixed' && item.type === 'function' && item.stateMutability === 'nonpayable');
          if (markTrafficLightFixedAbiEntry) {
              showMessageBox("Marking Fixed...", `Please confirm the transaction in MetaMask to mark Traffic Light #${id} as fixed.`, 'info');
              const tx = await contract.markTrafficLightFixed(id);
              await tx.wait();
              showMessageBox("Success", `Traffic Light #${id} marked as fixed!`, 'success');
          } else {
              showMessageBox(
                  "Mark Fixed (Conceptual)",
                  `Traffic Light #${id} has been conceptually marked as fixed. Your smart contract does not yet have the 'markTrafficLightFixed' function. Please deploy the updated contract.`,
                  'info'
              );
          }
      }
      fetchBlockchainData();
    } catch (error) {
      console.error("Error marking issue fixed:", error);
      showMessageBox("Transaction Failed", `Failed to mark issue fixed: ${error.message}. Check console for details.`, 'error');
    }
  };

  // Conceptual function for admin to "delete" (archive) an issue
  const handleDeleteIssue = (id, type) => {
    showMessageBox(
      "Admin Action (Conceptual)",
      `In a real DApp, this would trigger a a smart contract function (e.g., 'deactivate${type === 'pothole' ? 'Pothole' : 'TrafficLight'}(${id})') to mark this ${type} as inactive, as data cannot be truly deleted from the blockchain.`,
      'info'
    );
    // You would typically call a contract function here:
    // try {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const signer = provider.getSigner();
    //   const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    //   const tx = await contract.deactivatePothole(potholeId); // Requires this function in your contract
    //   await tx.wait();
    //   showMessageBox("Success", `Pothole #${potholeId} marked as inactive!`, 'success');
    //   fetchBlockchainData();
    // } catch (error) {
    //   console.error("Error deactivating pothole:", error);
    //   showMessageBox("Action Failed", `Failed to deactivate pothole: ${error.message}`, 'error');
    // }
  };

  // Combine all incidents for map display and filtering
  const allIncidents = [...potholes, ...trafficLights];

  // Filtered incidents based on `mapFilter` state
  const filteredIncidents = allIncidents.filter(incident => {
    if (mapFilter === 'All Reports') {
      return true;
    } else if (mapFilter === 'Potholes') {
      return incident.type === 'pothole';
    } else if (mapFilter === 'Traffic Lights') {
      return incident.type === 'trafficLight';
    } else if (mapFilter === 'National Roads' || mapFilter === 'Provincial Roads' || mapFilter === 'Municipal Roads') {
      // This filtering is conceptual. For true filtering, the smart contract
      // would need to store a 'category' for each incident.
      // For now, we'll filter based on the conceptual category added in fetchBlockchainData
      return incident.category === mapFilter.replace(' Roads', '');
    }
    return true;
  });


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
            <LuScrollText className="text-lg" /> {/* Changed icon for Business */}
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
          {isAdmin && ( // Admin tab visible only if isAdmin is true
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'admin' ? 'text-purple-700 border-purple-700' : 'text-gray-600 hover:text-purple-700 hover:border-purple-700 border-transparent'
              }`}
            >
              <LuShieldCheck className="text-lg" />
              <span>Admin Dashboard</span>
            </button>
          )}
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
                    onClick={() => setShowReportModal(true)} // Just set state, modal handles its own reset
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
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {loadingRate ? 'Loading...' : `ZAR ${convertEthToZar(totalRaised)}`}
                  </p>
                  <p className="text-sm text-gray-500">{totalRaised} ETH</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Active Potholes</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{activePotholes}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Fixed Potholes</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{fixedPotholes}</p>
                </div>
                {/* New Metric Cards for Traffic Lights */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Active Traffic Lights</h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{activeTrafficLights}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Fixed Traffic Lights</h3>
                  <p className="text-3xl font-bold text-teal-600 mt-2">{fixedTrafficLights}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-500">Total Contributors</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{contributors}</p>
                </div>
              </div>
            </section>

            {/* Recent Pothole Reports Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Pothole Reports</h2>
              {potholes.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No potholes reported yet. Be the first!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {potholes.map(pothole => (
                    <div key={`pothole-${pothole.id}`} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                      {/* Pothole Image */}
                      {(pothole.imageUrl && pothole.imageUrl.startsWith('data:image')) ? (
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
                      ) : (pothole.imageUrl && pothole.imageUrl.startsWith('http')) ? (
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
                      ) : (
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
                      <div className="flex flex-col space-y-2 mt-auto"> {/* Changed to flex-col for input + button */}
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={contributionAmounts[pothole.id] || ''} // Use state for this specific pothole's input
                            onChange={(e) => handleContributionAmountChange(pothole.id, e.target.value)}
                            placeholder="ETH amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={pothole.isFixed}
                        />
                        <button
                          onClick={() => contributeToIssue(pothole.id, 'pothole')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={pothole.isFixed || !contributionAmounts[pothole.id] || parseFloat(contributionAmounts[pothole.id]) <= 0}
                        >
                          Contribute
                        </button>
                        {!pothole.isFixed && (
                          <button
                            onClick={() => markIssueFixed(pothole.id, 'pothole')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                          >
                            Mark Fixed
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteIssue(pothole.id, 'pothole')}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Traffic Light Reports Section (New) */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Traffic Light Reports</h2>
              {trafficLights.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No traffic light issues reported yet. Be the first!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trafficLights.map(trafficLight => (
                    <div key={`trafficLight-${trafficLight.id}`} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                      {/* Traffic Light Image */}
                      {(trafficLight.imageUrl && trafficLight.imageUrl.startsWith('data:image')) ? (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={trafficLight.imageUrl}
                            alt={`Traffic Light ${trafficLight.id}`}
                            className="w-full h-48 object-cover object-center"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://placehold.co/600x400/e0e0e0/555555?text=Image+Error`;
                            }}
                          />
                        </div>
                      ) : (trafficLight.imageUrl && trafficLight.imageUrl.startsWith('http')) ? (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={trafficLight.imageUrl}
                            alt={`Traffic Light ${trafficLight.id}`}
                            className="w-full h-48 object-cover object-center"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://placehold.co/600x400/e0e0e0/555555?text=Image+Error`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mb-4 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center h-48">
                          <span className="text-gray-500">No Image Provided</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold">Traffic Light #{trafficLight.id}</h3>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${trafficLight.isFixed ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {trafficLight.isFixed ? 'Fixed' : 'Active'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{trafficLight.location}</p>
                      <p className="text-gray-500 text-sm mb-4">{trafficLight.coords}</p>
                      <p className="text-gray-700 mb-4">{trafficLight.description}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{trafficLight.progress} ETH / {trafficLight.required} ETH</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${(parseFloat(trafficLight.progress) / parseFloat(trafficLight.required)) * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>Reported: {trafficLight.date}</span>
                        <span><LuUsers className="inline-block mr-1" /> {trafficLight.contributors} Contributors</span>
                      </div>
                      <div className="flex flex-col space-y-2 mt-auto"> {/* Changed to flex-col for input + button */}
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={contributionAmounts[trafficLight.id] || ''} // Use state for this specific trafficLight's input
                            onChange={(e) => handleContributionAmountChange(trafficLight.id, e.target.value)}
                            placeholder="ETH amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
                            disabled={trafficLight.isFixed}
                        />
                        <button
                          onClick={() => contributeToIssue(trafficLight.id, 'trafficLight')}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={trafficLight.isFixed || !contributionAmounts[trafficLight.id] || parseFloat(contributionAmounts[trafficLight.id]) <= 0}
                        >
                          Contribute
                        </button>
                        {!trafficLight.isFixed && (
                          <button
                            onClick={() => markIssueFixed(trafficLight.id, 'trafficLight')}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300"
                          >
                            Mark Fixed
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteIssue(trafficLight.id, 'trafficLight')}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
                          >
                            Delete
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Interactive Analytics Map</h2>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['All Reports', 'Potholes', 'Traffic Lights', 'National Roads', 'Provincial Roads', 'Municipal Roads'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setMapFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    mapFilter === filter
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter} ({filteredIncidents.filter(i => filter === 'All Reports' || (filter === 'Potholes' && i.type === 'pothole') || (filter === 'Traffic Lights' && i.type === 'trafficLight') || (filter.replace(' Roads', '') === i.category)).length}) {/* Count for each filter */}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Container */}
              <div className="lg:col-span-2 h-[500px] bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                  center={userLocation || [-28.2341, 30.2473]} // Default to Greytown, SA if no user location
                  zoom={userLocation ? 13 : 8}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {userLocation && (
                    <Marker position={userLocation}>
                      <Popup>Your current location</Popup>
                    </Marker>
                  )}
                  <LocationMarker setUserLocation={setUserLocation} />

                  {filteredIncidents.map((incident) => (
                    incident.coords && incident.coords.length === 2 && (
                      <Marker
                        key={`${incident.type}-${incident.id}`}
                        position={incident.coords}
                        icon={incident.type === 'pothole' ? potholeIcon : trafficLightIcon}
                        eventHandlers={{
                          click: () => setSelectedIncident(incident),
                        }}
                      >
                        <Popup>
                          <strong>{incident.type === 'pothole' ? 'Pothole' : 'Traffic Light'} #{incident.id}</strong><br />
                          Location: {incident.location}<br />
                          Status: {incident.isFixed ? 'Fixed' : 'Active'}
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>

              {/* Incident Details Panel */}
              <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Incident Details</h3>
                {selectedIncident ? (
                  <div className="space-y-3">
                    <p className="text-lg font-bold text-blue-700">{selectedIncident.type === 'pothole' ? 'Pothole' : 'Traffic Light'} #{selectedIncident.id}</p>
                    <p><strong>Status:</strong> <span className={`font-semibold ${selectedIncident.isFixed ? 'text-green-600' : 'text-yellow-600'}`}>{selectedIncident.isFixed ? 'Fixed' : 'Under Review'}</span></p>
                    <p><strong>Category:</strong> {selectedIncident.category || 'N/A'}</p> {/* Display conceptual category */}
                    <p><strong>Location:</strong> {selectedIncident.location}</p>
                    <p><strong>Coordinates:</strong> {selectedIncident.coords?.join(', ')}</p>
                    <p><strong>Description:</strong> {selectedIncident.description}</p>
                    <p><strong>Contributions:</strong> {selectedIncident.progress} ETH / {selectedIncident.required} ETH</p>
                    <p><strong>Contributors:</strong> {selectedIncident.contributors}</p>
                    {selectedIncident.imageUrl && (
                        <div className="mt-4">
                            <img
                                src={selectedIncident.imageUrl}
                                alt="Incident Image"
                                className="w-full h-40 object-cover rounded-lg"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://placehold.co/400x200/e0e0e0/555555?text=Image+Error`;
                                }}
                            />
                        </div>
                    )}
                    <button
                      onClick={() => {
                        // Logic to navigate to the detailed view of this incident on the dashboard tab
                        setActiveTab('dashboard');
                        // You might want to scroll to or highlight the specific incident on the dashboard
                      }}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      View Full Details
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">Click on a marker on the map to see incident details.</p>
                )}
              </div>
            </div>

            {/* Recent Reports Section - Kept as per screenshot */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Recent Reports</h2>
            {allIncidents.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No reports yet. Report an issue to see it here!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allIncidents.slice(0, 6).map(incident => ( // Display up to 6 recent reports
                        <div key={`${incident.type}-${incident.id}-recent`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-lg mb-1">{incident.type === 'pothole' ? 'Pothole' : 'Traffic Light'} #{incident.id}</h3>
                            <p className="text-gray-600 text-sm">{incident.location}</p>
                            <p className="text-gray-500 text-xs mt-1">Reported: {incident.date}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${incident.isFixed ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {incident.isFixed ? 'Fixed' : 'Active'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Executive Summary</h2>
            <p className="text-gray-600 mb-6">
              InfraDAO revolutionizes urban infrastructure maintenance through blockchain-powered community funding. Our platform enables citizens to fund pothole repairs AND traffic light maintenance, creating comprehensive infrastructure solutions with sustainable token economics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
                <p className="text-3xl font-bold mb-2">$89B</p>
                <p className="text-sm">Total Addressable Market</p>
              </div>
              <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
                <p className="text-3xl font-bold mb-2">58%</p>
                <p className="text-sm">Projected IRR</p>
              </div>
              <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
                <p className="text-3xl font-bold mb-2">$1.5B</p>
                <p className="text-sm">Unicorn Valuation Target</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dual Infrastructure Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center"><LuTrafficCone className="mr-2 text-2xl" />Pothole Repairs</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Average repair cost: R8,500</li>
                  <li>150,000+ potholes by Year 5</li>
                  <li>National, Provincial, Municipal roads</li>
                  <li>Community-driven reporting</li>
                </ul>
              </div>
              {/* Traffic Light Maintenance - Changed to blue */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center"><LuLightbulb className="mr-2 text-2xl" />Traffic Light Maintenance</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Average repair cost: R15,000</li>
                  <li>30,000+ traffic lights by Year 5</li>
                  <li>Critical safety infrastructure</li>
                  <li>Highest funding priority</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">5-Year Financial Projections</h2>
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Year</th>
                    <th className="py-3 px-6 text-left">Revenue</th>
                    <th className="py-3 px-6 text-left">Users</th>
                    <th className="py-3 px-6 text-left">Potholes</th>
                    <th className="py-3 px-6 text-left">Traffic Lights</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  <tr className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">Year 1</td>
                    <td className="py-3 px-6 text-left">$3.2M</td>
                    <td className="py-3 px-6 text-left">65K</td>
                    <td className="py-3 px-6 text-left">5K</td>
                    <td className="py-3 px-6 text-left">3K</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">Year 2</td>
                    <td className="py-3 px-6 text-left">$11.8M</td>
                    <td className="py-3 px-6 text-left">240K</td>
                    <td className="py-3 px-6 text-left">18K</td>
                    <td className="py-3 px-6 text-left">10K</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">Year 3</td>
                    <td className="py-3 px-6 text-left">$32.0M</td>
                    <td className="py-3 px-6 text-left">580K</td>
                    <td className="py-3 px-6 text-left">42K</td>
                    <td className="py-3 px-6 text-left">23K</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">Year 4</td>
                    <td className="py-3 px-6 text-left">$78.0M</td>
                    <td className="py-3 px-6 text-left">1200K</td>
                    <td className="py-3 px-6 text-left">85K</td>
                    <td className="py-3 px-6 text-left">50K</td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">Year 5</td>
                    <td className="py-3 px-6 text-left">$165.0M</td>
                    <td className="py-3 px-6 text-left">2100K</td>
                    <td className="py-3 px-6 text-left">150K</td>
                    <td className="py-3 px-6 text-left">90K</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Path to Unicorn Status ($1.5B+ Valuation)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              {/* Adjusted shades of blue */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xl font-bold text-blue-800 mb-2">Seed</p>
                <p className="text-lg text-blue-700 mb-1">$15M</p>
                <p className="text-xs text-blue-600">Dual Infrastructure MVP</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xl font-bold text-blue-800 mb-2">Series A</p>
                <p className="text-lg text-blue-700 mb-1">$75M</p>
                <p className="text-xs text-blue-600">15 Cities, 150K Users</p>
              </div>
              <div className="bg-blue-200 p-4 rounded-lg border border-blue-300">
                <p className="text-xl font-bold text-blue-800 mb-2">Series B</p>
                <p className="text-lg text-blue-700 mb-1">$300M</p>
                <p className="text-xs text-blue-600">75 Cities, 750K Users</p>
              </div>
              <div className="bg-blue-300 p-4 rounded-lg border border-blue-400">
                <p className="text-xl font-bold text-blue-800 mb-2">Series C</p>
                <p className="text-lg text-blue-700 mb-1">$800M</p>
                <p className="text-xs text-blue-600">International Expansion</p>
              </div>
              <div className="bg-blue-400 text-white p-4 rounded-lg col-span-full"> {/* Adjusted Unicorn shade */}
                <p className="text-xl font-bold mb-2">Unicorn</p>
                <p className="text-lg mb-1">$1.5B</p>
                <p className="text-xs">Global Infrastructure Leader</p>
              </div>
            </div>
            <p className="text-center text-gray-600 text-sm mt-4">
              Current Stage: Seed Funding - Building dual infrastructure MVP and securing pilot partnerships.
            </p>
          </section>
        )}

        {activeTab === 'tokenomics' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">SPATCH Token Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token Utility */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-yellow-800 mb-2">Token Utility</h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  <li>Governance voting rights</li>
                  <li>Staking rewards (8% APY)</li>
                  <li>Community incentives</li>
                  <li>Platform fee discounts</li>
                </ul>
              </div>
              {/* Token Metrics */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-blue-800 mb-2">Token Metrics</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Total Supply: 1,000,000,000 PATCH</li>
                  <li>Initial Price: $0.01 / PATCH</li>
                  <li>Network: Polygon</li>
                  <li>Token Standard: ERC-20</li>
                </ul>
              </div>
            </div>

            {/* Token Distribution */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Token Distribution</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="w-1/3 font-medium text-gray-700">Community Rewards:</span>
                <div className="w-2/3 bg-blue-100 h-6 rounded-full flex items-center">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }}></div>
                  <span className="ml-2 text-blue-700 text-sm font-semibold">30% (300M PATCH)</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-1/3 font-medium text-gray-700">Team & Advisors:</span>
                <div className="w-2/3 bg-blue-100 h-6 rounded-full flex items-center">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '20%' }}></div>
                  <span className="ml-2 text-blue-700 text-sm font-semibold">20% (200M PATCH)</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-1/3 font-medium text-gray-700">Public Sale:</span>
                <div className="w-2/3 bg-blue-100 h-6 rounded-full flex items-center">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '15%' }}></div>
                  <span className="ml-2 text-blue-700 text-sm font-semibold">15% (150M PATCH)</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-1/3 font-medium text-gray-700">Private Sale:</span>
                <div className="w-2/3 bg-blue-100 h-6 rounded-full flex items-center">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '15%' }}></div>
                  <span className="ml-2 text-blue-700 text-sm font-semibold">15% (150M PATCH)</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-1/3 font-medium text-gray-700">Treasury:</span>
                <div className="w-2/3 bg-blue-100 h-6 rounded-full flex items-center">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '10%' }}></div>
                  <span className="ml-2 text-blue-700 text-sm font-semibold">10% (100M PATCH)</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-1/3 font-medium text-gray-700">Ecosystem Fund:</span>
                <div className="w-2/3 bg-blue-100 h-6 rounded-full flex items-center">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '10%' }}></div>
                  <span className="ml-2 text-blue-700 text-sm font-semibold">10% (100M PATCH)</span>
                </div>
              </div>
            </div>

            {/* Token Launch Roadmap */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Token Launch Roadmap</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800">Q3 2025: Seed Funding</h3>
                <p className="text-gray-700 text-sm">Complete seed round, finalize tokenomics</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800">Q4 2025: MVP Launch</h3>
                <p className="text-gray-700 text-sm">Deploy smart contracts, launch pilot cities</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800">Q1 2026: Series A</h3>
                <p className="text-gray-700 text-sm">Institutional funding, expand to 10 cities</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800">Q2 2026: Token Launch</h3>
                <p className="text-gray-700 text-sm">Public sale, staking mechanism live</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800">Q3 2026: Governance</h3>
                <p className="text-gray-700 text-sm">Full DAO governance, community voting</p>
              </div>
            </div>
          </section>
        )}

        {isAdmin && activeTab === 'admin' && (
          <AdminDashboard
            showMessageBox={showMessageBox}
            handleDeleteIssue={handleDeleteIssue}
          />
        )}

      </div>

      {/* Report Issue Modal */}
      <ReportIssueModal
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        walletConnected={walletConnected}
        account={account}
        CONTRACT_ADDRESS={CONTRACT_ADDRESS}
        CONTRACT_ABI={CONTRACT_ABI}
        showMessageBox={showMessageBox}
        fetchBlockchainData={fetchBlockchainData}
      />

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























