import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ShieldCheck, QrCode } from 'lucide-react';

export const TicketQRCode = ({ ticket, size = 160, showDetails = true }) => {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  // The QR value encodes the ticket verification payload
  const qrData = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    owner: ticket.ownerAddress,
    status: ticket.status,
    verificationUrl: `https://tixora.demo/verify?id=${ticket.id}`
  });

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUsed = ticket.status === 'USED';

  return (
    <div className="flex flex-col items-center">
      <div className={`relative p-3 rounded-2xl bg-white shadow-xl transition-all ${
        isUsed ? 'opacity-70 filter grayscale' : 'hover:scale-[1.02]'
      }`}>
        <QRCodeSVG
          value={ticket.id} // Encode ticket ID primarily for quick regex detection in scanners
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#050814"
        />

        {isUsed && (
          <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-rose-300 font-bold p-2 text-center border-2 border-rose-500">
            <span className="text-xs uppercase tracking-widest text-rose-400">ENTRY USED</span>
            <span className="text-[10px] text-rose-200 mt-1">Redeemed At Gate</span>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
            {ticket.id}
          </span>
          <button
            onClick={handleCopyId}
            title="Copy Ticket ID"
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
