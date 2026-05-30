import { useEffect, useRef } from 'react';
import { useGestureStore } from '../store/gestureStore';
import { CursorSmoother } from '../utils/smoothing';
import { classifyGesture } from '../utils/gestureEngine';
import type { ActiveGesture } from '../types/gesture';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const smootherRef = useRef<CursorSmoother>(new CursorSmoother('kalman'));
  
  // Get Zustand actions and state
  const {
    settings,
    setCursorPos,
    setRawCursorPos,
    setHandDetected,
    setCurrentGesture,
    addHistoryEntry,
    updateDiagnostics,
    volumeLevel,
    brightnessLevel,
    setVolumeLevel,
    setBrightnessLevel,
    isModalOpen,
    setContextMenuOpen,
    setContextMenuPos,
    scrollPosition,
    setScrollPosition
  } = useGestureStore();

  // Keep references to state values to avoid recreating closures in loops
  const settingsRef = useRef(settings);
  const volumeLevelRef = useRef(volumeLevel);
  const brightnessLevelRef = useRef(brightnessLevel);
  const isModalOpenRef = useRef(isModalOpen);
  const scrollPosRef = useRef(scrollPosition);

  useEffect(() => {
    settingsRef.current = settings;
    // Update smoother settings in real-time
    if (settings.smoothingFilter === 'kalman') {
      smootherRef.current.setType('kalman', {
        processNoise: settings.kalmanProcessNoise,
        measurementNoise: settings.kalmanMeasurementNoise
      });
    } else if (settings.smoothingFilter === 'exponential') {
      smootherRef.current.setType('exponential', {
        emaAlpha: settings.emaSmoothingFactor
      });
    } else {
      smootherRef.current.setType('moving_average', {
        windowSize: settings.movingAverageWindow
      });
    }
  }, [settings]);

  useEffect(() => {
    volumeLevelRef.current = volumeLevel;
    brightnessLevelRef.current = brightnessLevel;
    isModalOpenRef.current = isModalOpen;
    scrollPosRef.current = scrollPosition;
  }, [volumeLevel, brightnessLevel, isModalOpen, scrollPosition]);

  useEffect(() => {
    // Multi-frame validation counters
    let gestureBuffer: ActiveGesture[] = [];
    const BUFFER_SIZE = 2; // 2-frame validation delay
    let clickCooldown = false;
    let rightClickCooldown = false;
    let doubleClickCooldown = false;
    let dragActive = false;
    let lastScrollY: number | null = null;
    let initialSliderDist: number | null = null;
    let initialSliderVolume: number = 50;
    let initialSliderBrightness: number = 50;

    // Telemetry variables
    let frameCount = 0;
    let trackingFrameCount = 0;
    let lastFpsUpdateTime = performance.now();
    let lastTrackingUpdateTime = performance.now();

    // Regular UI FPS update loop
    let fpsAnimationId: number;
    const updateFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastFpsUpdateTime >= 1000) {
        updateDiagnostics({ fps: frameCount });
        frameCount = 0;
        lastFpsUpdateTime = now;
      }
      fpsAnimationId = requestAnimationFrame(updateFps);
    };
    fpsAnimationId = requestAnimationFrame(updateFps);

    // Initialize hidden video element
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    video.style.display = 'none';
    video.style.position = 'absolute';
    video.style.left = '-9999px';
    video.setAttribute('playsinline', '');
    document.body.appendChild(video);
    videoRef.current = video;

    const startMediaPipe = () => {
      if (!(window as any).Hands) {
        console.error('MediaPipe Hands is not loaded from CDN yet.');
        return;
      }

      // Initialize MediaPipe Hands
      const hands = new (window as any).Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: settingsRef.current.minDetectionConfidence,
        minTrackingConfidence: 0.5
      });

      handsRef.current = hands;

      // Handle raw hand tracking frames
      hands.onResults((results: any) => {
        const startTime = performance.now();

        // 1. Telemetry: Tracking FPS
        trackingFrameCount++;
        const now = performance.now();
        if (now - lastTrackingUpdateTime >= 1000) {
          updateDiagnostics({ trackingFps: trackingFrameCount });
          trackingFrameCount = 0;
          lastTrackingUpdateTime = now;
        }

        // 2. Telemetry: Hand Detection Check
        const hasHand = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
        setHandDetected(hasHand);

        if (!hasHand) {
          setCurrentGesture('None');
          smootherRef.current.reset();
          lastScrollY = null;
          initialSliderDist = null;
          if (dragActive) {
            dragActive = false;
            addHistoryEntry('None', 'Hand lost: Dropped drag item');
          }
          updateDiagnostics({
            confidenceScore: 0,
            handsDetectedCount: 0,
            latency: Math.round(performance.now() - startTime)
          });
          return;
        }

        // 3. Extract Index Finger Tip for pointer mapping
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8]; // Index finger tip
        const indexMcp = landmarks[5]; // Hand base point for cursor scrolling

        // Flipped X coordinate (mirror representation)
        const rawX = 1 - indexTip.x;
        const rawY = indexTip.y;

        // Bounding box map (0.25 to 0.75) to make it easier to reach screen edges
        const xMin = 0.22;
        const xMax = 0.78;
        const yMin = 0.20;
        const yMax = 0.75;

        let scaledX = (rawX - xMin) / (xMax - xMin);
        let scaledY = (rawY - yMin) / (yMax - yMin);

        // Clamp values between 0 and 1
        scaledX = Math.max(0, Math.min(1, scaledX));
        scaledY = Math.max(0, Math.min(1, scaledY));

        // Screen space targets
        const screenX = scaledX * window.innerWidth;
        const screenY = scaledY * window.innerHeight;

        setRawCursorPos({ x: screenX, y: screenY });

        // Apply selected mathematical motion filter
        const smoothed = smootherRef.current.smooth(screenX, screenY);
        setCursorPos(smoothed);

        // 4. Classify gesture
        const classification = classifyGesture(landmarks, settingsRef.current);
        const rawGesture = classification.gesture;

        // 5. Smart Gesture Validation: Multi-frame buffer
        gestureBuffer.push(rawGesture);
        if (gestureBuffer.length > BUFFER_SIZE) {
          gestureBuffer.shift();
        }

        // Check if all elements in the buffer match the current gesture
        const validatedGesture = gestureBuffer.every((g) => g === rawGesture)
          ? rawGesture
          : gestureBuffer[gestureBuffer.length - 1] || 'None';

        setCurrentGesture(validatedGesture);

        // 6. Execute actions based on validated gesture
        const currentVolume = volumeLevelRef.current;
        const currentBrightness = brightnessLevelRef.current;

        switch (validatedGesture) {
          case 'Left Click':
            if (!clickCooldown) {
              clickCooldown = true;
              addHistoryEntry('Left Click', 'Left click executed');
              triggerSimulatedClick(smoothed.x, smoothed.y);
              setTimeout(() => {
                clickCooldown = false;
              }, 400); // 400ms click cooldown
            }
            break;

          case 'Right Click':
            if (!rightClickCooldown) {
              rightClickCooldown = true;
              addHistoryEntry('Right Click', 'Right click context menu opened');
              setContextMenuPos(smoothed);
              setContextMenuOpen(true);
              setTimeout(() => {
                rightClickCooldown = false;
              }, 600); // 600ms right click cooldown
            }
            break;

          case 'Double Click':
            if (!doubleClickCooldown) {
              doubleClickCooldown = true;
              addHistoryEntry('Double Click', 'Double click executed');
              triggerSimulatedDoubleClick(smoothed.x, smoothed.y);
              setTimeout(() => {
                doubleClickCooldown = false;
              }, 600);
            }
            break;

          case 'Drag':
            if (!dragActive) {
              dragActive = true;
              addHistoryEntry('Drag', 'Grabbed drag box');
              triggerSimulatedDragStart(smoothed.x, smoothed.y);
            } else {
              triggerSimulatedDragMove(smoothed.x, smoothed.y);
            }
            break;

          case 'Scroll':
            // Reset drag if moving into scroll
            if (dragActive) {
              dragActive = false;
              triggerSimulatedDragEnd(smoothed.x, smoothed.y);
            }
            const currentY = indexMcp.y;
            if (lastScrollY !== null) {
              const deltaY = currentY - lastScrollY;
              // Amplify scroll delta
              const scrollSpeedMultiplier = 900;
              const scrollDelta = deltaY * scrollSpeedMultiplier;
              
              if (Math.abs(scrollDelta) > 5) {
                const scrollPane = document.getElementById('playground-scroll-pane');
                if (scrollPane) {
                  const newScrollPos = scrollPosRef.current + scrollDelta;
                  scrollPane.scrollTop = newScrollPos;
                  setScrollPosition(scrollPane.scrollTop);
                }
              }
            }
            lastScrollY = currentY;
            break;

          case 'Volume Up':
            // Slider mode handles distance adjustments.
            // Let's check which slider we are hovering.
            const hoverSlider = getHoveredSliderElement(smoothed.x, smoothed.y);
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const currentDist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));

            if (hoverSlider === 'volume') {
              if (initialSliderDist === null) {
                initialSliderDist = currentDist;
                initialSliderVolume = currentVolume;
              } else {
                const distDelta = currentDist - initialSliderDist;
                // Scale delta (distance goes from roughly 0.05 to 0.20)
                const volumeChange = distDelta * 400; // Multiplier
                setVolumeLevel(initialSliderVolume + volumeChange);
              }
            } else if (hoverSlider === 'brightness') {
              if (initialSliderDist === null) {
                initialSliderDist = currentDist;
                initialSliderBrightness = currentBrightness;
              } else {
                const distDelta = currentDist - initialSliderDist;
                const brightnessChange = distDelta * 400;
                setBrightnessLevel(initialSliderBrightness + brightnessChange);
              }
            }
            break;

          default:
            // Release drag if gesture transitioned away
            if (dragActive) {
              dragActive = false;
              addHistoryEntry('None', 'Dropped drag box');
              triggerSimulatedDragEnd(smoothed.x, smoothed.y);
            }
            lastScrollY = null;
            initialSliderDist = null;
            break;
        }

        // 7. Telemetry: Latency and Confidence
        const totalDuration = performance.now() - startTime;
        updateDiagnostics({
          confidenceScore: results.multiHandedness[0]?.score || 0.9,
          handsDetectedCount: 1,
          latency: Math.round(totalDuration)
        });
      });

      // Start webcam grabber
      if ((window as any).Camera) {
        const camera = new (window as any).Camera(video, {
          onFrame: async () => {
            if (handsRef.current) {
              await handsRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
        cameraRef.current = camera;
        updateDiagnostics({ webglAccelerated: true });
      } else {
        console.error('Camera helper is not loaded from CDN yet.');
      }
    };

    // Delay initialization slightly to let the scripts load completely if dynamic
    const initTimeout = setTimeout(startMediaPipe, 800);

    return () => {
      clearTimeout(initTimeout);
      cancelAnimationFrame(fpsAnimationId);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
    };
  }, []);

  return {
    smoother: smootherRef.current
  };
}

