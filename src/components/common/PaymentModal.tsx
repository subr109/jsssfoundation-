import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentReceipt } from '../../types';
import { OfficialUpiQrCard } from './OfficialUpiQrCard';
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle,
  X,
  Lock,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';

interface PaymentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (receipt: PaymentReceipt) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  student,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { processPayment, foundationInfo } = useApp();
  const [amount, setAmount] = useState<number>(student.totalFees - student.paidFees > 0 ? student.totalFees - student.paidFees : 1500);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedTxn = `${paymentMethod}-TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const newReceipt = processPayment({
        studentId: student.id,
        amount: Number(amount),
        paymentMethod,
        transactionId: generatedTxn,
        notes: `Fee payment for ${student.courseName}`,
      });

      setIsProcessing(false);
      setReceipt(newReceipt);
      if (onPaymentSuccess) onPaymentSuccess(newReceipt);
    }, 1200);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Secure Payment Gateway</h3>
              <p className="text-[10px] text-slate-400">JSSS FOUNDATION • 256-Bit SSL Encrypted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State / Receipt View */}
        {receipt ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Payment Successful!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Transaction ID: <span className="font-mono font-semibold text-slate-700">{receipt.transactionId}</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-200 font-bold text-slate-800">
                <span>Receipt Number:</span>
                <span className="font-mono text-emerald-700">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-semibold text-slate-800">{receipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration No:</span>
                <span className="font-mono text-slate-800">{receipt.studentRegNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-medium text-slate-800">{receipt.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{receipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800">{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-700">{receipt.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save Tax Receipt
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* Student & Course Summary */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{student.name}</p>
                <p className="text-[11px] text-slate-600 font-mono">Reg No: {student.regNo}</p>
                <p className="text-[11px] text-emerald-800 font-medium">{student.courseName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Total Due Amount</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{(student.totalFees - student.paidFees).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="100"
                  max={Math.max(student.totalFees - student.paidFees, 10000)}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[1000, 2000, student.totalFees - student.paidFees].filter((v) => v > 0).map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    Pay ₹{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs ${
                    paymentMethod === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-1" />
                  UPI / QR
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs ${
                    paymentMethod === 'CARD'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  Cards
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-5 h-5 mb-1" />
                  NetBanking
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs ${
                    paymentMethod === 'WALLET'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Wallet className="w-5 h-5 mb-1" />
                  Wallets
                </button>
              </div>
            </div>

            {/* Dynamic Details based on Method */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900">Official Foundation Google Pay UPI QR</span>
                    <p className="text-[10px] text-slate-500">Scan using Google Pay, PhonePe, Paytm or any UPI App</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    Verified Payee
                  </span>
                </div>

                <div className="flex justify-center">
                  <OfficialUpiQrCard
                    amount={amount}
                    note={`Fee for ${student.courseName} (${student.regNo})`}
                    studentName={student.name}
                    courseName={student.courseName}
                    compact={true}
                    showActions={true}
                  />
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    UPI Transaction UTR / Ref Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 423871928374"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Once paid on your UPI app, click 'Pay Securely' below to generate your instant fee receipt.
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8891"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="08/29"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="As shown on card"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'NETBANKING' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-[11px] font-medium text-slate-600">Select Bank</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank', 'Axis Bank', 'Bank of Baroda'].map(
                    (b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                          selectedBank === b
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {b}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'WALLET' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-[11px] font-medium text-slate-600">Select Digital Wallet</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['Paytm Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge', 'Airtel Money', 'JioMoney'].map((w) => (
                    <button
                      type="button"
                      key={w}
                      onClick={() => setSelectedWallet(w)}
                      className={`p-2 rounded-lg border text-center font-medium transition-colors ${
                        selectedWallet === w
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Legal / Beneficiary note */}
            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>Beneficiary: {foundationInfo.legalName}</span>
              <span className="font-semibold text-emerald-700">Bank: SBI (IFSC: {foundationInfo.bankIfsc})</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authorizing Transaction...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ₹{amount.toLocaleString()} Securely
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
