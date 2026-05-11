/**
 * Chronological events in the construction of the Cathedral of Saint Andrew of Patras.
 * Source: educational material from the cathedral's archive (polytonic Greek preserved).
 */

export type ChronicleCategory =
  | 'prologue'
  | 'study'
  | 'reactions'
  | 'foundation'
  | 'interruption'
  | 'reconstruction'
  | 'inauguration'
  | 'interior'
  | 'stats'
  | 'cross'
  | 'enthronement'
  | 'renovation'
  | 'epilogue';

export interface ChronicleEvent {
  id: string;
  year: string;                 // "1902", "1908", "1932–37", "—"
  date?: string;                // "1ᾳ Ἰουνίου"
  title: string;
  body: string[];               // paragraphs (polytonic)
  photo?: string;
  photoCaption?: string;
  narration?: string;           // path to mp3
  category: ChronicleCategory;
  highlight?: string;           // optional pull-quote
}

export const CHRONICLE: ChronicleEvent[] = [
  {
    id: 'prologue',
    year: '—',
    title: 'Ὁ πολιοῦχος τῶν Πατρῶν',
    body: [
      'Ἡ εὐλάβεια καὶ ἡ τιμὴ τῶν Πατρέων πρὸς τὸν ἔνδοξον πολιοῦχον τῶν Πατρῶν, τοὺς ὡδήγησαν εἰς τὴν ἀπόφασιν νὰ ἀνεγείρουν Ναὸν ἀντάξιον τοῦ Πρωτοκλήτου τῶν Ἀποστόλων.',
      'Στὶς ἑπόμενες σελίδες, τὸ χρονικὸ ἀνεγέρσεως ἀπὸ τὸν διαγωνισμὸ τοῦ 1902 ἕως τὶς ἀνακαινίσεις τοῦ 21ου αἰῶνος.',
    ],
    narration: '/audio/narration_p0.mp3',
    category: 'prologue',
  },
  {
    id: 'study-1902',
    year: '1902',
    title: 'Ἀρχιτεκτονικὴ Μελέτη',
    body: [
      'Πρὸς τοῦτο προεκηρύχθη διεθνὴς διαγωνισμὸς τὸ ἔτος 1902 διὰ τὴν ἐκπόνησιν Ἀρχιτεκτονικῆς μελέτης.',
      'Ὑπεβλήθηκαν 32 μελέται ἀπὸ Ἕλληνας καὶ ξένους ἀρχιτέκτονας, ἐκ τῶν ὁποίων ἐθεωρήθησαν μόνον 8 ἱκαναί.',
    ],
    photo: '/photos/church_page-0013.jpg',
    photoCaption: 'ἀρχιτεκτονικὸ σχέδιο · ρομπὲρ',
    narration: '/audio/narration_p1.mp3',
    category: 'study',
    highlight: 'Πρῶτο βραβεῖο: Αἰμίλιος Ρομπέρ, Ἀκαδημία Βερολίνου.',
  },
  {
    id: 'reactions-1907',
    year: '1907',
    title: 'Ἀντιδράσεις & κριτική',
    body: [
      'Πρὸ τῆς θεμελιώσεως ὑπῆρξε σφοδρὰ κριτική, διότι ἐθεωρήθη ὅτι δὲν ἀνταπεκρίνετο εἰς τὴν Ὀρθόδοξον ἐκκλησιαστικὴν παράδοσιν.',
      'Ἦτο εὐνόητον, ὅτι ὁ ἐκπονήσας τὸ σχέδιον Γάλλος μηχανικός, νὰ εἶχεν ἐπηρεασθῆ ἀπὸ τὴν Δυτικὴν παράδοσιν.',
    ],
    photo: '/photos/church_page-0015.jpg',
    photoCaption: 'τροποποιημένα σχέδια · 1907',
    narration: '/audio/narration_p2.mp3',
    category: 'reactions',
  },
  {
    id: 'foundation-1908',
    year: '1908',
    date: '1ᾳ Ἰουνίου',
    title: 'Ὁ θεμέλιος λίθος',
    body: [
      'Τὴν 1ην Ἰουνίου τοῦ 1908 κατετέθη ὁ θεμέλιος λίθος ἀπὸ τὸν τότε Βασιλέα Γεώργιο Α´.',
      'Προεξάρχοντος τῆς λαμπρᾶς τελετῆς, τοῦ μακαριστοῦ Μητροπολίτου Πατρῶν Ἀντωνίου Παράσχη.',
    ],
    photo: '/photos/church_page-0001.jpg',
    photoCaption: 'τελετὴ θεμελιώσεως · 1908',
    narration: '/audio/narration_p2.mp3',
    category: 'foundation',
    highlight: 'Παρουσίᾳ τοῦ Βασιλέως Γεωργίου Α´.',
  },
  {
    id: 'interruption',
    year: '1908–32',
    title: 'Διακοπὲς & ἀναμονή',
    body: [
      'Τὰς προετοιμασίας προέλαβαν: ὁ Α´ Παγκόσμιος Πόλεμος, ἡ Μικρασιατικὴ Καταστροφή, ἡ οἰκονομικὴ ὕφεσις καὶ ὁ σεισμὸς τῆς Κορίνθου τοῦ 1928.',
    ],
    photo: '/photos/church_page-0003.jpg',
    photoCaption: 'ἐργασίες θεμελιώσεως',
    narration: '/audio/narration_p3.mp3',
    category: 'interruption',
  },
  {
    id: 'reconstruction-1932',
    year: '1932–37',
    title: 'Ἀνοικοδόμησις',
    body: [
      'Τὸ ἔτος 1932 ἀπεφασίστη ἡ ἀνοικοδόμησις τοῦ Ναοῦ μὲ ὁπλισμένον σκυρόδεμα.',
      'Τὸ φθινόπωρον τοῦ 1936 ὁλοκληρώθη τὸ κεντρικὸν τμῆμα.',
    ],
    photo: '/photos/church_page-0016.jpg',
    photoCaption: 'ἀνοικοδόμησις τοῦ τρούλου',
    narration: '/audio/narration_p3.mp3',
    category: 'reconstruction',
  },
  {
    id: 'inauguration-1974',
    year: '1974',
    date: '26 Σεπτεμβρίου',
    title: 'Ἐγκαίνια',
    body: [
      'Ὁ Ναὸς ἐγκαινιάσθη λαμπρῶς τὴν 26ην Σεπτεμβρίου 1974.',
      'Ἑξήντα ἕξι ἔτη μετὰ τὴν ἀρχικὴν θεμελίωσιν.',
    ],
    photo: '/photos/church_page-0005.jpg',
    photoCaption: 'τὰ ἐγκαίνια · 1974',
    narration: '/audio/narration_p4.mp3',
    category: 'inauguration',
    highlight: '66 ἔτη μετὰ τὴν ἀρχικὴν θεμελίωσιν.',
  },
  {
    id: 'interior',
    year: '1974–',
    title: 'Ὁ ἐσωτερικὸς διάκοσμος',
    body: [
      'Συνεπληρώθη ὁ ἐσωτερικὸς διάκοσμος ὑπὸ τοῦ ἁγιογράφου μακαριστοῦ Ἰωάννου Καρούσου.',
      'Ἡ ἁγιογράφησις τῆς κόγχης τοῦ Ἱεροῦ καὶ τοῦ τρούλου.',
    ],
    photo: '/photos/church_page-0006.jpg',
    photoCaption: 'ὁ ἐσωτερικὸς χῶρος',
    narration: '/audio/narration_p4.mp3',
    category: 'interior',
  },
  {
    id: 'cross-1980',
    year: '1980',
    title: 'Ὁ Σταυρὸς τοῦ Ἁγίου',
    body: [
      'Ἐτοποθετήθη ὁ Σταυρὸς τοῦ Ἁγίου Ἀνδρέου εἰς πολύτιμον ἀργυροχρυσοποίκιλτον θήκην.',
      'Ὁ Σταυρὸς τοῦ Πρωτοκλήτου Ἀποστόλου, ἐπιστροφὴ τοῦ ἱεροῦ συμβόλου.',
    ],
    photo: '/photos/church_page-0021.jpg',
    photoCaption: 'ὁ Σταυρὸς τοῦ Ἁγίου · 1980',
    narration: '/audio/narration_p5.mp3',
    category: 'cross',
  },
  {
    id: 'enthronement-2005',
    year: '2005',
    date: '2 Ἀπριλίου',
    title: 'Ἐπὶ Μητροπολίτου Χρυσοστόμου',
    body: [
      'Τὸν Φεβρουάριον τοῦ 2005 ἐχειροτονήθη Μητροπολίτης Πατρῶν, ὁ Ἀρχιμ. Χρυσόστομος Σκλήφας.',
      'Ἐνεθρονίσθη τὴν 2αν Ἀπριλίου, παρουσίᾳ τοῦ μακαριστοῦ Ἀρχιεπισκόπου Χριστοδούλου.',
    ],
    photo: '/photos/church_page-0002.jpg',
    photoCaption: 'ἐνθρόνισις · 2 Ἀπριλίου 2005',
    narration: '/audio/narration_p6.mp3',
    category: 'enthronement',
  },
  {
    id: 'renovation',
    year: '2005–',
    title: 'Ἀνακαινίσεις',
    body: [
      'Ἐξεπονήθη εἰδικὴ μελέτη καὶ διορθώθηκαν προβλήματα εἰς τὰ θεμέλια. Ἐγένετο στεγανοποίησις τῆς στέγης, ἀνακαίνισις τῶν ἐξωτερικῶν ἐπιφανειῶν, ὁλοκλήρωσις τῆς ἁγιογραφήσεως, καὶ δημιουργία Μουσείου & Βιβλιοθήκης.',
      'Ἀνεκαινίσθη ἐκ βάθρων ὁ Παλαιὸς Ἱερὸς Ναός.',
    ],
    narration: '/audio/narration_p6.mp3',
    category: 'renovation',
  },
  {
    id: 'epilogue',
    year: '—',
    title: 'Πνευματικὸν κέντρον',
    body: [
      'Ἀξιοποιήθη ὁ χῶρος ἔναντι τοῦ Ἱεροῦ Ναοῦ καὶ λειτουργεῖ πνευματικὸν κέντρον.',
    ],
    narration: '/audio/narration_p7.mp3',
    category: 'epilogue',
  },
];

/** Quick stats for the cathedral, for stats cards / facts strip. */
export const STATS: { label: string; value: string }[] = [
  { label: 'Συνολικὴ ἐπιφάνεια', value: '1.900 m²' },
  { label: 'Γυναικωνίτης',       value: '700 m²' },
  { label: 'Χωρητικότης',        value: '6.500 ἄτομα' },
  { label: 'Μῆκος',              value: '59,80 μ.' },
  { label: 'Πλάτος',             value: '51,80 μ.' },
  { label: 'Ὕψος τρούλου',       value: '40,5 μ.' },
];
