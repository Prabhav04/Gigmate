import React from 'react';
import { X, Trash2 } from 'lucide-react';

const ConfirmDeleteModal = ({ title = "Delete?", itemName, onClose, onConfirm }) => {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl border border-slate-700/80 p-6 shadow-2xl animate-fade-in-up"
                style={{
                    background: 'linear-gradient(135deg, rgba(15,15,20,0.98) 0%, rgba(20,18,35,0.98) 100%)',
                    boxShadow: '0 0 60px rgba(239,68,68,0.15), 0 0 120px rgba(0,0,0,0.8)',
                }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20 text-red-400">
                        <Trash2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
                    </div>
                </div>

                <p className="text-sm text-slate-300 mb-6">
                    Are you sure you want to delete <span className="font-bold text-white">{itemName}</span>? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/20"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
