/**
 * Record Screen - Audio recording with real-time HUD.
 *
 * v1 HUD shows: pace (via duration/words estimated) + volume meter.
 * No real-time filler detection in v1.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { api } from '../services/api';

type RecordingPhase = 'idle' | 'recording' | 'uploading' | 'processing';

export function RecordScreen() {
  const navigation = useNavigation<any>();
  const recorder = useAudioRecorder();
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert metering (-160 to 0 dB) to 0-1 scale
  const volumeLevel = Math.max(0, Math.min(1, (recorder.metering + 60) / 60));

  const handleStartRecording = useCallback(async () => {
    try {
      setError(null);
      await recorder.startRecording();
      setPhase('recording');
    } catch (e: any) {
      setError(e.message);
    }
  }, [recorder]);

  const handleStopRecording = useCallback(async () => {
    try {
      const uri = await recorder.stopRecording();
      if (!uri) {
        setError('No recording found');
        setPhase('idle');
        return;
      }

      // Upload
      setPhase('uploading');
      const createResponse = await api.createSession(uri, 'audio/m4a');

      // Wait for processing
      setPhase('processing');
      const report = await api.waitForCompletion(
        createResponse.session_id,
        (status) => {
          setProcessingStatus(status.status);
        },
      );

      // Navigate to report
      navigation.navigate('Report', { report });
      setPhase('idle');
      recorder.resetRecording();
    } catch (e: any) {
      setError(e.message);
      setPhase('idle');
    }
  }, [recorder, navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SpeakFlow</Text>
        <Text style={styles.subtitle}>
          {phase === 'idle' && 'Tap to start recording'}
          {phase === 'recording' && 'Recording...'}
          {phase === 'uploading' && 'Uploading...'}
          {phase === 'processing' && `Processing: ${processingStatus}`}
        </Text>
      </View>

      {/* HUD (visible during recording) */}
      {phase === 'recording' && (
        <View style={styles.hud}>
          {/* Duration */}
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>Duration</Text>
            <Text style={styles.hudValue}>
              {formatDuration(recorder.state.duration)}
            </Text>
          </View>

          {/* Volume Meter */}
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>Volume</Text>
            <View style={styles.volumeMeterContainer}>
              <View
                style={[
                  styles.volumeMeter,
                  { width: `${volumeLevel * 100}%` },
                  volumeLevel > 0.8 && styles.volumeMeterHigh,
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* Main Button */}
      <View style={styles.buttonContainer}>
        {phase === 'idle' && (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleStartRecording}
          >
            <View style={styles.recordButtonInner} />
          </TouchableOpacity>
        )}

        {phase === 'recording' && (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopRecording}
          >
            <View style={styles.stopButtonInner} />
          </TouchableOpacity>
        )}

        {(phase === 'uploading' || phase === 'processing') && (
          <ActivityIndicator size="large" color="#4A90E2" />
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Tips */}
      {phase === 'idle' && (
        <View style={styles.tips}>
          <Text style={styles.tipText}>
            Speak for 1-5 minutes about any topic.
          </Text>
          <Text style={styles.tipText}>
            We'll analyze your pace, fluency, and vocal variety.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B8B9A',
  },
  hud: {
    backgroundColor: '#252541',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  hudItem: {
    marginBottom: 16,
  },
  hudLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hudValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  volumeMeterContainer: {
    height: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  volumeMeter: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  volumeMeterHigh: {
    backgroundColor: '#FF9800',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E74C3C',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#E74C3C22',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  errorText: {
    color: '#E74C3C',
    textAlign: 'center',
  },
  tips: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  tipText: {
    color: '#8B8B9A',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
});
