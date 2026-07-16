import { brandColors } from '@/brand/brand';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Mark } from './Mark';

// The mark waves by rotating each plane out to WAVE_DEG and back, WAVE_COUNT
// times — like a hand wave from the plane tips. Left plane goes counter-
// clockwise (negative), right plane clockwise (positive).
const WAVE_DEG = -10;
const WAVE_COUNT = 3;
const HALF_MS = 320; // one half of a wave (out, or back)
const MARK_SIZE = 176; // matches the native splash image width (~200px wide)

/**
 * Animated splash overlay. Shown on top of the app at launch, it mimics the
 * static native splash (same mark, cream background), plays the plane wave,
 * then fades out to reveal the app. `onFinish` unmounts it. The OS native
 * splash itself is a static PNG and can't animate — this seamlessly takes over
 * from it (we hide the native one the moment this mounts).
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  // Lazy useState (not useRef) so the Animated values are stable across renders
  // without reading a ref during render.
  const [wave] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(1));

  const leftRotation = wave.interpolate({ inputRange: [0, 1], outputRange: [0, -WAVE_DEG] });
  const rightRotation = wave.interpolate({ inputRange: [0, 1], outputRange: [0, WAVE_DEG] });

  useEffect(() => {
    // Hand off from the OS splash to this animated one.
    SplashScreen.hideAsync().catch(() => {});

    const oneWave = Animated.sequence([
      Animated.timing(wave, {
        toValue: 1,
        duration: HALF_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(wave, {
        toValue: 0,
        duration: HALF_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]);

    const anim = Animated.sequence([
      Animated.delay(200),
      Animated.loop(oneWave, { iterations: WAVE_COUNT }),
      Animated.delay(120),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onFinish();
    };

    anim.start(({ finished }) => {
      if (finished) finish();
    });

    // Safety: never leave the overlay stuck if the animation is interrupted.
    const fallback = setTimeout(finish, 4500);

    return () => {
      clearTimeout(fallback);
      anim.stop();
    };
  }, [wave, opacity, onFinish]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.fill, { opacity }]}>
      <Mark
        size={MARK_SIZE}
        planeColor={brandColors.green}
        leftRotation={leftRotation}
        rightRotation={rightRotation}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.cream,
  },
});
