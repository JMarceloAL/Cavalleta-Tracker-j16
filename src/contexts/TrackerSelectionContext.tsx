import React, { createContext, useContext, useMemo, useState } from 'react';

import type { Tracker } from '../types/Tracker';

type TrackerSelectionContextType = {
    selectedTrackerId: string | null;
    setSelectedTrackerId: (trackerId: string | null) => void;
    resolveSelectedTracker: (trackers: Tracker[]) => Tracker | null;
};

const TrackerSelectionContext = createContext<TrackerSelectionContextType | null>(null);

export function TrackerSelectionProvider({ children }: { children: React.ReactNode }) {
    const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);

    const resolveSelectedTracker = (trackers: Tracker[]) => {
        if (!Array.isArray(trackers) || trackers.length === 0) {
            return null;
        }

        if (selectedTrackerId) {
            const found = trackers.find(tracker => tracker.id === selectedTrackerId);
            if (found) {
                return found;
            }
        }

        return trackers[0];
    };

    const value = useMemo<TrackerSelectionContextType>(() => ({
        selectedTrackerId,
        setSelectedTrackerId,
        resolveSelectedTracker,
    }), [selectedTrackerId]);

    return (
        <TrackerSelectionContext.Provider value={value}>
            {children}
        </TrackerSelectionContext.Provider>
    );
}

export function useTrackerSelection() {
    const context = useContext(TrackerSelectionContext);

    if (!context) {
        throw new Error('useTrackerSelection deve ser usado dentro de TrackerSelectionProvider');
    }

    return context;
}
