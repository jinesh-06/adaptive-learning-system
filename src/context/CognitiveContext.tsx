import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export type CognitiveLoadLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ContentMode = 'STANDARD' | 'DETAILED' | 'SIMPLIFIED' | 'CONCISE' | 'BALANCED';

interface CognitiveContextType {
  currentLoad: CognitiveLoadLevel;
  confidence: number;
  contentMode: ContentMode;
  recommendedAction: string;
  reason: string;
  contributingFactors: string[];
  unusualSignal: boolean;
  activeTopicId: string | null;
  suggestedAdaptation: string | null;
  pendingAdaptation: { targetMode: ContentMode; reason: string; suggestedAdaptation: string } | null;
  setActiveTopicId: (topicId: string) => void;
  updateFromFeedback: (feedback: any) => void;
  setContentModeManually: (mode: ContentMode) => void;
  verifyAdaptation: (accept: boolean) => void;
}

const CognitiveContext = createContext<CognitiveContextType | undefined>(undefined);

export const CognitiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLoad, setCurrentLoad] = useState<CognitiveLoadLevel>('MEDIUM');
  const [confidence, setConfidence] = useState<number>(0.85);
  const [contentMode, setContentMode] = useState<ContentMode>('STANDARD');
  const [recommendedAction, setRecommendedAction] = useState<string>('CONTINUE');
  const [reason, setReason] = useState<string>('Steady baseline progression');
  const [contributingFactors, setContributingFactors] = useState<string[]>([
    'Standard engagement pace and learning flow'
  ]);
  const [unusualSignal, setUnusualSignal] = useState<boolean>(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [suggestedAdaptation, setSuggestedAdaptation] = useState<string | null>(null);
  const [pendingAdaptation, setPendingAdaptation] = useState<{
    targetMode: ContentMode;
    reason: string;
    suggestedAdaptation: string;
  } | null>(null);

  const updateFromFeedback = (feedback: any) => {
    if (!feedback) return;
    if (feedback.confidence !== undefined) setConfidence(feedback.confidence);
    if (feedback.recommended_action) setRecommendedAction(feedback.recommended_action);
    if (feedback.reason) setReason(feedback.reason);
    if (feedback.contributing_factors) setContributingFactors(feedback.contributing_factors);
    if (feedback.unusual_completion?.is_unusual) setUnusualSignal(true);

    const rawTargetMode: ContentMode | undefined = feedback.content_mode;
    const targetMode: ContentMode | undefined =
      rawTargetMode === 'BALANCED' ? 'STANDARD' : rawTargetMode === 'CONCISE' ? 'DETAILED' : rawTargetMode;
    const targetLoad: CognitiveLoadLevel | undefined = feedback.cognitive_level || feedback.cognitive_load;
    const adaptationText = feedback.suggested_adaptation || (
      targetLoad === 'HIGH'
        ? 'Suggested Adaptation: Switch to Simplified mode with bite-sized micro-steps based on recent learning signals.'
        : targetLoad === 'LOW'
        ? 'Suggested Adaptation: Switch to Detailed mode with deep architectural insights based on recent learning activity.'
        : 'Suggested Adaptation: Standard explanation selected based on steady learning pace.'
    );

    if (adaptationText) {
      setSuggestedAdaptation(adaptationText);
    }

    // Learner Agency: If the target mode differs from current, stage as a pending adaptation
    if (targetMode && targetMode !== contentMode) {
      setPendingAdaptation({
        targetMode,
        reason: feedback.reason || 'Learning activity suggests an adapted explanation pace.',
        suggestedAdaptation: adaptationText || `Suggested Adaptation to ${targetMode} mode.`
      });
    } else if (targetLoad && !targetMode) {
      const impliedMode: ContentMode = targetLoad === 'HIGH' ? 'SIMPLIFIED' : targetLoad === 'LOW' ? 'DETAILED' : 'STANDARD';
      if (impliedMode !== contentMode) {
        setPendingAdaptation({
          targetMode: impliedMode,
          reason: feedback.reason || 'Recent interaction signals suggest adjusting explanation depth.',
          suggestedAdaptation: adaptationText || `Suggested Adaptation to ${impliedMode} mode.`
        });
      }
    }
  };

  const verifyAdaptation = (accept: boolean) => {
    if (accept && pendingAdaptation) {
      setContentMode(pendingAdaptation.targetMode);
      if (pendingAdaptation.targetMode === 'DETAILED' || pendingAdaptation.targetMode === 'CONCISE') setCurrentLoad('LOW');
      else if (pendingAdaptation.targetMode === 'SIMPLIFIED') setCurrentLoad('HIGH');
      else setCurrentLoad('MEDIUM');
    }
    setPendingAdaptation(null);
  };

  const setContentModeManually = (mode: ContentMode) => {
    setContentMode(mode);
    setPendingAdaptation(null);
    if (mode === 'DETAILED' || mode === 'CONCISE') setCurrentLoad('LOW');
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
        suggestedAdaptation,
        pendingAdaptation,
        setActiveTopicId,
        updateFromFeedback,
        setContentModeManually,
        verifyAdaptation
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
