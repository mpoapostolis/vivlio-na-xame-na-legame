/**
 * Keyframe animation definitions consumed by KeyframePlayer.
 * Each entry maps to an animation name; the player reads this JSON-shaped data
 * and lerps property tracks over time.
 *
 * Schema reference:
 *   - duration:  seconds
 *   - loop:      whether to wrap when time exceeds duration
 *   - tracks[]:  per-target groups
 *     - target:  string key matched at runtime to a THREE.Object3D
 *     - properties: object of property → keyframes[]
 *       - t:     normalized 0..1 (multiplied by duration internally)
 *       - value: number, [x,y,z], or "$bindingName" (resolved per-clip)
 *       - ease:  EASE registry key (default "linear")
 */

export interface Keyframe {
  t: number;
  value: number | number[] | string;
  ease?: string;
}

export interface Track {
  target: string;
  properties: Record<string, Keyframe[]>;
}

export interface AnimationDef {
  duration: number;
  loop?: boolean;
  tracks: Track[];
}

export const ANIMATIONS: Record<string, AnimationDef> = {
  photoLiftOff: {
    duration: 0.75,
    tracks: [
      {
        target: 'photoMesh',
        properties: {
          position: [
            { t: 0.0, value: '$startPos',    ease: 'easeOutBack' },
            { t: 1.0, value: '$photoTarget' },
          ],
          scale: [
            { t: 0.0, value: 0.30, ease: 'easeOutBack' },
            { t: 1.0, value: 1.00 },
          ],
        },
      },
      {
        target: 'infoMesh',
        properties: {
          position: [
            { t: 0.0, value: '$startPos' },
            { t: 0.2, value: '$startPos',   ease: 'easeOutCubic' },
            { t: 1.0, value: '$infoTarget' },
          ],
          scale: [
            { t: 0.0, value: 0.05 },
            { t: 0.2, value: 0.05, ease: 'easeOutCubic' },
            { t: 1.0, value: 1.00 },
          ],
          opacity: [
            { t: 0.0, value: 0.0 },
            { t: 0.2, value: 0.0, ease: 'easeOutCubic' },
            { t: 1.0, value: 1.0 },
          ],
        },
      },
      {
        target: 'dim',
        properties: {
          opacity: [
            { t: 0.0,   value: 0.0,  ease: 'linear' },
            { t: 0.625, value: 0.78 },
            { t: 1.0,   value: 0.78 },
          ],
        },
      },
    ],
  },
  photoLiftClose: {
    duration: 0.5,
    tracks: [
      {
        target: 'photoMesh',
        properties: {
          position: [
            { t: 0.0, value: '$photoTarget', ease: 'easeInCubic' },
            { t: 1.0, value: '$startPos' },
          ],
          scale: [
            { t: 0.0, value: 1.00, ease: 'easeInCubic' },
            { t: 1.0, value: 0.30 },
          ],
        },
      },
      {
        target: 'infoMesh',
        properties: {
          position: [
            { t: 0.0, value: '$infoTarget', ease: 'easeInCubic' },
            { t: 1.0, value: '$startPos' },
          ],
          scale: [
            { t: 0.0, value: 1.00, ease: 'easeInCubic' },
            { t: 1.0, value: 0.05 },
          ],
          opacity: [
            { t: 0.0, value: 1.0, ease: 'easeInCubic' },
            { t: 1.0, value: 0.0 },
          ],
        },
      },
      {
        target: 'dim',
        properties: {
          opacity: [
            { t: 0.0, value: 0.78, ease: 'easeInCubic' },
            { t: 1.0, value: 0.0 },
          ],
        },
      },
    ],
  },
  bookOpenSwoosh: {
    duration: 1.2,
    tracks: [
      {
        target: 'bookGroup',
        properties: {
          'scale.x': [{ t: 0.0, value: 0.85, ease: 'easeOutBack' }, { t: 1.0, value: 1.0 }],
          'scale.y': [{ t: 0.0, value: 0.85, ease: 'easeOutBack' }, { t: 1.0, value: 1.0 }],
          'scale.z': [{ t: 0.0, value: 0.85, ease: 'easeOutBack' }, { t: 1.0, value: 1.0 }],
          'rotation.y': [{ t: 0.0, value: -0.35, ease: 'easeOutCubic' }, { t: 1.0, value: 0 }],
        },
      },
    ],
  },
  pageNudge: {
    duration: 0.45,
    tracks: [
      {
        target: 'bookGroup',
        properties: {
          'rotation.z': [
            { t: 0.0,  value: 0,     ease: 'easeOutQuad' },
            { t: 0.25, value: 0.06,  ease: 'easeInOutQuad' },
            { t: 0.6,  value: -0.04, ease: 'easeInOutQuad' },
            { t: 1.0,  value: 0 },
          ],
        },
      },
    ],
  },
};

export const NARRATIONS: Record<string, string> = {
  page0: '/audio/narration_p0.mp3',
  page1: '/audio/narration_p1.mp3',
  page2: '/audio/narration_p2.mp3',
  page3: '/audio/narration_p3.mp3',
  page4: '/audio/narration_p4.mp3',
  page5: '/audio/narration_p5.mp3',
  page6: '/audio/narration_p6.mp3',
  page7: '/audio/narration_p7.mp3',
};

export const PHOTO_NARRATIONS: Record<string, string> = {
  '/photos/themelios.jpg':         '/audio/photo_themelios.mp3',
  '/photos/church_page-0013.jpg':  '/audio/photo_robert_drawing.mp3',
  '/photos/church_page-0015.jpg':  '/audio/photo_modified.mp3',
  '/photos/church_page-0001.jpg':  '/audio/photo_foundation.mp3',
  '/photos/church_page-0003.jpg':  '/audio/photo_works.mp3',
  '/photos/church_page-0016.jpg':  '/audio/photo_dome.mp3',
  '/photos/church_page-0005.jpg':  '/audio/photo_inauguration.mp3',
  '/photos/church_page-0006.jpg':  '/audio/photo_interior.mp3',
  '/photos/church_page-0021.jpg':  '/audio/photo_cross.mp3',
  '/photos/church_page-0002.jpg':  '/audio/photo_enthronement.mp3',
};
