/**
 * Photo metadata + 5 categories from the cathedral archive.
 * Sources: Photos/ folder + Περιγραφή Φωτό.txt in the educational material.
 */

export type PhotoCategoryId =
  | 'foundation'
  | 'drawings'
  | 'inauguration'
  | 'cross'
  | 'enthronement';

export interface PhotoCategory {
  id: PhotoCategoryId;
  label: string;
  year: string;
  description: string;
}

export const PHOTO_CATEGORIES: Record<PhotoCategoryId, PhotoCategory> = {
  foundation: {
    id: 'foundation',
    label: 'Ὁ θεμέλιος λίθος',
    year: '1908',
    description: 'Ἀσπρόμαυρες φωτογραφίες ἀπὸ τὴν τελετὴ θεμελιώσεως καὶ τὶς πρῶτες ἐργασίες.',
  },
  drawings: {
    id: 'drawings',
    label: 'Σχέδια τοῦ Ναοῦ',
    year: '1902–07',
    description: 'Ἀρχιτεκτονικὰ σχέδια τοῦ Γάλλου ἀρχιτέκτονος Αἰμιλίου Ρομπὲρ καὶ ἡ τροποποιημένη ἐκδοχή.',
  },
  inauguration: {
    id: 'inauguration',
    label: 'Ἐγκαίνια τοῦ ναοῦ',
    year: '1974',
    description: 'Ἡ μεγαλειώδης τελετὴ τῶν ἐγκαινίων καὶ ὁ ἐσωτερικὸς διάκοσμος.',
  },
  cross: {
    id: 'cross',
    label: 'Ὁ Σταυρὸς τοῦ Ἁγίου',
    year: '1980',
    description: 'Ὁ Σταυρὸς τοῦ Πρωτοκλήτου Ἀποστόλου, σὲ πολύτιμη ἀργυροχρυσοποίκιλτη θήκη.',
  },
  enthronement: {
    id: 'enthronement',
    label: 'Ἐνθρόνισις Χρυσοστόμου',
    year: '2005',
    description: 'Ἡ ἐνθρόνισις τοῦ Μητροπολίτου Πατρῶν Χρυσοστόμου, παρουσίᾳ τοῦ μακαριστοῦ Ἀρχιεπισκόπου Χριστοδούλου.',
  },
};

export interface PhotoEntry {
  id: string;
  src: string;
  title: string;
  description: string;
  caption: string;
  italic?: string;
  category: PhotoCategoryId;
  year?: string;
  narration?: string;
}