/**
 * Checks which slider (if any) the user's cursor is currently hovering.
 */
function getHoveredSliderElement(x: number, y: number): 'volume' | 'brightness' | null {
  const elements = document.elementsFromPoint(x, y);
  for (const element of elements) {
    if (element.id === 'volume-slider-container' || element.closest('#volume-slider-container')) {
      return 'volume';
    }
    if (element.id === 'brightness-slider-container' || element.closest('#brightness-slider-container')) {
      return 'brightness';
    }
  }
  return null;
}

/**
 * Triggers a DOM mouse click event at the specific absolute viewport coordinates.
 */
function triggerSimulatedClick(x: number, y: number) {
  const element = document.elementFromPoint(x, y) as HTMLElement;
  if (!element) return;

  // Visual tap feedback
  const tapEffect = document.createElement('div');
  tapEffect.style.position = 'absolute';
  tapEffect.style.left = `${x - 20}px`;
  tapEffect.style.top = `${y - 20}px`;
  tapEffect.style.width = '40px';
  tapEffect.style.height = '40px';
  tapEffect.style.borderRadius = '50%';
  tapEffect.style.border = '2px solid #06b6d4';
  tapEffect.style.backgroundColor = 'rgba(6, 182, 212, 0.15)';
  tapEffect.style.pointerEvents = 'none';
  tapEffect.style.zIndex = '99999';
  tapEffect.style.transform = 'scale(0.5)';
  tapEffect.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
  
  document.body.appendChild(tapEffect);
  
  // Force reflow
  tapEffect.getBoundingClientRect();
  tapEffect.style.transform = 'scale(1.5)';
  tapEffect.style.opacity = '0';
  
  setTimeout(() => {
    if (tapEffect.parentNode) {
      tapEffect.parentNode.removeChild(tapEffect);
    }
  }, 300);

  // Dispatch standard events
  const mouseEvent = new MouseEvent('click', {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(mouseEvent);
  
  if (element.focus) {
    element.focus();
  }
}

/**
 * Triggers a simulated double click.
 */
function triggerSimulatedDoubleClick(x: number, y: number) {
  const element = document.elementFromPoint(x, y) as HTMLElement;
  if (!element) return;

  // Dual ring ripple feedback
  const ripple = document.createElement('div');
  ripple.style.position = 'absolute';
  ripple.style.left = `${x - 25}px`;
  ripple.style.top = `${y - 25}px`;
  ripple.style.width = '50px';
  ripple.style.height = '50px';
  ripple.style.borderRadius = '50%';
  ripple.style.border = '3px double #ec4899';
  ripple.style.backgroundColor = 'rgba(236, 72, 153, 0.1)';
  ripple.style.pointerEvents = 'none';
  ripple.style.zIndex = '99999';
  ripple.style.transform = 'scale(0.3)';
  ripple.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
  
  document.body.appendChild(ripple);
  
  ripple.getBoundingClientRect();
  ripple.style.transform = 'scale(1.6)';
  ripple.style.opacity = '0';
  
  setTimeout(() => {
    if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
  }, 400);

  const doubleClickEvent = new MouseEvent('dblclick', {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(doubleClickEvent);
}

// Drag & Drop internal routing helpers
let draggedElement: HTMLElement | null = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function triggerSimulatedDragStart(x: number, y: number) {
  const element = document.elementFromPoint(x, y) as HTMLElement;
  if (!element) return;

  const dragBox = element.closest('.draggable-item') as HTMLElement;
  if (dragBox) {
    draggedElement = dragBox;
    const rect = dragBox.getBoundingClientRect();
    
    // Switch to absolute positioning if not already
    dragBox.style.zIndex = '1000';
    dragBox.classList.add('cursor-grabbing');
    dragBox.classList.add('neon-glow-cyan');
    
    // Store cursor offset relative to card top-left
    dragOffsetX = x - rect.left;
    dragOffsetY = y - rect.top;
  }
}

function triggerSimulatedDragMove(x: number, y: number) {
  if (!draggedElement) return;
  
  // Directly translate using absolute coordinate bounds
  const playground = document.getElementById('drag-playground') || document.body;
  const pRect = playground.getBoundingClientRect();
  
  // Calculate relative left/top positions
  let targetLeft = x - pRect.left - dragOffsetX;
  let targetTop = y - pRect.top - dragOffsetY;

  // Clamp inside container boundary
  const boxRect = draggedElement.getBoundingClientRect();
  targetLeft = Math.max(0, Math.min(pRect.width - boxRect.width, targetLeft));
  targetTop = Math.max(0, Math.min(pRect.height - boxRect.height, targetTop));

  draggedElement.style.position = 'absolute';
  draggedElement.style.left = `${targetLeft}px`;
  draggedElement.style.top = `${targetTop}px`;
}

function triggerSimulatedDragEnd(x: number, y: number) {
  if (!draggedElement) return;

  draggedElement.classList.remove('cursor-grabbing');
  draggedElement.classList.remove('neon-glow-cyan');

  // Verify drop targets
  const dropTargets = document.elementsFromPoint(x, y);
  let droppedSuccess = false;

  for (const target of dropTargets) {
    if (target.id === 'drop-zone-a' || target.id === 'drop-zone-b') {
      target.appendChild(draggedElement);
      // Reset position styles so it snaps nicely inside grid
      draggedElement.style.position = 'relative';
      draggedElement.style.left = '0';
      draggedElement.style.top = '0';
      droppedSuccess = true;
      
      // Flash the drop zone success green
      target.classList.add('border-green-500', 'bg-green-500/10');
      setTimeout(() => {
        target.classList.remove('border-green-500', 'bg-green-500/10');
      }, 500);
      break;
    }
  }

  if (!droppedSuccess) {
    // Return to starting position or let it stay absolute
    draggedElement.style.zIndex = '';
  }

  draggedElement = null;
}
