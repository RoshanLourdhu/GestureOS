import type { Landmark, ActiveGesture, GestureSettings } from '../types/gesture';

/**
 * Calculates the 2D Euclidean distance between two landmarks.
 */
export function getDistance2D(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Calculates the 3D Euclidean distance between two landmarks.
 */
export function getDistance3D(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

/**
 * Determines whether a finger is extended.
 * Standard rule for index, middle, ring, pinky:
 * Tip y-coord is less than PIP and MCP y-coords (since y=0 is top).
 */
export function isFingerExtended(
  tip: Landmark,
  pip: Landmark,
  mcp: Landmark
): boolean {
  return tip.y < pip.y && pip.y < mcp.y;
}

/**
 * Custom check for thumb extension relative to wrist and index finger base.
 */
export function isThumbExtended(
  thumbTip: Landmark,
  thumbIp: Landmark,
  thumbMcp: Landmark,
  wrist: Landmark
): boolean {
  // If thumb tip is far enough horizontally and vertically from MCP
  const distTipMcp = getDistance2D(thumbTip, thumbMcp);
  const distIpMcp = getDistance2D(thumbIp, thumbMcp);
  
  // Thumb is extended if it's pushed away from palm
  return distTipMcp > distIpMcp * 1.2 && thumbTip.y < wrist.y;
}

export interface GestureResult {
  gesture: ActiveGesture;
  confidence: number;
  details: string;
}

/**
 * Analyzes the hand landmarks and classifies the gesture.
 */
export function classifyGesture(
  landmarks: Landmark[],
  settings: GestureSettings
): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'None', confidence: 0, details: 'No hand detected' };
  }

  // Extract key landmarks for easier access
  const wrist = landmarks[0];
  
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];

  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];

  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const middleMcp = landmarks[9];

  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const ringMcp = landmarks[13];

  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const pinkyMcp = landmarks[17];

  // 1. Calculate key Euclidean distances
  const thumbToIndexDist = getDistance2D(thumbTip, indexTip);
  const thumbToMiddleDist = getDistance2D(thumbTip, middleTip);
  const indexToMiddleDist = getDistance2D(indexTip, middleTip);
  const thumbToRingDist = getDistance2D(thumbTip, ringTip);
  const thumbToPinkyDist = getDistance2D(thumbTip, pinkyTip);

  // 2. Check finger extension states
  const indexExtended = isFingerExtended(indexTip, indexPip, indexMcp);
  const middleExtended = isFingerExtended(middleTip, middlePip, middleMcp);
  const ringExtended = isFingerExtended(ringTip, ringPip, ringMcp);
  const pinkyExtended = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp);
  const thumbExtended = isThumbExtended(thumbTip, thumbIp, thumbMcp, wrist);

  // 3. Count how many fingers are extended (excluding thumb)
  const fingersExtendedCount = 
    (indexExtended ? 1 : 0) + 
    (middleExtended ? 1 : 0) + 
    (ringExtended ? 1 : 0) + 
    (pinkyExtended ? 1 : 0);

  // Gesture classification logic

  // --- GESTURE 1: DRAG & DROP (Closed Fist) ---
  // A closed fist means all 4 major fingers are bent towards the palm,
  // and they are close to the wrist or palm center.
  const isFist = 
    !indexExtended && 
    !middleExtended && 
    !ringExtended && 
    !pinkyExtended &&
    getDistance2D(indexTip, indexMcp) < 0.08 &&
    getDistance2D(middleTip, middleMcp) < 0.08;

  if (isFist) {
    return {
      gesture: 'Drag',
      confidence: 0.95,
      details: 'Closed Fist (Grab/Drag active)'
    };
  }

  // --- GESTURE 2: SCROLL (Pinch and move hand vertically) ---
  // To avoid conflict, scroll pinch is triggered by pinching thumb and pinky finger
  // OR thumb and ring finger, while keeping index/middle folded or straight.
  // Let's use Thumb-to-Pinky pinch or Thumb-to-Ring pinch.
  const isScrollPinch = 
    thumbToPinkyDist < settings.scrollThreshold || 
    thumbToRingDist < settings.scrollThreshold;
  
  if (isScrollPinch && !indexExtended && !middleExtended) {
    return {
      gesture: 'Scroll',
      confidence: 0.90,
      details: 'Thumb-Pinky/Ring pinch active (Scroll Mode)'
    };
  }

  // --- GESTURE 3: DOUBLE CLICK (Index and Middle finger pinch) ---
  // Prompt: "Index finger and middle finger pinch"
  // If thumb is not pinching index, and index tip is touching middle tip
  if (indexToMiddleDist < settings.doubleClickThreshold && indexExtended && middleExtended) {
    return {
      gesture: 'Double Click',
      confidence: 0.88,
      details: `Index and Middle tip pinched (dist: ${indexToMiddleDist.toFixed(3)})`
    };
  }

  // --- GESTURE 4: LEFT CLICK (Thumb tip touches index tip) ---
  // If the thumb tip is extremely close to the index finger tip.
  if (thumbToIndexDist < settings.clickThreshold) {
    return {
      gesture: 'Left Click',
      confidence: 0.95,
      details: `Thumb-Index pinch (dist: ${thumbToIndexDist.toFixed(3)})`
    };
  }

  // --- GESTURE 5: RIGHT CLICK (Thumb tip touches middle finger tip) ---
  // If thumb tip is extremely close to middle tip.
  if (thumbToMiddleDist < settings.rightClickThreshold) {
    return {
      gesture: 'Right Click',
      confidence: 0.92,
      details: `Thumb-Middle pinch (dist: ${thumbToMiddleDist.toFixed(3)})`
    };
  }

  // --- GESTURE 6: SLIDER DEMOS (Volume / Brightness) ---
  // If thumb and index are both extended, and middle, ring, pinky are folded,
  // we are in slider adjustment mode (measure distance between thumb and index).
  const isSliderControlGesture = 
    indexExtended && 
    thumbExtended && 
    !middleExtended && 
    !ringExtended && 
    !pinkyExtended;

  if (isSliderControlGesture && thumbToIndexDist > settings.clickThreshold * 1.5) {
    // If the distance is growing/shrinking, we'll label it slider adjustment.
    // The visual playground hook will maps this distance to volume or brightness based on hover focus.
    const details = `Thumb-Index distance: ${thumbToIndexDist.toFixed(3)}`;
    return {
      gesture: 'Volume Up', // We will resolve Up vs Down dynamically based on change in dist
      confidence: 0.90,
      details
    };
  }

  // --- GESTURE 7: CURSOR MOVEMENT (Index finger extended) ---
  // Standard pointer gesture.
  if (indexExtended && fingersExtendedCount === 1) {
    return {
      gesture: 'Move',
      confidence: 0.95,
      details: 'Index finger extended'
    };
  }

  // Default fallback: If 2 or more fingers are extended, treat as general Move or None
  if (fingersExtendedCount >= 1) {
    return {
      gesture: 'Move',
      confidence: 0.80,
      details: `${fingersExtendedCount} fingers extended`
    };
  }

  return {
    gesture: 'None',
    confidence: 0.5,
    details: 'Hand resting or unclassified state'
  };
}
