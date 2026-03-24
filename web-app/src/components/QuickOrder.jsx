import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
    UploadCloud,
    FileText,
    ShoppingCart,
    AlertCircle,
    CheckCircle2,
    ShieldCheck, // <-- Added for the locked screen
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // <-- Added to check user status

const QuickOrder = () => {
    // 1. Pull user data from Context
    const { user, isKycApproved } = useContext(AuthContext);

    // 2. Determine if they are a locked B2B user
    const isB2BPending = user?.accountType === 'B2B' && !isKycApproved;

    const [activeTab, setActiveTab] = useState('paste');
    const [skuInput, setSkuInput] = useState('');
    const [parsedItems, setParsedItems] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const addToCart = useCartStore((state) => state.addToCart);

    const handleParseText = () => {
        if (!skuInput.trim()) return;

        const lines = skuInput.split('\n');
        const items = [];

        lines.forEach((line) => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const sku = parts[0].trim();
                const qty = parseInt(parts[1].trim(), 10);
                if (sku && !isNaN(qty) && qty > 0) {
                    items.push({ sku, qty });
                }
            }
        });

        setParsedItems(items);
    };

    const handleBulkAdd = async () => {
        setIsProcessing(true);
        setSuccessMessage('');

        try {
            for (const item of parsedItems) {
                console.log(`Adding SKU: ${item.sku}, Qty: ${item.qty} to cart`);
                // Example: await addToCart(item.sku, item.qty, 'WHOLESALE', 0);
            }

            setTimeout(() => {
                setSuccessMessage(
                    `Successfully added ${parsedItems.length} unique items to your cart!`
                );
                setParsedItems([]);
                setSkuInput('');
                setIsProcessing(false);
            }, 1200);
        } catch (error) {
            console.error('Bulk add failed', error);
            setIsProcessing(false);
        }
    };

    // 3. THE GUARDRAIL: If they are pending B2B, show this screen and STOP rendering.
    if (isB2BPending) {
        return (
            <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center rounded-[3rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/50">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                        <ShieldCheck size={48} />
                    </div>
                    <h2 className="mb-2 text-3xl font-extrabold text-slate-900">
                        Wholesale Access Locked
                    </h2>
                    <p className="mx-auto mb-8 max-w-md leading-relaxed font-medium text-slate-500">
                        The Quick Order Bulk pad is exclusively available to verified business
                        accounts. Your KYC is currently pending review.
                    </p>
                    {/* Routes them directly to the new KYC component we built earlier */}
                    <Link
                        to="/my-account"
                        className="rounded-full bg-slate-900 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-slate-800"
                    >
                        Complete KYC Details
                    </Link>
                </div>
            </main>
        );
    }

    // 4. If they are an approved B2B user (or a B2C user), render the normal tool
    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    Quick Order Pad
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Already know what you need? Paste your SKUs and quantities here to instantly
                    build your cart.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Input Area */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="flex gap-2 border-b border-slate-200 pb-px">
                        <button
                            className={`border-b-2 px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'paste' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                            onClick={() => setActiveTab('paste')}
                        >
                            Paste SKUs
                        </button>
                        <button
                            className={`border-b-2 px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'upload' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            Upload CSV
                        </button>
                    </div>

                    {activeTab === 'paste' ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                                <p className="text-xs leading-relaxed font-medium text-amber-800">
                                    <strong>Format required:</strong> Enter one product per line.
                                    Type the exact SKU, followed by a comma, then the quantity.
                                    <br />
                                    <em>Example:</em>
                                    <br />
                                    <span className="rounded bg-amber-100 px-1 font-mono">
                                        MENS-TEE-BLK-L, 150
                                    </span>
                                    <br />
                                    <span className="rounded bg-amber-100 px-1 font-mono">
                                        BOX-CORR-12X12, 500
                                    </span>
                                </p>
                            </div>

                            <textarea
                                value={skuInput}
                                onChange={(e) => setSkuInput(e.target.value)}
                                placeholder="Paste your list here..."
                                className="h-64 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm shadow-inner transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            ></textarea>

                            <button
                                onClick={handleParseText}
                                disabled={!skuInput.trim()}
                                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                            >
                                Validate List
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center"
                        >
                            <UploadCloud size={48} className="mb-4 text-slate-400" />
                            <h3 className="text-lg font-extrabold text-slate-900">
                                Upload CSV File
                            </h3>
                            <p className="mt-1 mb-6 max-w-sm text-sm font-medium text-slate-500">
                                Your CSV must contain two columns: "SKU" and "Quantity". Maximum 500
                                lines per upload.
                            </p>
                            <button className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                                Select File
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Verification & Action */}
                <div className="h-fit rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-900">
                        <FileText size={20} className="text-slate-400" /> Order Summary
                    </h3>

                    {successMessage ? (
                        <div className="animate-in fade-in zoom-in flex flex-col items-center py-8 text-center duration-300">
                            <CheckCircle2 size={48} className="mb-3 text-emerald-500" />
                            <p className="mb-4 text-sm font-bold text-slate-900">
                                {successMessage}
                            </p>
                            <Link
                                to="/cart"
                                className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white"
                            >
                                Open Procurement Cart
                            </Link>
                        </div>
                    ) : parsedItems.length > 0 ? (
                        <div className="space-y-4">
                            <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto pr-2">
                                {parsedItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-sm"
                                    >
                                        <span className="font-mono font-bold text-slate-700">
                                            {item.sku}
                                        </span>
                                        <span className="font-medium text-slate-500">
                                            Qty:{' '}
                                            <strong className="text-slate-900">{item.qty}</strong>
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="font-bold text-slate-500">
                                        Total Valid Lines
                                    </span>
                                    <span className="text-lg font-black text-slate-900">
                                        {parsedItems.length}
                                    </span>
                                </div>
                                <button
                                    onClick={handleBulkAdd}
                                    disabled={isProcessing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isProcessing ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} /> Add All to Cart
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm font-medium text-slate-400">
                                Paste your SKUs and click "Validate List" to see your summary.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default QuickOrder;
