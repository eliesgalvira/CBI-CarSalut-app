import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Gauge types with their specialized displays
export type GaugeType = 'rpm' | 'speed' | 'temperature' | 'percentage';

interface OBDGaugeProps {
  value: number | null;
  type: GaugeType;
  size?: number;
  label: string;
  unit: string;
  min?: number;
  max?: number;
  warningThreshold?: number;
  dangerThreshold?: number;
}

// Color scheme based on value ranges
const getColor = (value: number, max: number, warning?: number, danger?: number): string => {
  if (danger !== undefined && value >= danger) return '#EF4444'; // Red
  if (warning !== undefined && value >= warning) return '#F59E0B'; // Amber
  return '#22C55E'; // Green
};

// Gauge config type
interface GaugeConfig {
  min: number;
  max: number;
  warning: number;
  danger: number;
  redlineStart?: number;
}

// Get gauge config based on type
const getGaugeConfig = (type: GaugeType): GaugeConfig => {
  switch (type) {
    case 'rpm':
      return { min: 0, max: 8000, warning: 5500, danger: 7000, redlineStart: 6500 };
    case 'speed':
      return { min: 0, max: 200, warning: 120, danger: 160 };
    case 'temperature':
      return { min: -40, max: 120, warning: 95, danger: 105 };
    case 'percentage':
      return { min: 0, max: 100, warning: 80, danger: 95 };
  }
};

// Create semicircular arc path
const createArcPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

// Generate tick marks for the gauge
const generateTicks = (
  cx: number,
  cy: number,
  radius: number,
  min: number,
  max: number,
  majorCount: number,
  type: GaugeType
) => {
  const ticks = [];
  const startAngle = 135; // Start from bottom-left
  const endAngle = 405; // End at bottom-right (270 degree sweep)
  const angleRange = endAngle - startAngle;
  
  for (let i = 0; i <= majorCount; i++) {
    const value = min + ((max - min) * i) / majorCount;
    const angle = startAngle + (angleRange * i) / majorCount;
    
    const innerRadius = radius - 10;
    const outerRadius = radius;
    const labelRadius = radius - 22;
    
    const inner = polarToCartesian(cx, cy, innerRadius, angle);
    const outer = polarToCartesian(cx, cy, outerRadius, angle);
    const labelPos = polarToCartesian(cx, cy, labelRadius, angle);
    
    // Determine tick color based on type and value
    let tickColor = '#475569';
    if (type === 'rpm') {
      const config = getGaugeConfig('rpm');
      if (config.redlineStart !== undefined && value >= config.redlineStart) {
        tickColor = '#EF4444';
      }
    }
    
    // Format label based on type
    let label = '';
    if (type === 'rpm') {
      label = (value / 1000).toString();
    } else if (type === 'speed') {
      label = value.toString();
    } else if (type === 'temperature') {
      if (i % 2 === 0) label = value.toString();
    } else {
      if (i % 2 === 0) label = value.toString();
    }
    
    ticks.push({
      key: i,
      x1: inner.x,
      y1: inner.y,
      x2: outer.x,
      y2: outer.y,
      labelX: labelPos.x,
      labelY: labelPos.y,
      label,
      color: tickColor,
    });
  }
  
  return ticks;
};

export function OBDGauge({
  value,
  type,
  size = 150,
  label,
  unit,
  min: customMin,
  max: customMax,
  warningThreshold: customWarning,
  dangerThreshold: customDanger,
}: OBDGaugeProps) {
  const config = getGaugeConfig(type);
  const min = customMin ?? config.min;
  const max = customMax ?? config.max;
  const warning = customWarning ?? config.warning;
  const danger = customDanger ?? config.danger;
  
  const cx = size / 2;
  const cy = size / 2 + 10; // Offset down slightly for semicircle
  const radius = (size - 40) / 2;
  const strokeWidth = 8;
  
  const startAngle = 135;
  const endAngle = 405;
  const angleRange = endAngle - startAngle;
  
  // Create background arc path
  const backgroundPath = createArcPath(cx, cy, radius, startAngle, endAngle);
  
  // Animation
  const [displayValue, setDisplayValue] = useState<number>(value ?? 0);
  const animatedValue = useSharedValue(value ?? 0);
  
  useEffect(() => {
    if (value !== null) {
      animatedValue.value = withTiming(value, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [value, animatedValue]);
  
  useDerivedValue(() => {
    const rounded = type === 'percentage' 
      ? Math.round(animatedValue.value * 10) / 10
      : Math.round(animatedValue.value);
    runOnJS(setDisplayValue)(rounded);
    return rounded;
  });
  
  // Calculate arc length for progress
  const circumference = 2 * Math.PI * radius * (angleRange / 360);
  
  const animatedProps = useAnimatedProps(() => {
    const clampedValue = Math.max(min, Math.min(max, animatedValue.value));
    const progress = (clampedValue - min) / (max - min);
    const strokeDashoffset = circumference * (1 - progress);
    return {
      strokeDashoffset,
    };
  });
  
  // Generate tick marks
  const majorTickCount = type === 'rpm' ? 8 : type === 'speed' ? 10 : 8;
  const ticks = generateTicks(cx, cy, radius, min, max, majorTickCount, type);
  
  // Get color for current value
  const color = value !== null ? getColor(value, max, warning, danger) : '#475569';
  
  // Format display value
  const formatValue = (val: number): string => {
    if (type === 'rpm') return Math.round(val).toString();
    if (type === 'percentage') return val.toFixed(1);
    return Math.round(val).toString();
  };
  
  if (value === null) {
    return (
      <View style={[styles.container, { width: size, height: size + 30 }]}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.gaugeContainer, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <G>
              {/* Background arc */}
              <Path
                d={backgroundPath}
                stroke="#1E293B"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
              {/* Tick marks */}
              {ticks.map((tick) => (
                <Line
                  key={tick.key}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke="#334155"
                  strokeWidth={1.5}
                />
              ))}
            </G>
          </Svg>
          <View style={[styles.valueContainer, { top: cy - 15 }]}>
            <Text style={styles.noDataText}>—</Text>
            <Text style={styles.unit}>{unit}</Text>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { width: size, height: size + 30 }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={[styles.gaugeContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G>
            {/* Background arc */}
            <Path
              d={backgroundPath}
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Redline zone for RPM */}
            {type === 'rpm' && config.redlineStart !== undefined && (
              <Path
                d={createArcPath(
                  cx,
                  cy,
                  radius,
                  startAngle + (angleRange * (config.redlineStart - min)) / (max - min),
                  endAngle
                )}
                stroke="rgba(239, 68, 68, 0.3)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            )}
            
            {/* Progress arc */}
            <AnimatedPath
              d={backgroundPath}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
            />
            
            {/* Tick marks */}
            {ticks.map((tick) => (
              <G key={tick.key}>
                <Line
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={tick.color}
                  strokeWidth={1.5}
                />
              </G>
            ))}
          </G>
        </Svg>
        
        {/* Value display */}
        <View style={[styles.valueContainer, { top: cy - 15 }]}>
          <Text style={[styles.valueText, { color }]}>{formatValue(displayValue)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    alignItems: 'center',
    left: 0,
    right: 0,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  noDataText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#475569',
  },
  unit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
});
