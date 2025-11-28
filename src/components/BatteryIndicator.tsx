import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useDerivedValue,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BatteryIndicatorProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function BatteryIndicator({
  percentage,
  size = 200,
  strokeWidth = 12,
}: BatteryIndicatorProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animated values
  const animatedPercentage = useSharedValue(percentage);
  const displayPercentage = useSharedValue(percentage);

  // Update animation when percentage changes
  useEffect(() => {
    animatedPercentage.value = withTiming(percentage, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Animate display percentage for the text
    displayPercentage.value = withTiming(percentage, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [percentage]);

  // Animated props for the progress circle
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedPercentage.value / 100);
    return {
      strokeDashoffset,
    };
  });

  // Get color based on percentage
  const getColor = (pct: number) => {
    if (pct > 50) return '#22C55E'; // Green
    if (pct > 20) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  // Round display percentage for rendering
  const roundedPercentage = useDerivedValue(() => {
    return Math.round(displayPercentage.value);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BATTERY</Text>
      
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
          
          {/* Progress ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={getColor(percentage)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
        
        {/* Center text */}
        <View style={styles.centerContent}>
          <AnimatedPercentageText 
            percentage={displayPercentage} 
            color={getColor(percentage)}
          />
          <Text style={styles.percentSymbol}>%</Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: getColor(percentage) }]} />
        <Text style={styles.statusText}>
          {percentage > 50 ? 'Good' : percentage > 20 ? 'Low' : 'Critical'}
        </Text>
      </View>
    </View>
  );
}

// Separate component for animated percentage text
interface AnimatedPercentageTextProps {
  percentage: SharedValue<number>;
  color: string;
}

function AnimatedPercentageText({ percentage, color }: AnimatedPercentageTextProps) {
  const [displayValue, setDisplayValue] = React.useState(Math.round(percentage.value));
  
  useDerivedValue(() => {
    const rounded = Math.round(percentage.value);
    runOnJS(setDisplayValue)(rounded);
    return rounded;
  });

  return (
    <Text style={[styles.percentageText, { color }]}>
      {displayValue}
    </Text>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
