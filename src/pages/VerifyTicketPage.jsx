import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { DemoBadge } from '../components/DemoBadge';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ShieldCheck, 
  ShieldAlert,
  QrCode, 
  Search, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  Calendar, 
  MapPin, 
  Cpu, 
  CheckSquare, 
  Sparkles,
  RefreshCw,
  Zap,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

export const VerifyTicketPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    verifyTicket, 
    approveTicketEntry, 
    tickets, 
    events, 
    currentAccount, 
    isOrganizer, 
    switchAccount, 
    setIsWalletModalOpen 
  } = useBlockchain();

  // Verification method tab: 'MANUAL' | 'CAMERA'
  const [activeTab, setActiveTab] = useState('MANUAL');
  const [inputTicketId, setInputTicketId] = useState('');
  
  // Verification result state
  const [verificationResult, setVerificationResult] = useState(null);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Camera scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);

  // Auto-fill from URL param if available (e.g. from TicketDetailModal)
  useEffect(() => {
    const queryId = searchParams.get('ticketId') || searchParams.get('id');
    if (queryId) {
      setInputTicketId(queryId);
      performVerification(queryId);
    }
  }, [searchParams]);

  // Handle camera start/stop
  const startCameraScanner = async () => {
    setCameraError('');
    setIsScanning(true);

    try {
      // Ensure reader container exists
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success callback
          let parsedId = decodedText;
          try {
            // If QR is JSON encoded
            const parsed = JSON.parse(decodedText);
            if (parsed.ticketId) parsedId = parsed.ticketId;
          } catch {
            // Raw text or ID
          }

          stopCameraScanner();
          setInputTicketId(parsedId);
          performVerification(parsedId);
        },
        (errorMessage) => {
          // ignore frame errors
        }
      );
    } catch (err) {
      console.warn("Camera start failed:", err);
      setCameraError('Camera access unavailable or denied. Please use manual Ticket ID input or quick-select below.');
      setIsScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn(e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup camera on unmount or if non-organizer
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (!isOrganizer && isScanning) {
      stopCameraScanner();
    }
  }, [isOrganizer, isScanning]);

  // Perform verification logic
  const performVerification = (idToVerify) => {
    setApprovalSuccess(false);
    const result = verifyTicket(idToVerify);
    setVerificationResult(result);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!inputTicketId.trim()) return;
    performVerification(inputTicketId.trim());
  };

  // Quick Demo Fill Helper
  const handleQuickTest = (ticketId) => {
    setInputTicketId(ticketId);
    performVerification(ticketId);
  };

  // Approve Gate Entry action
  const handleApproveEntry = async () => {
    if (!verificationResult?.ticket) return;
    setIsProcessingApproval(true);

    try {
      await new Promise(r => setTimeout(r, 900)); // simulate check
      const updated = approveTicketEntry(verificationResult.ticket.id);
      setIsProcessingApproval(false);
      setApprovalSuccess(true);
      // Refresh verification state with updated USED status
      setVerificationResult({
        found: true,
        ticket: updated,
        event: verificationResult.event,
        isValid: false,
        isUsed: true
      });
    } catch (err) {
      setIsProcessingApproval(false);
      alert(err.message);
    }
  };

  if (!isOrganizer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <DemoBadge text="RESTRICTED ACCESS • ORGANIZER & GATEKEEPER ONLY" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ticket Verification Restricted
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Turnstile admission scanning and ticket verification tools are restricted to authorized event organizers and gatekeepers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono max-w-md mx-auto text-left space-y-2.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Connected Account:</span>
            <span className={currentAccount ? 'text-cyan-300 font-bold' : 'text-rose-400 font-bold'}>
              {currentAccount ? currentAccount.name : 'Disconnected'}
            </span>
          </div>
          {currentAccount ? (
            <>
              <div className="flex items-center justify-between text-slate-400">
                <span>Role:</span>
                <span className="text-amber-400 font-semibold">{currentAccount.role || 'ATTENDEE'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Address:</span>
                <span className="text-slate-300">{currentAccount.shortAddress}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Access Status:</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Access Denied
                </span>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-xs font-sans">
              Connect your wallet using the ChainPass Organizer Vault to verify tickets and admit attendees.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {currentAccount ? (
            <button
              onClick={() => switchAccount('acc-3')}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Organizer Wallet</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-glow-blue transition-all flex items-center justify-center gap-2"
            >
              <span>Connect Wallet</span>
            </button>
          )}

          <button
            onClick={() => navigate('/events')}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-colors"
          >
            Explore Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <DemoBadge text="GATE ADMISSION VERIFIER • SIMULATED SMART CONTRACT" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ticket Verification & Gate Admission
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Simulated turnstile validator. Inspects on-chain ticket status, checks ownership against the attendee, and marks tickets as USED to prevent duplicate admissions.
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        
        {/* Verification Method Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => {
              setActiveTab('MANUAL');
              stopCameraScanner();
            }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MANUAL'
                ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/50 border border-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Enter Ticket ID</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('CAMERA');
              startCameraScanner();
            }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CAMERA'
                ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/50 border border-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR Code (Camera)</span>
          </button>
        </div>

        {/* 1. MANUAL TICKET ID INPUT METHOD */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-4">
            <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Ticket ID (e.g. CP-TK-8021)"
                  value={inputTicketId}
                  onChange={(e) => setInputTicketId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-mono bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={!inputTicketId.trim()}
                className="py-3 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Ticket</span>
              </button>
            </form>

            {/* Quick Demo Fill Buttons (Perfect for faculty viva presentation!) */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Quick Presentation Test Cases:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickTest('CP-TK-8021')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 font-mono"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Valid Pass: CP-TK-8021</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickTest('CP-TK-9412')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 font-mono"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Valid Pass: CP-TK-9412</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickTest('CP-TK-5509')}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 font-mono"
                  title="Already redeemed pass - tests rejection"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Already Used: CP-TK-5509 (Denied)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickTest('CP-FAKE-9999')}
                  className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition-colors flex items-center gap-1.5 font-mono"
                  title="Counterfeit / non-existent ticket"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Counterfeit ID: CP-FAKE-9999</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. CAMERA SCANNER METHOD */}
        {activeTab === 'CAMERA' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
              
              <div 
                id="reader" 
                className="w-full max-w-sm rounded-xl overflow-hidden bg-black aspect-square flex items-center justify-center text-slate-500 text-xs"
              >
                {!isScanning && (
                  <div className="text-center p-4">
                    <CameraOff className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <span>Camera scanner is stopped. Click Start Scanner below.</span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 max-w-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                {!isScanning ? (
                  <button
                    onClick={startCameraScanner}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Scanner</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCameraScanner}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. VERIFICATION RESULT DISPLAY */}
        {verificationResult && (
          <div className="pt-6 border-t border-slate-800 space-y-6 animate-fade-in">
            
            {/* Case A: Valid Ticket */}
            {verificationResult.found && verificationResult.isValid && !approvalSuccess && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/60 via-slate-900/90 to-slate-950 border-2 border-emerald-500/60 shadow-glow-emerald space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                        ON-CHAIN VALIDATION SUCCESS
                      </span>
                      <h3 className="text-2xl font-black text-white tracking-wide">
                        TICKET VERIFIED
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                    STATUS: VALID FOR ADMISSION
                  </span>
                </div>

                {/* Ticket Details Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-mono">Ticket ID</span>
                      <p className="font-mono text-cyan-300 text-sm font-bold">{verificationResult.ticket.id}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-mono">Event Name</span>
                      <p className="font-semibold text-white">{verificationResult.ticket.eventTitle}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-mono">Tier & Standard</span>
                      <p className="text-slate-300">{verificationResult.ticket.tier} • ERC-721 NFT</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-mono">Current Owner Wallet</span>
                      <p className="font-mono text-slate-300 truncate">{verificationResult.ticket.ownerAddress}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-mono">Event Date & Venue</span>
                      <p className="text-slate-300">{verificationResult.ticket.eventDate} ({verificationResult.ticket.eventVenue})</p>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-mono">Transaction Hash</span>
                      <p className="font-mono text-purple-300 truncate text-[11px]">{verificationResult.ticket.txHash}</p>
                    </div>
                  </div>
                </div>

                {/* Gate Admission Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleApproveEntry}
                    disabled={isProcessingApproval}
                    className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/80 transition-all flex items-center justify-center gap-2 group"
                  >
                    <CheckSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{isProcessingApproval ? 'Validating Turnstile...' : 'Approve Entry (Mark Ticket USED)'}</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
                    Clicking Approve Entry updates ticket status on-chain to prevent duplicate scans.
                  </p>
                </div>
              </div>
            )}

            {/* Case B: Approved Entry State (Just approved) */}
            {approvalSuccess && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-950 border-2 border-emerald-400 text-center space-y-4 animate-scale-up">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Entry Approved!</h3>
                  <p className="text-xs text-emerald-300 font-mono mt-1">
                    Ticket {verificationResult.ticket.id} status successfully updated to USED in local blockchain state.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 max-w-md mx-auto">
                  Turnstile opened. Subsequent verification of this ticket will be strictly denied.
                </div>
              </div>
            )}

            {/* Case C: Ticket Already USED (Double-entry attempt!) */}
            {verificationResult.found && verificationResult.isUsed && !approvalSuccess && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-rose-950/80 via-slate-900/90 to-slate-950 border-2 border-rose-500/80 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center justify-center">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase">
                        GATE ADMISSION REJECTED
                      </span>
                      <h3 className="text-2xl font-black text-rose-400 tracking-wide">
                        ENTRY DENIED — TICKET ALREADY USED
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    STATUS: EXPIRED / REDEEMED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-900/40 text-xs space-y-2 text-slate-300">
                  <p className="text-rose-200 font-medium">
                    This ticket was already redeemed at venue entry. Duplicate entry is denied by smart contract double-spend prevention logic.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Ticket ID:</span>
                      <span className="text-cyan-300 font-bold">{verificationResult.ticket.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Redeemed At:</span>
                      <span className="text-rose-300">{verificationResult.ticket.usedAt || 'Previous Gate Scan'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Event:</span>
                      <span className="text-slate-200">{verificationResult.ticket.eventTitle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Owner Address:</span>
                      <span className="text-slate-400 truncate block">{verificationResult.ticket.ownerAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Case D: Ticket Not Found (Counterfeit or Bad ID) */}
            {!verificationResult.found && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/60 via-slate-900/90 to-slate-950 border-2 border-amber-500/60 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                      VERIFICATION FAILED
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Counterfeit or Invalid Ticket ID
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {verificationResult.reason || 'Ticket ID not found in blockchain ledger. Invalid or counterfeit ticket.'}
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                  No corresponding ERC-721 token exists for identifier "{inputTicketId}". Please check the ticket number.
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
