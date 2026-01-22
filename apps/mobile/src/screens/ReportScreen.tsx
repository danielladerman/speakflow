/**
 * Report Screen - Display session analysis results.
 *
 * Shows:
 * - Scorecard (overall + component scores)
 * - Transcript with flag markers
 * - Coaching recommendations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import { SessionReport, FocusMetric } from '../types/contracts';

type Tab = 'scorecard' | 'transcript' | 'coaching';

const METRIC_LABELS: Record<FocusMetric, string> = {
  pace: 'Pace',
  fluency: 'Fluency',
  clarity: 'Clarity',
  vocal_variety: 'Vocal Variety',
  structure: 'Structure',
  confidence: 'Confidence',
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#E74C3C';
}

export function ReportScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Tab>('scorecard');

  const report: SessionReport = route.params?.report;

  if (!report || !report.score_contract) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No report data available</Text>
      </View>
    );
  }

  const { score_contract, coaching_response, transcript } = report;
  const { scores, metrics, focus_metric, flags } = score_contract;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Session Report</Text>
        <Text style={styles.duration}>
          {formatDuration(score_contract.duration_sec)}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scorecard' && styles.activeTab]}
          onPress={() => setActiveTab('scorecard')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'scorecard' && styles.activeTabText,
            ]}
          >
            Scorecard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transcript' && styles.activeTab]}
          onPress={() => setActiveTab('transcript')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'transcript' && styles.activeTabText,
            ]}
          >
            Transcript
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'coaching' && styles.activeTab]}
          onPress={() => setActiveTab('coaching')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'coaching' && styles.activeTabText,
            ]}
          >
            Coaching
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'scorecard' && (
          <View style={styles.scorecard}>
            {/* Overall Score */}
            <View style={styles.overallScore}>
              <Text style={styles.overallLabel}>Overall Score</Text>
              <Text
                style={[
                  styles.overallValue,
                  { color: getScoreColor(scores.overall) },
                ]}
              >
                {scores.overall}
              </Text>
            </View>

            {/* Focus Metric */}
            <View style={styles.focusArea}>
              <Text style={styles.focusLabel}>Focus Area</Text>
              <Text style={styles.focusValue}>
                {METRIC_LABELS[focus_metric]}
              </Text>
            </View>

            {/* Component Scores */}
            <View style={styles.componentScores}>
              {Object.entries(scores).map(([key, value]) => {
                if (key === 'overall') return null;
                const isFocus = key === focus_metric;
                return (
                  <View
                    key={key}
                    style={[
                      styles.scoreRow,
                      isFocus && styles.focusScoreRow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreName,
                        isFocus && styles.focusScoreName,
                      ]}
                    >
                      {METRIC_LABELS[key as FocusMetric] || key}
                    </Text>
                    <View style={styles.scoreBarContainer}>
                      <View
                        style={[
                          styles.scoreBar,
                          { width: `${value}%`, backgroundColor: getScoreColor(value) },
                        ]}
                      />
                    </View>
                    <Text style={[styles.scoreValue, { color: getScoreColor(value) }]}>
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Metrics */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>Raw Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{metrics.wpm.toFixed(0)}</Text>
                  <Text style={styles.metricLabel}>WPM</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {metrics.filler_per_min.toFixed(1)}
                  </Text>
                  <Text style={styles.metricLabel}>Fillers/min</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{metrics.power_pauses}</Text>
                  <Text style={styles.metricLabel}>Power Pauses</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {metrics.pitch_variance.toFixed(0)}
                  </Text>
                  <Text style={styles.metricLabel}>Pitch Var (Hz)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'transcript' && (
          <View style={styles.transcriptContainer}>
            {transcript && transcript.length > 0 ? (
              <Text style={styles.transcriptText}>
                {transcript.map((word, i) => {
                  // Check if this word is flagged
                  const flag = flags.find(
                    f => word.start >= f.t_start && word.end <= f.t_end,
                  );
                  return (
                    <Text
                      key={i}
                      style={[
                        styles.word,
                        flag?.reason === 'filler' && styles.fillerWord,
                      ]}
                    >
                      {word.word}{' '}
                    </Text>
                  );
                })}
              </Text>
            ) : (
              <Text style={styles.noDataText}>No transcript available</Text>
            )}

            {/* Flags */}
            {flags.length > 0 && (
              <View style={styles.flagsSection}>
                <Text style={styles.sectionTitle}>Flagged Moments</Text>
                {flags.map((flag, i) => (
                  <View key={i} style={styles.flagItem}>
                    <Text style={styles.flagTime}>
                      {formatDuration(flag.t_start)}
                    </Text>
                    <Text style={styles.flagReason}>{flag.reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'coaching' && coaching_response && (
          <View style={styles.coachingContainer}>
            {/* Summary */}
            <View style={styles.coachingSection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>{coaching_response.summary}</Text>
            </View>

            {/* Strengths */}
            <View style={styles.coachingSection}>
              <Text style={styles.sectionTitle}>Strengths</Text>
              {coaching_response.strengths.map((strength, i) => (
                <View key={i} style={styles.strengthItem}>
                  <Text style={styles.strengthArea}>
                    {METRIC_LABELS[strength.area]}
                  </Text>
                  <Text style={styles.strengthObservation}>
                    {strength.observation}
                  </Text>
                </View>
              ))}
            </View>

            {/* Focus Area */}
            <View style={styles.coachingSection}>
              <Text style={styles.sectionTitle}>Focus Area</Text>
              <View style={styles.focusCard}>
                <Text style={styles.focusCardTitle}>
                  {METRIC_LABELS[coaching_response.focus_area.area]}
                </Text>
                <Text style={styles.focusCardScore}>
                  {coaching_response.focus_area.current_score} →{' '}
                  {coaching_response.focus_area.target_score}
                </Text>
                <Text style={styles.focusCardObservation}>
                  {coaching_response.focus_area.observation}
                </Text>
                <Text style={styles.focusCardImpact}>
                  {coaching_response.focus_area.impact}
                </Text>
              </View>
            </View>

            {/* Recommended Drills */}
            <View style={styles.coachingSection}>
              <Text style={styles.sectionTitle}>Recommended Drills</Text>
              {coaching_response.recommended_drills.map((drill, i) => (
                <View key={i} style={styles.drillItem}>
                  <View style={styles.drillHeader}>
                    <Text style={styles.drillPriority}>#{drill.priority}</Text>
                    <Text style={styles.drillId}>{drill.drill_id}</Text>
                  </View>
                  <Text style={styles.drillReason}>{drill.reason}</Text>
                </View>
              ))}
            </View>

            {/* Next Session Goal */}
            <View style={styles.coachingSection}>
              <Text style={styles.sectionTitle}>Next Session Goal</Text>
              <Text style={styles.goalText}>
                {coaching_response.next_session_goal}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Practice Again Button */}
      <TouchableOpacity
        style={styles.practiceButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.practiceButtonText}>Practice Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  duration: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#252541',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    color: '#8B8B9A',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scorecard: {
    paddingVertical: 20,
  },
  overallScore: {
    alignItems: 'center',
    marginBottom: 24,
  },
  overallLabel: {
    color: '#8B8B9A',
    fontSize: 14,
    marginBottom: 8,
  },
  overallValue: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  focusArea: {
    backgroundColor: '#252541',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  focusLabel: {
    color: '#8B8B9A',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  focusValue: {
    color: '#FF9800',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  componentScores: {
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusScoreRow: {
    backgroundColor: '#252541',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: -8,
  },
  scoreName: {
    color: '#FFFFFF',
    width: 100,
    fontSize: 14,
  },
  focusScoreName: {
    color: '#FF9800',
    fontWeight: '600',
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#252541',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    width: 32,
    textAlign: 'right',
    fontWeight: '600',
  },
  metricsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricItem: {
    width: '50%',
    padding: 8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: '#8B8B9A',
    fontSize: 12,
    marginTop: 4,
  },
  transcriptContainer: {
    paddingVertical: 20,
  },
  transcriptText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 28,
  },
  word: {
    color: '#FFFFFF',
  },
  fillerWord: {
    color: '#E74C3C',
    backgroundColor: '#E74C3C22',
    borderRadius: 2,
  },
  flagsSection: {
    marginTop: 24,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252541',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  flagTime: {
    color: '#8B8B9A',
    fontSize: 14,
    width: 60,
  },
  flagReason: {
    color: '#FF9800',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  coachingContainer: {
    paddingVertical: 20,
  },
  coachingSection: {
    marginBottom: 24,
  },
  summaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
  },
  strengthItem: {
    backgroundColor: '#252541',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  strengthArea: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  strengthObservation: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  focusCard: {
    backgroundColor: '#252541',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  focusCardTitle: {
    color: '#FF9800',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  focusCardScore: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  focusCardObservation: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  focusCardImpact: {
    color: '#8B8B9A',
    fontSize: 13,
    fontStyle: 'italic',
  },
  drillItem: {
    backgroundColor: '#252541',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  drillPriority: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  drillId: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  drillReason: {
    color: '#8B8B9A',
    fontSize: 14,
  },
  goalText: {
    color: '#FFFFFF',
    fontSize: 15,
    backgroundColor: '#252541',
    borderRadius: 8,
    padding: 16,
  },
  noDataText: {
    color: '#8B8B9A',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  practiceButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  practiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
