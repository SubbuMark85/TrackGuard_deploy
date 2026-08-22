import React, { useState } from 'react';
import { MapPin, ShieldCheck, AlertCircle, X, Compass, Trash2 } from 'lucide-react';

interface LocationConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName?: string;
  onConfirmEnableSharing: (oneTimeLocation?: { latitude: number; longitude: number; accuracy: number; label: string }) => void;
  onRemoveLocation?: () => void;
  currentlyEnabled: boolean;
}

export const LocationConsentModal: React.FC<LocationConsentModalProps> = ({
  isOpen,
  onClose,
  memberName = 'this family member',
  onConfirmEnableSharing,
  onRemoveLocation,
  currentlyEnabled,
}) => {
  const [useOneTimeBrowserLoc, setUseOneTimeBrowserLoc] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEnable = () => {
    if (useOneTimeBrowserLoc) {
      if (!('geolocation' in navigator)) {
        setLocError('Browser geolocation is not supported on this browser.');
        return;
      }

      setGettingLocation(true);
      setLocError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGettingLocation(false);
          onConfirmEnableSharing({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            label: 'Browser location (pilot demo)',
          });
          onClose();
        },
        (err) => {
          setGettingLocation(false);
          setLocError(`Geolocation error: ${err.message || 'Permission denied'}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      onConfirmEnableSharing();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D1527] border border-slate-700/80 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-white">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-[#162036] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Location Sharing Privacy & Consent</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm text-slate-300">
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-start gap-2.5 text-xs text-cyan-200">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong>Privacy Protection:</strong> TrackGuard never accesses location silently in the background. Live location is processed only when explicitly enabled by an authorized guardian.
            </div>
          </div>

          <p>
            You are configuring location processing settings for <strong className="text-white">{memberName}</strong>.
          </p>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useOneTimeBrowserLoc}
                onChange={(e) => setUseOneTimeBrowserLoc(e.target.checked)}
                className="mt-1 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-400"
              />
              <span className="text-xs text-slate-200">
                <strong>Capture one-time browser location right now (demo update)</strong>
                <br />
                Uses standard browser GPS prompt to pin current latitude & longitude for testing.
              </span>
            </label>
          </div>

          {locError && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{locError}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 leading-normal">
            By confirming below, you acknowledge that you are authorized to manage safety and location consent for {memberName} under TrackGuard's Privacy Policy.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#162036] flex items-center justify-between gap-3">
          {currentlyEnabled && onRemoveLocation ? (
            <button
              onClick={() => {
                onRemoveLocation();
                onClose();
              }}
              className="px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Stored Data
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleEnable}
            disabled={gettingLocation}
            className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl shadow-lg shadow-teal-500/20 hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
          >
            {gettingLocation ? (
              <>
                <Compass className="w-4 h-4 animate-spin text-slate-950" />
                Getting Location...
              </>
            ) : currentlyEnabled ? (
              'Update Settings'
            ) : (
              'Confirm & Enable Consent'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
