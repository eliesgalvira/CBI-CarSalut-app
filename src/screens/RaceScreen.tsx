import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useNFC } from '../hooks/useNFC';
import { useChronometer } from '../hooks/useChronometer';
import { ActionButton } from '../components';
import { RCCarProfile } from '../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ========== HARDCODED RC CAR PROFILES ==========
// Profile "1" - Casual mode (low strain)
// Profile "2" - Sport mode (medium strain)
// Profile "3" - Extreme mode (high strain)

const RC_CAR_PROFILES: Record<string, RCCarProfile> = {
  '1': {
    id: '1',
    name: 'Casual Cruiser',
    avgSpeed: 25,
    maxSpeed: 35,
    avgRPM: 4500,
    maxRPM: 6000,
    batteryDrain: 15,
    motorTemp: 45,
    tireWear: 10,
    bestLapTime: 28.5,
    strainFactor: 20, // Low strain = high health (80%)
  },
  '2': {
    id: '2',
    name: 'Sport Runner',
    avgSpeed: 45,
    maxSpeed: 60,
    avgRPM: 7500,
    maxRPM: 9000,
    batteryDrain: 35,
    motorTemp: 65,
    tireWear: 35,
    bestLapTime: 18.2,
    strainFactor: 45, // Medium strain = medium health (55%)
  },
  '3': {
    id: '3',
    name: 'Extreme Racer',
    avgSpeed: 70,
    maxSpeed: 95,
    avgRPM: 11000,
    maxRPM: 14000,
    batteryDrain: 65,
    motorTemp: 85,
    tireWear: 70,
    bestLapTime: 12.8,
    strainFactor: 75, // High strain = low health (25%)
  },
};

type RacePhase = 'idle' | 'synced' | 'racing' | 'finished';

