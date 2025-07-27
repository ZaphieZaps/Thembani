import React, { useState } from 'react';
import { ethers } from 'ethers';

// ReportIssueModal component receives props for its state and actions
const ReportIssueModal = ({
  showReportModal,
  setShowReportModal,
  walletConnected,
  account,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  showMessageBox,
  fetchBlockchainData,
}) => {
  const [selectedIssueType, setSelectedIssueType] = useState('pothole');
  const [issueLocation, setIssueLocation] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCoordinates, setIssueCoordinates] = useState('');
  const [issueFile, setIssueFile] = useState(null);
  const [issueImagePreviewUrl, setIssueImagePreviewUrl] = useState(null);
  const [issueRequiredFunds, setIssueRequiredFunds] = useState('');
  const [uploadingIssueImage, setUploadingIssueImage] = useState(false);

  // Handle file selection for the combined issue reporting form
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIssueFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIssueImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setIssueFile(null);
      setIssueImagePreviewUrl(null);
    }
  };

  // Function to reset all form fields
  const resetForm = () => {
    setIssueLocation('');
    setIssueDescription('');
    setIssueCoordinates('');
    setIssueFile(null);
    setIssueImagePreviewUrl(null);
    setIssueRequiredFunds('');
    setUploadingIssueImage(false);
    setSelectedIssueType('pothole');
  };

  // Function to handle reporting a new issue (Pothole or Traffic Light)
  const handleReportSubmit = async () => {
    if (!walletConnected || !account) {
      showMessageBox("Wallet Required", "Please connect your MetaMask wallet to report an issue.", 'info');
      return;
    }
    if (!issueLocation || !issueDescription || !issueRequiredFunds) {
      showMessageBox("Missing Information", "Please fill in all required fields for the issue (Location, Description, Required Funds).", 'warning');
      return;
    }

    setUploadingIssueImage(true);
    let imageUrlToStore = '';

    // --- START: Image Upload to Backend Logic ---
    if (issueFile) {
      const formData = new FormData();
      formData.append('image', issueFile); // 'image' must match the field name in backend/server.js's upload.single('image')

      try {
        // IMPORTANT: Replace 'http://localhost:5000' with your actual backend URL if different
        const uploadResponse = await fetch('http://localhost:5000/api/upload-image', {
          method: 'POST',
          body: formData,
          // Do NOT set 'Content-Type' header for FormData, browser sets it automatically
        });
        const uploadResult = await uploadResponse.json();

        if (uploadResponse.ok) {
          imageUrlToStore = uploadResult.imageUrl; // Get the URL from the backend response
          showMessageBox("Image Uploaded", "Image uploaded to backend successfully!", 'success');
        } else {
          throw new Error(uploadResult.message || 'Failed to upload image to backend.');
        }
      } catch (uploadError) {
        console.error("Error uploading image to backend:", uploadError);
        showMessageBox("Image Upload Failed", `Could not upload image: ${uploadError.message}. Reporting without image.`, 'error');
        imageUrlToStore = ''; // Proceed without image if upload fails
      }
    }
    // --- END: Image Upload to Backend Logic ---

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const requiredFundsWei = ethers.utils.parseEther(issueRequiredFunds.toString());

      if (selectedIssueType === 'pothole') {
        showMessageBox("Reporting Pothole...", "Please confirm the transaction in MetaMask.", 'info');
        const tx = await contract.reportPothole(
          issueLocation,
          issueDescription,
          issueCoordinates,
          imageUrlToStore, // Now using the URL from the backend
          requiredFundsWei
        );
        await tx.wait();
        showMessageBox("Success", "Pothole reported successfully!", 'success');
      } else if (selectedIssueType === 'trafficLight') {
          // Check if reportTrafficLight function exists in ABI before calling
          const reportTrafficLightAbiEntry = CONTRACT_ABI.find(item => item.name === 'reportTrafficLight' && item.type === 'function' && item.stateMutability === 'nonpayable');
          if (reportTrafficLightAbiEntry) {
              showMessageBox("Reporting Traffic Light...", "Please confirm the transaction in MetaMask.", 'info');
              const tx = await contract.reportTrafficLight(
                  issueLocation,
                  issueDescription,
                  issueCoordinates,
                  imageUrlToStore, // Now using the URL from the backend
                  requiredFundsWei
              );
              await tx.wait();
              showMessageBox("Success", "Traffic light reported successfully!", 'success');
          } else {
              showMessageBox(
                  "Traffic Light Reporting (Conceptual)",
                  `Traffic Light at "${issueLocation}" with required funds ${issueRequiredFunds} ETH has been conceptually reported. Your smart contract does not yet have the 'reportTrafficLight' function. Please deploy the updated contract.`,
                  'info'
              );
          }
      }

      setShowReportModal(false);
      resetForm();
      fetchBlockchainData(); // Refresh data after reporting
    } catch (error) {
      console.error("Error reporting issue:", error);
      showMessageBox("Transaction Failed", `Failed to report issue: ${error.message}. Check console for details.`, 'error');
    } finally {
      setUploadingIssueImage(false);
    }
  };

  if (!showReportModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Report New Issue</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select
              id="issueType"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedIssueType}
              onChange={(e) => setSelectedIssueType(e.target.value)}
            >
              <option value="pothole">Pothole</option>
              <option value="trafficLight">Traffic Light</option>
            </select>
          </div>
          <div>
            <label htmlFor="issueLocation" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              id="issueLocation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={selectedIssueType === 'pothole' ? "e.g., Main St & 1st Ave" : "e.g., Intersection of Oak & Elm"}
              value={issueLocation}
              onChange={(e) => setIssueLocation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="issueDescription"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={selectedIssueType === 'pothole' ? "e.g., Large pothole causing traffic issues near the intersection." : "e.g., Traffic light is out at this intersection, causing congestion."}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label htmlFor="issueCoordinates" className="block text-sm font-medium text-gray-700 mb-1">Coordinates (Optional)</label>
            <input
              type="text"
              id="issueCoordinates"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., -28.2341, 30.2473"
              value={issueCoordinates}
              onChange={(e) => setIssueCoordinates(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="issueImageUpload" className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
            <input
              type="file"
              id="issueImageUpload"
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleImageUpload}
            />
            {issueImagePreviewUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <img src={issueImagePreviewUrl} alt="Issue Preview" className="max-w-full h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="issueRequiredFunds" className="block text-sm font-medium text-gray-700 mb-1">Required Funds (ETH)</label>
            <input
              type="number"
              id="issueRequiredFunds"
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={selectedIssueType === 'pothole' ? "e.g., 0.5" : "e.g., 1.2"}
              value={issueRequiredFunds}
              onChange={(e) => setIssueRequiredFunds(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowReportModal(false);
              resetForm();
            }}
            className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleReportSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={uploadingIssueImage}
          >
            {uploadingIssueImage ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              'Report Issue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueModal;

