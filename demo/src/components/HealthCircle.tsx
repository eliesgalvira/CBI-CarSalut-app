import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HealthCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  lastSync?: string;
  showCar?: boolean;
}

export function HealthCircle({
  percentage,
  size = 220,
  strokeWidth = 12,
  lastSync,
  showCar = true,
}: HealthCircleProps) {
  const progress = useSharedValue(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    progress.value = withTiming(percentage / 100, {
      duration: 1000,
      easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
    });
  }, [percentage, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 70) return '#22C55E'; // Green
    if (percentage >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={getColor()} />
            <Stop offset="100%" stopColor={getColor()} stopOpacity={0.8} />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#healthGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      
      {/* Content inside circle */}
      <View style={styles.content}>
        <Text style={styles.conditionLabel}>CONDITION</Text>
        
        {showCar && (
          <View style={styles.carPlaceholder}>
            <Text style={styles.carEmoji}>🚗</Text>
          </View>
        )}
        
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageValue}>{Math.round(percentage)}</Text>
          <Text style={styles.percentageSymbol}>%</Text>
        </View>
        
        {lastSync && (
          <View style={styles.syncContainer}>
            <Text style={styles.syncLabel}>LAST SYNC:</Text>
            <Text style={styles.syncDate}>{lastSync}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionLabel: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 4,
  },
  carPlaceholder: {
    marginVertical: 8,
  },
  carEmoji: {
    fontSize: 48,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  percentageValue: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '200',
  },
  percentageSymbol: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '200',
    marginTop: 8,
  },
  syncContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  syncLabel: {
    color: '#64748b',
    fontSize: 10,
    letterSpacing: 1,
  },
  syncDate: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
});
