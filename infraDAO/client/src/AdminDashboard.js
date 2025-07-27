import React from 'react';
import { LuShieldCheck } from 'react-icons/lu';

// AdminDashboard component receives necessary props from App.js
const AdminDashboard = ({ showMessageBox, handleDeleteIssue }) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
      <p className="text-gray-600 mb-4">
        Welcome, Administrator! From here, you can manage various aspects of the InfraDAO platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic & Analytics Management */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Traffic & Analytics Management</h3>
          <p className="text-gray-700 text-sm mb-4">
            Monitor website traffic, user engagement, and key performance indicators using integrated
            off-chain analytics tools (e.g., Google Analytics, Mixpanel). This section would also allow
            for managing API keys and configurations for these services, and viewing detailed reports
            on platform usage and DApp performance.
          </p>
          <button className="mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
            View Analytics Dashboard (External)
          </button>
        </div>

        {/* User Management */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">User Management</h3>
          <p className="text-gray-700 text-sm mb-4">
            Manage user accounts, roles, and permissions within the InfraDAO ecosystem.
            This includes viewing user profiles, assigning administrative privileges,
            and handling potential issues like spam or malicious activity.
            **This feature requires robust backend integration for user data storage and authentication.**
            Your backend would expose API endpoints for fetching, updating, and deleting user records.
          </p>
          <button
            onClick={() => showMessageBox("User Management (Conceptual)", "This feature would involve backend API calls to retrieve and manage user data. For on-chain roles, it would also interact with smart contract functions (e.g., setting admin roles).", "info")}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            Manage Users (Conceptual)
          </button>
        </div>

        {/* Issue Management */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Issue Management (Potholes & Traffic Lights)</h3>
          <p className="text-gray-700 text-sm mb-4">
            Oversee and moderate reported infrastructure issues. As an administrator,
            you can mark issues as fixed, or conceptually "archive" reports that are no longer relevant.
            Remember, while blockchain data is immutable, you can update an issue's status or visibility.
            Actions like marking fixed directly interact with the smart contract, while other moderation
            actions might involve your backend database.
          </p>
          <button
            onClick={() => showMessageBox("Issue Management (Conceptual)", "This button would lead to a detailed interface for reviewing, updating, and archiving reported potholes and traffic light issues. Actions like 'Mark Fixed' directly interact with the smart contract.", "info")}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            Review All Issues
          </button>
        </div>

        {/* Contract Management (Conceptual) */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Contract Management</h3>
          <p className="text-gray-700 text-sm mb-4">
            For advanced administrators (contract owner), this section would provide
            controls for pausing/unpausing the contract, upgrading its implementation
            (if using an upgradeable proxy pattern), or transferring ownership.
            These are critical operations that directly affect the smart contract's behavior.
            These actions are performed directly on the blockchain via your connected wallet.
          </p>
          <button
            onClick={() => showMessageBox("Contract Management (Conceptual)", "Functions like `pauseContract()`, `unpauseContract()`, `upgradeContract()`, and `transferOwnership()` would be accessible here for the contract owner. These are highly sensitive operations.", "info")}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            Manage Contract (Owner Only)
          </button>
        </div>
      </div>

      <p className="mt-6 text-gray-500">
        **Note:** The functionalities described above for "User Management" and "Analytics" would primarily rely on your backend services to manage off-chain data and interact with external APIs.
      </p>
    </section>
  );
};

export default AdminDashboard;
