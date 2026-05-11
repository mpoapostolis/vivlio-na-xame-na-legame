/** Shared nav entries (used by Header + landing-page cards). */

export interface NavItem {
  href: string;
  label: string;
  greek: string;            // polytonic label
  description: string;
  symbol: string;           // small unicode glyph
}

export const NAV: NavItem[] = [
  { href: '/',          label: 'home',      greek: 'ἀρχή',        description: 'εἰσαγωγή',                          symbol: '✦' },
  { href: '/book',      label: 'book',      greek: 'τὸ βιβλίον',   description: 'τρισδιάστατο χρονικό',              symbol: '❦' },
  { href: '/chronicle', label: 'chronicle', greek: 'χρονικό',      description: 'γεγονότα κατὰ σειρὰν χρόνου',       symbol: '⌘' },
  { href: '/gallery',   label: 'gallery',   greek: 'γκαλερὶ',      description: 'τὸ ἀρχεῖο τῶν φωτογραφιῶν',         symbol: '◈' },
  { href: '/quiz',      label: 'quiz',      greek: 'γνώρισέ τον',  description: 'ἐκπαιδευτικὸ παιχνίδι',             symbol: '◉' },
  { href: '/about',     label: 'about',     greek: 'περὶ τοῦ ἔργου', description: 'πηγές & εὐχαριστίες',            symbol: '✧' },
];
