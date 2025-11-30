import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, DollarSign, Clock, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import ClaimModal from '../components/ClaimModal';
import { claimService } from '../services/claimService';
import { policyService } from '../services/policyService';
import LoadingSpinner from '../components/LoadingSpinner';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // include policies in deps because search now depends on policy names
  useEffect(() => {
    filterClaims();
  }, [claims, policies, searchTerm, filterStatus]);

  const fetchData = async () => {
    try {
      const [claimsData, policiesData] = await Promise.all([
        claimService.getAllClaims(),
        policyService.getAllPolicies(),
      ]);
      setClaims(claimsData || []);
      setPolicies(policiesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    const q = searchTerm.trim().toLowerCase();
    let filtered = claims.filter(c => c.status !== 'Withdrawn');

    if (filterStatus !== 'All') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (q) {
      filtered = filtered.filter(c => {
        // policy name from policies array
        const policy = policies.find(p => p.policyId === c.policyId);
        const policyName = policy ? `${policy.insurer} - ${policy.policyType}` : '';

        const matchesPolicy = policyName.toLowerCase().includes(q);
        const matchesDescription = (c.description || '').toLowerCase().includes(q);
        const matchesStatus = (c.status || '').toLowerCase().includes(q);

        return matchesPolicy || matchesDescription || matchesStatus;
      });
    }

    setFilteredClaims(filtered);
  };

  const handleAddClaim = () => {
    setSelectedClaim(null);
    setShowModal(true);
  };

  const handleEditClaim = (claim) => {
    if (claim.status === 'Approved' || claim.status === 'Rejected') {
      alert('Cannot edit processed claims');
      return;
    }
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const handleDeleteClaim = async (claimId, status) => {
    if (status === 'Approved' || status === 'Rejected') {
      alert('Cannot delete processed claims');
      return;
    }

    if (window.confirm('Are you sure you want to delete this claim?')) {
      try {
        await claimService.deleteClaim(claimId);
        fetchData();
      } catch (error) {
        console.error('Error deleting claim:', error);
        alert('Failed to delete claim');
      }
    }
  };

const handleWithdrawClaim = async (claim) => {
  const confirmWithdraw = window.confirm("Are you sure you want to withdraw this claim?");
  if (!confirmWithdraw) return;

  try {
    const updatedClaim = {
      ...claim,
      status: 'Withdrawn', // ✅ Soft delete
    };

    await claimService.updateClaim(claim.claimId, updatedClaim);
    fetchClaims(); // Refresh list
  } catch (error) {
    console.error('Error withdrawing claim:', error);
    alert('Failed to withdraw claim');
  }
};



  const handleModalClose = () => {
    setShowModal(false);
    setSelectedClaim(null);
    fetchData();
  };

  const getPolicyName = (policyId) => {
    const policy = policies.find(p => p.policyId === policyId);
    return policy ? `${policy.insurer} - ${policy.policyType}` : 'Unknown Policy';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading claims..." />;
  }
  

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                My Claims
              </h1>
              <p className="text-slate-600 mt-2">Submit and track your insurance claims</p>
            </div>
            
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 bg-slate-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <FileText className="h-5 w-5" />
            <span>Claims History</span>
          </button>


            <button
              onClick={handleAddClaim}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-400/25"
            >
              <Plus className="h-5 w-5" />
              <span>File Claim</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search claims (by policy or description)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-slate-800"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-slate-800"
            >
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-300 p-12 text-center shadow-sm">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No claims found</h3>
            <p className="text-slate-600 mb-6">File your first claim to get started</p>
            

            <button
              onClick={handleAddClaim}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-400/25"
            >
              <Plus className="h-5 w-5" />
              <span>File Claim</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClaims.map((claim) => (
              <div
                key={claim.claimId}
                className="bg-white rounded-xl border border-slate-300 overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-lg duration-300"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-cyan-100 mb-1">Claim #{claim.claimId}</p>
                      <h3 className="text-lg font-bold text-white truncate">{getPolicyName(claim.policyId)}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-4 text-slate-800">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold">Amount:</span>
                      <span>₹{claim.claimAmt?.toFixed(2)}</span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <FileText className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold">Description:</span>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-3">{claim.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                      <span className="font-semibold">Submitted:</span>
                      <span className="text-sm">{new Date(claim.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-slate-200">

                    <button
                      onClick={() => handleEditClaim(claim)}
                      disabled={claim.status === 'Withdrawn'}
                      className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>      
                      <button
                        onClick={() => handleWithdrawClaim(claim)}
                        disabled={claim.status === 'Approved' || claim.status === 'Rejected' || claim.status === 'Withdrawn'}
                        className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Withdraw</span>
                      </button>

                      </div>
                  </div>
                </div>
              
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <ClaimModal
          claim={selectedClaim}
          policies={policies}
          onClose={handleModalClose}
        />
      )}
      
{showHistory && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Claims History</h2>
        <button
          onClick={() => setShowHistory(false)}
          className="text-slate-600 hover:text-slate-800"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {claims.map((claim) => (
          <div
            key={claim.claimId}
            className={`bg-white rounded-lg border border-slate-300 p-4 shadow-sm ${
              claim.status === 'Withdrawn' ? 'opacity-50' : ''
            }`}
          >
            <p className="text-sm text-slate-500">Claim #{claim.claimId}</p>
            <h3 className="font-semibold">{getPolicyName(claim.policyId)}</h3>
            <p>Status: <span className="font-bold">{claim.status}</span></p>
            <p>Amount: ₹{claim.claimAmt?.toFixed(2)}</p>
            <p>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    </div>
  );
};
export default Claims;
