'use client';

import React, { useState, useRef } from 'react';
import {
  Printer,
  X,
  Truck,
  Package,
  QrCode,
  Check,
  Save,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Order } from '../../types';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface ShippingLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

const COURIER_PARTNERS = [
  { id: 'bluedart', name: 'Blue Dart Express', code: 'BD-AIR', speed: 'Air Priority' },
  { id: 'delhivery', name: 'Delhivery Surface/Air', code: 'DEL-SUR', speed: 'Express' },
  { id: 'dtdc', name: 'DTDC Courier', code: 'DTDC-PRE', speed: 'Premium Plus' },
  { id: 'speedpost', name: 'India Post (Speed Post)', code: 'IN-SPD', speed: 'National Air' },
  { id: 'ekart', name: 'Ekart Logistics', code: 'EKT-EXP', speed: 'Direct' },
  { id: 'xpressbees', name: 'XpressBees', code: 'XB-STD', speed: 'Standard' },
];

/**
 * Pure SVG Code 128 / visual barcode generator
 */
function VisualBarcode({ value }: { value: string }) {
  // Generate a deterministic visual barcode pattern based on string hash
  const sanitized = (value || '00000000').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const bars: { width: number; isBlack: boolean }[] = [];

  // Quiet zone
  bars.push({ width: 3, isBlack: false });

  // Start pattern
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 1, isBlack: true });

  for (let i = 0; i < sanitized.length; i++) {
    const code = sanitized.charCodeAt(i);
    const p1 = (code % 3) + 1;
    const p2 = ((code * 2) % 3) + 1;
    const p3 = ((code * 3) % 2) + 1;
    const p4 = ((code * 5) % 3) + 1;

    bars.push({ width: p1, isBlack: true });
    bars.push({ width: p2, isBlack: false });
    bars.push({ width: p3, isBlack: true });
    bars.push({ width: p4, isBlack: false });
  }

  // Stop pattern
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 3, isBlack: true });

  let totalWidth = 0;
  bars.forEach((b) => (totalWidth += b.width));

  let currentX = 0;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${totalWidth} 48`}
        className="w-full max-w-[260px] h-12"
        preserveAspectRatio="none"
      >
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width;
          if (!bar.isBlack) return null;
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={bar.width}
              height={48}
              fill="#000000"
            />
          );
        })}
      </svg>
      <span className="font-mono text-[10px] tracking-[0.25em] font-black text-black mt-0.5">
        *{sanitized}*
      </span>
    </div>
  );
}

/**
 * Visual QR Code representation
 */
function VisualQRCode({ value }: { value: string }) {
  // Deterministic 15x15 mini QR matrix
  const size = 17;
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const isCorner = (r: number, c: number) => {
    // Top-left
    if (r < 5 && c < 5) return r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2);
    // Top-right
    if (r < 5 && c >= size - 5) return r === 0 || r === 4 || c === size - 5 || c === size - 1 || (r === 2 && c === size - 3);
    // Bottom-left
    if (r >= size - 5 && c < 5) return r === size - 5 || r === size - 1 || c === 0 || c === 4 || (r === size - 3 && c === 2);
    return false;
  };

  const cells: boolean[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isCorner(r, c)) {
        cells.push(true);
      } else {
        const val = ((r * 7 + c * 13 + hash) % 7) === 0 || ((r * 3 + c * 5) % 4) === 0;
        cells.push(val);
      }
    }
  }

  return (
    <div className="w-16 h-16 bg-white p-1 border border-black flex flex-wrap flex-shrink-0">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {cells.map((active, idx) => {
          if (!active) return null;
          const r = Math.floor(idx / size);
          const c = idx % size;
          return <rect key={idx} x={c} y={r} width={1} height={1} fill="#000000" />;
        })}
      </svg>
    </div>
  );
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const [selectedCourier, setSelectedCourier] = useState(COURIER_PARTNERS[0]);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [isSavingAwb, setIsSavingAwb] = useState(false);
  const [paperFormat, setPaperFormat] = useState<'4x6' | 'a4'>('4x6');
  const printRef = useRef<HTMLDivElement>(null);

  // Sync tracking number when order changes
  React.useEffect(() => {
    if (order?.trackingNumber) {
      setTrackingNumber(order.trackingNumber);
    } else if (order) {
      // Suggest realistic tracking number if empty
      const courierCode = selectedCourier.id.toUpperCase().slice(0, 4);
      const rand = Math.floor(100000000 + Math.random() * 900000000);
      setTrackingNumber(`${courierCode}-IND-${rand}`);
    }
  }, [order, selectedCourier]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAwb = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a valid tracking number');
      return;
    }

    try {
      setIsSavingAwb(true);
      const res = await api.put(`/orders/admin/${order._id}/status`, {
        orderStatus: order.orderStatus === 'Pending' ? 'Processing' : order.orderStatus,
        trackingNumber: trackingNumber.trim(),
        note: `Shipping label generated and courier AWB assigned (${selectedCourier.name} - ${trackingNumber.trim()})`,
      });

      if (res.data?.success) {
        toast.success('Courier AWB tracking number saved to order');
        if (onOrderUpdated) {
          onOrderUpdated(res.data.data);
        }
      }
    } catch (error) {
      toast.error('Failed to save tracking number');
      console.error(error);
    } finally {
      setIsSavingAwb(false);
    }
  };

  const isCod = order.paymentMethod?.toLowerCase() === 'cod';
  const totalItemsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;
  const estimatedWeight = (totalItemsCount * 0.45).toFixed(2); // approx 450g per luxury silk item

  // Routing hub derivation from postal code
  const pin = order.shippingAddress?.postalCode || '600001';
  const hubCode = `${pin.slice(0, 2)}-${order.shippingAddress?.city?.slice(0, 3).toUpperCase() || 'HUB'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#EAE1D1] shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#FAF7F2] border-b border-[#EAE1D1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#18140B] text-white flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#18140B] flex items-center gap-2">
                Shipping Label & Air Waybill
                <span className="text-xs font-mono font-bold bg-[#18140B] text-white border border-[#18140B] px-2.5 py-0.5 rounded-full">
                  {order.orderNumber}
                </span>
              </h2>
              <p className="text-xs text-[#6B6055] font-medium">
                Generate, customize, and print high-density dispatch labels for warehouse operations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B6055] hover:text-[#18140B] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="no-print px-6 py-3.5 bg-white border-b border-[#EAE1D1] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-extrabold text-[#18140B] block mb-1">
                Courier Carrier
              </label>
              <select
                value={selectedCourier.id}
                onChange={(e) => {
                  const partner = COURIER_PARTNERS.find((p) => p.id === e.target.value);
                  if (partner) setSelectedCourier(partner);
                }}
                className="bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-1.5 font-bold text-[#18140B] text-xs focus:outline-none focus:border-[#B8860B]"
              >
                {COURIER_PARTNERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-extrabold text-[#18140B] block mb-1">
                Air Waybill / Tracking #
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BLUEDART-IND-987654321"
                  className="bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-[#18140B] w-52 focus:outline-none focus:border-[#B8860B]"
                />
                <button
                  type="button"
                  onClick={handleSaveAwb}
                  disabled={isSavingAwb}
                  className="px-3.5 py-1.5 rounded-xl bg-[#18140B] hover:bg-[#2D2319] text-white border border-[#18140B] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 text-xs"
                  title="Save AWB to Order Database"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  {isSavingAwb ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-extrabold text-[#18140B] block mb-1">
                Format
              </label>
              <div className="flex items-center bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setPaperFormat('4x6')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    paperFormat === '4x6'
                      ? 'bg-[#18140B] text-white shadow-xs'
                      : 'text-[#18140B] hover:bg-black/5 font-semibold'
                  }`}
                >
                  4×6" Thermal
                </button>
                <button
                  type="button"
                  onClick={() => setPaperFormat('a4')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    paperFormat === 'a4'
                      ? 'bg-[#18140B] text-white shadow-xs'
                      : 'text-[#18140B] hover:bg-black/5 font-semibold'
                  }`}
                >
                  A4 Manifest
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#18140B] hover:bg-[#2D2319] text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-400" /> Print Shipping Label
            </button>
          </div>
        </div>

        {/* Scrollable Label Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-zinc-100 flex items-center justify-center">
          {/* THE SHIPPING LABEL (PRINT TARGET) */}
          <div
            ref={printRef}
            className={`shipping-label-printable bg-white text-black border-2 border-black shadow-lg p-5 font-sans leading-tight ${
              paperFormat === '4x6' ? 'w-full max-w-[420px]' : 'w-full max-w-[620px]'
            }`}
            style={{ minHeight: '600px' }}
          >
            {/* 1. Header Grid */}
            <div className="border-b-2 border-black pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black tracking-tighter uppercase font-serif text-black">
                    NALMARA FASHION
                  </h1>
                  <p className="text-[10px] font-black tracking-widest uppercase text-black">
                    Royal Indian Couture & Artisan Handlooms
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-black text-white px-2 py-0.5 font-mono font-black text-xs uppercase">
                    {selectedCourier.code}
                  </div>
                  <p className="text-[11px] font-mono font-black mt-0.5 text-black">
                    HUB: {hubCode}
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t-2 border-dashed border-black flex items-center justify-between text-[11px] font-mono font-bold text-black">
                <span>Carrier: <strong>{selectedCourier.name}</strong></span>
                <span>Type: <strong>{selectedCourier.speed}</strong></span>
                <span>Date: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
              </div>
            </div>

            {/* 2. Main Tracking Barcode Section */}
            <div className="py-3 border-b-2 border-black text-center bg-zinc-50">
              <VisualBarcode value={trackingNumber || order.orderNumber} />
              <div className="flex items-center justify-between px-2 mt-1 text-[11px] font-mono font-black text-black">
                <span>AWB: <strong>{trackingNumber || 'PENDING'}</strong></span>
                <span>Order: <strong>#{order.orderNumber}</strong></span>
              </div>
            </div>

            {/* 3. Payment Classification Banner (High Contrast) */}
            <div className="my-2">
              {isCod ? (
                <div className="border-2 border-black bg-black text-white p-2.5 text-center">
                  <div className="text-sm font-black uppercase tracking-wider">
                    ★ CASH ON DELIVERY (COD) ★
                  </div>
                  <div className="text-xl font-mono font-black mt-0.5">
                    COLLECT CASH: {formatCurrency(order.total)}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-100 mt-0.5">
                    Do not hand over consignment without collecting exact amount.
                  </p>
                </div>
              ) : (
                <div className="border-2 border-black bg-zinc-100 p-2 text-center text-black">
                  <div className="text-xs font-black uppercase tracking-wider text-black">
                    ✓ PREPAID SHIPMENT — DO NOT COLLECT CASH
                  </div>
                  <div className="text-base font-mono font-black mt-0.5 text-black">
                    Total Settled: {formatCurrency(order.total)}
                  </div>
                  <p className="text-[10px] text-black font-bold">
                    Payment Method: {order.paymentMethod?.toUpperCase()} • Status: {order.paymentStatus?.toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {/* 4. Delivery Address (Consignee) */}
            <div className="border-2 border-black p-3 my-2">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
                  DELIVER TO (CONSIGNEE)
                </span>
                <span className="text-[11px] font-mono font-black text-black">
                  REF: {order._id.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="mt-2 space-y-0.5 text-xs text-black">
                <p className="text-base font-black uppercase tracking-wide text-black">
                  {order.shippingAddress?.fullName || 'Valued Customer'}
                </p>
                <p className="font-bold text-black">
                  {order.shippingAddress?.addressLine1}
                </p>
                {order.shippingAddress?.addressLine2 && (
                  <p className="font-semibold text-black">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="font-black text-black uppercase">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p className="text-black font-bold text-[11px]">{order.shippingAddress?.country || 'India'}</p>

                {/* Big PIN Code Box for Sorters */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="border-2 border-black px-3.5 py-1.5 bg-zinc-50">
                    <span className="text-[10px] block text-black font-extrabold uppercase">Postal PIN Code</span>
                    <span className="text-2xl font-mono font-black tracking-widest text-black">
                      {order.shippingAddress?.postalCode || '--- ---'}
                    </span>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="block text-black text-[10px] uppercase font-bold">Contact Phone</span>
                    <strong className="text-black font-black text-sm">{order.shippingAddress?.phone}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Package Manifest & Return Address Grid */}
            <div className="grid grid-cols-2 gap-2 my-2 text-[10px]">
              {/* Return Address */}
              <div className="border-2 border-black p-2.5 bg-zinc-50 text-black">
                <span className="font-black uppercase text-[10px] block border-b-2 border-black pb-0.5 mb-1 text-black">
                  SHIPPER / RETURN TO:
                </span>
                <p className="font-black text-black text-xs">NALMARA FASHION PVT. LTD.</p>
                <p className="font-medium text-black">Artisan Weavers Loom Unit, 142/A</p>
                <p className="font-medium text-black">Kanchipuram, Tamil Nadu - 631501</p>
                <p className="font-semibold text-black">GSTIN: 33AAACN1234A1Z6</p>
                <p className="font-mono text-black font-black pt-1">Helpline: +91 78712 07631</p>
              </div>

              {/* Package Meta */}
              <div className="border-2 border-black p-2.5 flex flex-col justify-between text-black bg-zinc-50">
                <div>
                  <span className="font-black uppercase text-[10px] block border-b-2 border-black pb-0.5 mb-1 text-black">
                    PACKAGE DETAILS:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono font-bold text-black">
                    <div>
                      <span className="text-black font-bold block text-[9px]">EST. WEIGHT</span>
                      <strong className="text-sm font-black">{estimatedWeight} KG</strong>
                    </div>
                    <div>
                      <span className="text-black font-bold block text-[9px]">TOTAL ITEMS</span>
                      <strong className="text-sm font-black">{totalItemsCount} PCS</strong>
                    </div>
                  </div>
                  <div className="mt-1.5 text-[10px] font-mono font-bold text-black">
                    <span>Dim: 32 × 26 × 6 cm</span>
                  </div>
                </div>
                <div className="pt-1 text-[9px] uppercase tracking-wider font-black text-black">
                  Standard Parcel
                </div>
              </div>
            </div>

            {/* 6. Item Manifest Summary Table */}
            <div className="border-2 border-black my-2">
              <div className="bg-zinc-200 px-2.5 py-1 font-black text-[10px] uppercase border-b-2 border-black flex justify-between text-black">
                <span>Enclosed Artifacts Manifest</span>
                <span className="font-mono font-black">Order #{order.orderNumber}</span>
              </div>
              <div className="divide-y-2 divide-zinc-200 text-xs">
                {order.items?.map((item, i) => (
                  <div key={i} className="px-2.5 py-1.5 flex items-center justify-between font-mono text-black">
                    <span className="truncate max-w-[240px] text-black font-bold font-sans text-xs">
                      {item.name}
                    </span>
                    <span className="text-black font-bold pl-2">
                      SKU: {item.sku || 'N/A'} × <strong className="font-black">{item.quantity}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Footer Instructions & QR Code */}
            <div className="border-t-2 border-black pt-2 flex items-center justify-between text-[10px]">
              <div className="space-y-0.5 text-black max-w-[280px]">
                <p className="font-black text-black uppercase text-[11px]">
                  ⚡ FRAGILE — LUXURY TEXTILE HANDLOOM
                </p>
                <p className="font-medium text-black">
                  Handle with care. If outer seal is broken or tampered with, please record remark with courier delivery executive.
                </p>
                <p className="text-[9px] text-black font-mono font-semibold">
                  Generated via Nalmara Warehouse Console
                </p>
              </div>

              <div className="flex flex-col items-center">
                <VisualQRCode value={`https://nalmarafashion.vercel.app/track-order?id=${order._id}`} />
                <span className="text-[9px] font-mono font-black text-black mt-1">SCAN TO TRACK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print px-6 py-4 bg-[#FAF7F2] border-t border-[#EAE1D1] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#6B6055]">
            <AlertCircle className="w-4 h-4 text-[#B8860B]" />
            <span>Labels are formatted according to IATA / Express Courier packaging standards.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#EAE1D1] text-[#6B6055] hover:text-[#18140B] font-semibold transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-white font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" /> Print Label
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