export const PHOTOS: PhotoEntry[] = [
  {
    id: 'themelios',
    src: '/photos/themelios.jpg',
    title: 'Σχέδιο θεμελίων',
    description: 'Λεπτομερὲς ἀρχιτεκτονικὸ σχέδιο τῶν θεμελίων τοῦ Ἱεροῦ Ναοῦ, ὑπογεγραμμένον ἀπὸ τὸν Αἰμίλιον Ρομπέρ.',
    caption: 'σχέδιο θεμελίων · 1908',
    italic: '1ᾳ Ἰουνίου 1908 — κατάθεσις ὑπὸ Βασιλέως Γεωργίου Α´.',
    category: 'drawings',
    year: '1908',
    narration: '/audio/photo_themelios.mp3',
  },
  {
    id: 'robert',
    src: '/photos/church_page-0013.jpg',
    title: 'Σχέδιο τοῦ Ρομπέρ',
    description: 'Ἡ μελέτη τοῦ Γάλλου ἀρχιτέκτονος Αἰμιλίου Ρομπέρ, ἡ ὁποία ἔλαβε τὸ πρῶτο βραβεῖον τοῦ διεθνοῦς διαγωνισμοῦ τοῦ 1902.',
    caption: 'ἀρχιτεκτονικὸ σχέδιο · ρομπέρ',
    italic: 'πρῶτο βραβεῖο, Ἀκαδημία Βερολίνου',
    category: 'drawings',
    year: '1902',
    narration: '/audio/photo_robert_drawing.mp3',
  },
  {
    id: 'modified',
    src: '/photos/church_page-0015.jpg',
    title: 'Τροποποιημένη μελέτη',
    description: 'Μετὰ τὶς ἔντονες ἀντιδράσεις, ὁ Ρομπὲρ ὑπεχρεώθη νὰ τροποποιήσει τὴν μελέτη του.',
    caption: 'τροποποιημένα σχέδια',
    italic: '1907 · ἔγκρισις τῆς τροποποιημένης μελέτης',
    category: 'drawings',
    year: '1907',
    narration: '/audio/photo_modified.mp3',
  },
  {
    id: 'foundation-ceremony',
    src: '/photos/church_page-0001.jpg',
    title: 'Τελετὴ θεμελιώσεως',
    description: 'Ἡ ἱστορικὴ φωτογραφία τῆς θεμελιώσεως τοῦ Ναοῦ, μὲ τὸν Βασιλέα Γεώργιο Α´.',
    caption: 'τελετὴ θεμελιώσεως · 1908',
    italic: '1 Ἰουνίου 1908',
    category: 'foundation',
    year: '1908',
    narration: '/audio/photo_foundation.mp3',
  },
  {
    id: 'works',
    src: '/photos/church_page-0003.jpg',
    title: 'Ἐργασίες θεμελιώσεως',
    description: 'Στιγμιότυπο ἀπὸ τὶς πρῶτες ἐργασίες θεμελιώσεως τοῦ Ναοῦ.',
    caption: 'ἐργασίες θεμελιώσεως',
    category: 'foundation',
    year: '1908',
    narration: '/audio/photo_works.mp3',
  },
  {
    id: 'dome',
    src: '/photos/church_page-0016.jpg',
    title: 'Ἀνοικοδόμησις τοῦ τρούλου',
    description: 'Φωτογραφικὸ ντοκουμέντο ἀπὸ τὶς ἐργασίες κατασκευῆς τοῦ κεντρικοῦ τρούλου.',
    caption: 'ἐργασίες ἀνοικοδομήσεως',
    category: 'foundation',
    year: '1936',
    narration: '/audio/photo_dome.mp3',
  },
  {
    id: 'inauguration',
    src: '/photos/church_page-0005.jpg',
    title: 'Τελετὴ ἐγκαινίων',
    description: 'Ἡ μεγαλειώδης τελετὴ τῶν ἐγκαινίων τοῦ Ναοῦ.',
    caption: 'τὰ ἐγκαίνια · 1974',
    italic: '26 Σεπτεμβρίου 1974',
    category: 'inauguration',
    year: '1974',
    narration: '/audio/photo_inauguration.mp3',
  },
  {
    id: 'interior',
    src: '/photos/church_page-0006.jpg',
    title: 'Ὁ ἐσωτερικὸς διάκοσμος',
    description: 'Ἡ ἁγιογράφησις τῆς κόγχης τοῦ Ἱεροῦ καὶ τοῦ τρούλου.',
    caption: 'ὁ ἐσωτερικὸς χῶρος',
    category: 'inauguration',
    year: '1974+',
    narration: '/audio/photo_interior.mp3',
  },
  {
    id: 'cross',
    src: '/photos/church_page-0021.jpg',
    title: 'Ὁ Σταυρὸς τοῦ Ἁγίου Ἀνδρέου',
    description: 'Ὁ Σταυρὸς τοῦ Πρωτοκλήτου Ἀποστόλου, εἰς πολύτιμον ἀργυροχρυσοποίκιλτον θήκην.',
    caption: 'ὁ Σταυρὸς τοῦ Ἁγίου · 1980',
    italic: 'ἐπιστροφὴ τοῦ ἱεροῦ συμβόλου',
    category: 'cross',
    year: '1980',
    narration: '/audio/photo_cross.mp3',
  },
  {
    id: 'enthronement',
    src: '/photos/church_page-0002.jpg',
    title: 'Ἐνθρόνισις Πατρῶν Χρυσοστόμου',
    description: 'Ἡ ἐνθρόνισις τοῦ Μητροπολίτου Χρυσοστόμου εἰς τὸν Ἱερὸν Ναὸν τοῦ Ἀποστόλου Ἀνδρέου.',
    caption: 'ἐνθρόνισις · 2 Ἀπριλίου 2005',
    italic: '2 Ἀπριλίου 2005',
    category: 'enthronement',
    year: '2005',
    narration: '/audio/photo_enthronement.mp3',
  },
];
