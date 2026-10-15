import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Loader2 } from 'lucide-react';

const FollowUpModal = ({ isOpen, onClose, application, onGenerate, emailDraft, loading }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !application) return null;

  const handleCopy = () => {
    if (!emailDraft) return;
    navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                AI Follow-Up Message
              </h3>
              <p className="text-xs text-slate-500">
                For {application.role} at {application.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-700">Drafting follow-up message with AI...</p>
              <p className="text-xs text-slate-400 mt-1">Personalizing based on your application status ({application.status})</p>
            </div>
          ) : emailDraft ? (
            <div>
              <div className="relative">
                <textarea
                  readOnly
                  value={emailDraft}
                  rows={9}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onGenerate(application)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Regenerate Draft
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 mb-4">
                Click below to generate a tailored follow-up note for the recruiter or hiring team.
              </p>
              <button
                type="button"
                onClick={() => onGenerate(application)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate Draft Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
