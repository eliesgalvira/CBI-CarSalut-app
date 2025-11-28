import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BatteryIndicatorProps {
  percentage: number | null;
  lastUpdated: Date | null;
  size?: number;
  strokeWidth?: number;
}

// Get color based on percentage with new thresholds:
// 100%-21%: Green (normal)
// 20%-15%: Amber (warning)
// Below 15%: Red (critical)
const getColor = (pct: number) => {
  if (pct > 20) return '#22C55E'; // Green
  if (pct >= 15) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
};

const getStatusText = (pct: number) => {
  if (pct > 20) return null; // No status text for normal
  if (pct >= 15) return 'Low Battery';
  return 'Replace Battery';
};

export function BatteryIndicator({
  percentage,
  lastUpdated,
  size = 200,
  strokeWidth = 12,
}: BatteryIndicatorProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Format date to full date with seconds
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // State for displaying the animated percentage text
  const [displayValue, setDisplayValue] = useState<number>(percentage ?? 0);

  // Animated values - initialize with percentage or 0
  const animatedPercentage = useSharedValue(percentage ?? 0);

  // Update animation when percentage changes
  useEffect(() => {
    if (percentage !== null) {
      animatedPercentage.value = withTiming(percentage, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [percentage, animatedPercentage]);

  // Derived value to update display text - this runs on UI thread and calls back to JS
  useDerivedValue(() => {
    const rounded = Math.round(animatedPercentage.value);
    runOnJS(setDisplayValue)(rounded);
    return rounded;
  });

  // Animated props for the progress circle
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedPercentage.value / 100);
    return {
      strokeDashoffset,
    };
  });

  // Show "connect for first time" message if no percentage received yet
  if (percentage === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>BATTERY</Text>
        
        <View style={[styles.ringContainer, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            {/* Background ring only */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
          
          {/* Center text */}
          <View style={styles.centerContent}>
            <Text style={styles.noDataText}>—</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={styles.connectText}>Connect to device to view battery level</Text>
        </View>
      </View>
    );
  }

  const color = getColor(percentage);
  const statusText = getStatusText(percentage);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color }]}>BATTERY</Text>
      
      <View style={[styles.ringContainer, { width: size, height: size }]}>
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
          
          {/* Progress ring - clockwise from top */}
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
        </Svg>
        
        {/* Center text */}
        <View style={styles.centerContent}>
          <Text style={[styles.percentageText, { color }]}>
            {displayValue}
          </Text>
          <Text style={styles.percentSymbol}>%</Text>
        </View>
      </View>
      
      {statusText && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>
            {statusText}
          </Text>
        </View>
      )}
      
      {/* Last Updated */}
      <View style={styles.lastUpdatedContainer}>
        <Text style={styles.lastUpdatedLabel}>LAST UPDATED</Text>
        <Text style={styles.lastUpdatedValue}>
          {lastUpdated ? formatDateTime(lastUpdated) : '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 4,
    marginBottom: 24,
  },
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  centerContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentageText: {
    fontSize: 56,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  percentSymbol: {
    fontSize: 24,
    fontWeight: '300',
    color: '#64748b',
    marginLeft: 2,
  },
  noDataText: {
    fontSize: 56,
    fontWeight: '300',
    color: '#475569',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
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
  lastUpdatedContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  lastUpdatedLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 4,
  },
  lastUpdatedValue: {
    fontSize: 14,
    color: '#94a3b8',
    fontVariant: ['tabular-nums'],
  },
});
