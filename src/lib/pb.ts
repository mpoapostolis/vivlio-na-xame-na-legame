/**
 * PocketBase client + typed helpers for the Άγιος Ανδρέας app.
 * Shared between /book (reads) and /admin (reads + writes + uploads).
 */

import PocketBase from 'pocketbase';

export const PB_URL = 'https://yms.galerra.art';
export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);                   // we manage cancellation ourselves

// =============================================================================
//  RECORD SHAPES
// =============================================================================

export interface ChurchPage {
  id: string;
  order: number;
  book_index: number;
  side: 'front' | 'back';
  label: string;
  eyebrow: string;
  title: string;
  date: string;
  lead: string;            // HTML (PocketBase 'editor' field)
  body: string;            // HTML
  photo: string;           // filename in PB collection storage
  photo_title: string;
  photo_cap: string;
  photo_desc: string;      // HTML
  photo_italic: string;
  narration: string;       // mp3 filename
  photo_audio: string;     // mp3 filename
  locked_fields: string[]; // array of field names that are locked
  updated: string;
  created: string;
  collectionId: string;
  collectionName: string;
}

export interface ChurchAnimation {
  id: string;
  anim_name: string;
  duration: number;
  loop: boolean;
  tracks: unknown;         // [{ target, properties }]
  track_locks: unknown;    // map
  description: string;
  updated: string;
  created: string;
  collectionId: string;
  collectionName: string;
}

// =============================================================================
//  PUBLIC READS
// =============================================================================

export async function fetchPages(): Promise<ChurchPage[]> {
  const res = await pb.collection('church_pages').getFullList<ChurchPage>({
    sort: 'order',
  });
  return res;
}

export async function fetchAnimations(): Promise<ChurchAnimation[]> {
  return pb.collection('church_animations').getFullList<ChurchAnimation>();
}

// =============================================================================
//  FILE URLS
// =============================================================================

export function fileUrl(record: ChurchPage | ChurchAnimation, filename: string): string {
  if (!filename) return '';
  return `${PB_URL}/api/files/${record.collectionId || record.collectionName}/${record.id}/${filename}`;
}

// Get the served URL for a file field, or null if the field is empty.
export function pagePhotoUrl(p: ChurchPage):       string | null { return p.photo       ? fileUrl(p, p.photo)       : null; }
export function pageNarrationUrl(p: ChurchPage):   string | null { return p.narration   ? fileUrl(p, p.narration)   : null; }
export function pagePhotoAudioUrl(p: ChurchPage):  string | null { return p.photo_audio ? fileUrl(p, p.photo_audio) : null; }

// =============================================================================
//  AUTH (used by /admin)
// =============================================================================

/** Authenticates against the dedicated `church_admins` auth collection
 *  (NOT _superusers — that's for the PB admin UI only). */
export async function loginAsAdmin(email: string, password: string) {
  return pb.collection('church_admins').authWithPassword(email, password);
}

export function logout() { pb.authStore.clear(); }

export function isAuthed(): boolean {
  return pb.authStore.isValid;
}

// =============================================================================
//  MUTATIONS (admin only)
// =============================================================================

/** Update a page record. Pass plain field values; for file uploads, use FormData. */
export async function updatePage(id: string, patch: Partial<ChurchPage> | FormData) {
  return pb.collection('church_pages').update<ChurchPage>(id, patch as any);
}

export async function updateAnimation(id: string, patch: Partial<ChurchAnimation>) {
  return pb.collection('church_animations').update<ChurchAnimation>(id, patch as any);
}

export async function createAnimation(data: Partial<ChurchAnimation>) {
  return pb.collection('church_animations').create<ChurchAnimation>(data as any);
}

export async function deleteAnimation(id: string) {
  return pb.collection('church_animations').delete(id);
}
