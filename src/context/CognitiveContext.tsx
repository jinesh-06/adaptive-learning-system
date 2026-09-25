import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export type CognitiveLoadLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ContentMode = 'CONCISE' | 'BALANCED' | 'SIMPLIFIED';

interface CognitiveContextType {
  currentLoad: CognitiveLoadLevel;
  confidence: number;
  contentMode: ContentMode;
  recommendedAction: string;
  reason: string;
  contributingFactors: string[];
  unusualSignal: boolean;
  activeTopicId: string | null;
  setActiveTopicId: (topicId: string) => void;
  updateFromFeedback: (feedback: any) => void;
  setContentModeManually: (mode: ContentMode) => void;
}

const CognitiveContext = createContext<CognitiveContextType | undefined>(undefined);

export const CognitiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLoad, setCurrentLoad] = useState<CognitiveLoadLevel>('MEDIUM');
  const [confidence, setConfidence] = useState<number>(0.85);
  const [contentMode, setContentMode] = useState<ContentMode>('BALANCED');
  const [recommendedAction, setRecommendedAction] = useState<string>('CONTINUE');
  const [reason, setReason] = useState<string>('Steady baseline progression');
  const [contributingFactors, setContributingFactors] = useState<string[]>([
    'Standard engagement pace and learning flow'
  ]);
  const [unusualSignal, setUnusualSignal] = useState<boolean>(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const updateFromFeedback = (feedback: any) => {
    if (!feedback) return;
    if (feedback.cognitive_level) setCurrentLoad(feedback.cognitive_level);
    if (feedback.confidence !== undefined) setConfidence(feedback.confidence);
    if (feedback.content_mode) setContentMode(feedback.content_mode);
    if (feedback.recommended_action) setRecommendedAction(feedback.recommended_action);
    if (feedback.reason) setReason(feedback.reason);
    if (feedback.contributing_factors) setContributingFactors(feedback.contributing_factors);
    if (feedback.unusual_completion?.is_unusual) setUnusualSignal(true);
  };

  const setContentModeManually = (mode: ContentMode) => {
    setContentMode(mode);
    if (mode === 'CONCISE') setCurrentLoad('LOW');
    else if (mode === 'SIMPLIFIED') setCurrentLoad('HIGH');
    else setCurrentLoad('MEDIUM');
  };

  return (
    <CognitiveContext.Provider
      value={{
        currentLoad,
        confidence,
        contentMode,
        recommendedAction,
        reason,
        contributingFactors,
        unusualSignal,
        activeTopicId,
        setActiveTopicId,
        updateFromFeedback,
        setContentModeManually
      }}
    >
      {children}
    </CognitiveContext.Provider>
  );
};

export const useCognitive = () => {
  const context = useContext(CognitiveContext);
  if (!context) throw new Error('useCognitive must be used within a CognitiveProvider');
  return context;
};
