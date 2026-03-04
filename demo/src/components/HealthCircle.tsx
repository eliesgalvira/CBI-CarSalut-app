import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { T, healthColor } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HealthCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function HealthCircle({
  percentage,
  size = 230,
  strokeWidth = 14,
  label = 'CONDITION',
}: HealthCircleProps) {
  const progress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    progress.value = withTiming(Math.min(100, Math.max(0, percentage)) / 100, {
      duration: 1200,
      easing: Easing.bezierFn(0.22, 1, 0.36, 1),
    });
  }, [percentage, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const color = healthColor(percentage);
  const dashArray = `${circumference} ${circumference}`;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.ring, { width: size, height: size }]}>
        {/* Glow backing */}
        <View style={[styles.glowOuter, { width: size + 24, height: size + 24, borderRadius: (size + 24) / 2, shadowColor: color }]} />

        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity={1} />
              <Stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </LinearGradient>
          </Defs>

          {/* Track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={T.bgElevated}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#hg)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={dashArray}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.center}>
          <Text style={[styles.pct, { color }]}>{Math.round(percentage)}</Text>
          <Text style={[styles.pctSign, { color }]}>%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  label: {
    color: T.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pct: {
    fontSize: 56,
    fontWeight: '200',
    letterSpacing: -2,
  },
  pctSign: {
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 10,
    marginLeft: 2,
  },
});