export function RaceScreen() {
  const insets = useSafeAreaInsets();
  const nfc = useNFC();
  const chrono = useChronometer();

  const [phase, setPhase] = useState<RacePhase>('idle');
  const [loadedProfile, setLoadedProfile] = useState<RCCarProfile | null>(null);
  const [finalTime, setFinalTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Health is calculated as 100 - strainFactor
  const healthPercentage = loadedProfile ? 100 - loadedProfile.strainFactor : null;

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    const message = await nfc.readTag();
    
    if (message && RC_CAR_PROFILES[message.trim()]) {
      const profile = RC_CAR_PROFILES[message.trim()];
      setLoadedProfile(profile);
      setPhase('synced');
    } else if (message) {
      // Tag was read but message doesn't match a profile
      nfc.reset();
    }
    setIsSyncing(false);
  }, [nfc]);

  const handleStart = useCallback(() => {
    setPhase('racing');
    chrono.start();
  }, [chrono]);

  const handleStop = useCallback(() => {
    chrono.stop();
    setFinalTime(chrono.formattedTime);
    setPhase('finished');
  }, [chrono]);

  const handleReset = useCallback(() => {
    chrono.reset();
    setLoadedProfile(null);
    setFinalTime('');
    setPhase('idle');
    nfc.reset();
  }, [chrono, nfc]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Background decoration */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundCircle} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>🏁 RC Race</Text>
        <Text style={styles.appSubtitle}>
          {phase === 'idle' && 'Sync your car tag to begin'}
          {phase === 'synced' && `${loadedProfile?.name} loaded`}
          {phase === 'racing' && 'Race in progress!'}
          {phase === 'finished' && 'Race complete!'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Health Bar */}
        <HealthIndicator
          percentage={phase === 'finished' ? healthPercentage : null}
          label={phase === 'finished' ? 'CAR HEALTH' : 'CAR HEALTH'}
        />

        {/* Chronometer Display */}
        {(phase === 'racing' || phase === 'finished') && (
          <View style={styles.chronoContainer}>
            <Text style={styles.chronoLabel}>TIME</Text>
            <Text style={styles.chronoTime}>
              {phase === 'finished' ? finalTime : chrono.formattedTime}
            </Text>
          </View>
        )}

        {/* Profile Stats - Only shown after race finishes */}
        {phase === 'finished' && loadedProfile && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>RACE STATS</Text>
            <View style={styles.statsGrid}>
              <StatItem label="Avg Speed" value={`${loadedProfile.avgSpeed} km/h`} />
              <StatItem label="Max Speed" value={`${loadedProfile.maxSpeed} km/h`} />
              <StatItem label="Avg RPM" value={loadedProfile.avgRPM.toLocaleString()} />
              <StatItem label="Max RPM" value={loadedProfile.maxRPM.toLocaleString()} />
              <StatItem label="Battery Used" value={`${loadedProfile.batteryDrain}%`} />
              <StatItem label="Motor Temp" value={`${loadedProfile.motorTemp}°C`} />
              <StatItem label="Tire Wear" value={`${loadedProfile.tireWear}%`} />
              <StatItem label="Best Lap" value={`${loadedProfile.bestLapTime}s`} />
            </View>
          </View>
        )}

        {/* Error Display */}
        {nfc.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{nfc.error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {phase === 'idle' && (
          <ActionButton
            label={isSyncing ? 'Syncing...' : 'Sync Car Tag'}
            onPress={handleSync}
            variant="primary"
            loading={isSyncing}
            disabled={!nfc.isSupported || !nfc.isEnabled || isSyncing}
          />
        )}

        {phase === 'synced' && (
          <ActionButton
            label="Start Race"
            onPress={handleStart}
            variant="primary"
          />
        )}

        {phase === 'racing' && (
          <ActionButton
            label="Stop"
            onPress={handleStop}
            variant="danger"
          />
        )}

        {phase === 'finished' && (
          <ActionButton
            label="New Race"
            onPress={handleReset}
            variant="secondary"
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {!nfc.isSupported && 'NFC not supported on this device'}
          {nfc.isSupported && !nfc.isEnabled && 'Please enable NFC in settings'}
          {nfc.isSupported && nfc.isEnabled && phase === 'idle' && 'Tap your NFC tag to sync'}
        </Text>
      </View>
    </View>
  );
}

// ========== Health Indicator Component ==========

interface HealthIndicatorProps {
  percentage: number | null;
  label: string;
  size?: number;
  strokeWidth?: number;
}

function HealthIndicator({
  percentage,
  label,
  size = 180,
  strokeWidth = 12,
}: HealthIndicatorProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animatedPercentage = useSharedValue(0);

  React.useEffect(() => {
    if (percentage !== null) {
      animatedPercentage.value = withTiming(percentage, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      animatedPercentage.value = 0;
    }
  }, [percentage, animatedPercentage]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedPercentage.value / 100);
    return { strokeDashoffset };
  });

  const getColor = (pct: number | null) => {
    if (pct === null) return '#1E293B';
    if (pct >= 60) return '#22C55E'; // Green - good health
    if (pct >= 35) return '#F59E0B'; // Amber - moderate strain
    return '#EF4444'; // Red - high strain
  };

  const getStatusText = (pct: number | null): string | null => {
    if (pct === null) return null;
    if (pct >= 60) return 'Car in great condition';
    if (pct >= 35) return 'Moderate wear detected';
    return 'High strain - check your car!';
  };

  const color = getColor(percentage);
  const statusText = getStatusText(percentage);

  return (
    <View style={healthStyles.container}>
      <Text style={[healthStyles.title, { color: percentage !== null ? color : '#64748b' }]}>
        {label}
      </Text>

      <View style={[healthStyles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress ring */}
          {percentage !== null && (
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              animatedProps={animatedCircleProps}
              strokeLinecap="round"
              rotation="90"
              origin={`${center}, ${center}`}
              scaleX={-1}
            />
          )}
        </Svg>

        {/* Center text */}
        <View style={healthStyles.centerContent}>
          {percentage !== null ? (
            <>
              <Text style={[healthStyles.percentageText, { color }]}>
                {Math.round(percentage)}
              </Text>
              <Text style={healthStyles.percentSymbol}>%</Text>
            </>
          ) : (
            <Text style={healthStyles.noDataText}>—</Text>
          )}
        </View>
      </View>

      {/* Status text */}
      <View style={healthStyles.statusContainer}>
        {statusText ? (
          <>
            <View style={[healthStyles.statusDot, { backgroundColor: color }]} />
            <Text style={[healthStyles.statusText, { color }]}>{statusText}</Text>
          </>
        ) : (
          <Text style={healthStyles.connectText}>Complete a race to see health</Text>
        )}
      </View>
    </View>
  );
}

// ========== Stat Item Component ==========

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={statsStyles.item}>
      <Text style={statsStyles.label}>{label}</Text>
      <Text style={statsStyles.value}>{value}</Text>
    </View>
  );
}

// ========== Styles ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
  backgroundCircle: {
    position: 'absolute',
    top: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  chronoContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chronoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 8,
  },
  chronoTime: {
    fontSize: 48,
    fontWeight: '300',
    color: '#f8fafc',
    fontVariant: ['tabular-nums'],
  },
  statsContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

const healthStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 20,
  },
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  centerContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  percentSymbol: {
    fontSize: 20,
    fontWeight: '300',
    color: '#64748b',
    marginLeft: 2,
  },
  noDataText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#475569',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

const statsStyles = StyleSheet.create({
  item: {
    width: '47%',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
});
