#!/usr/bin/env python3
"""
Generate Greek narration mp3 files for the Άγιος Ανδρέας 3D book.

Uses macOS `say` with the Melina (el_GR) voice, then converts to mp3 via ffmpeg.
Run from project root:
    python3 tools/generate_narrations.py

Output: assets/audio/narration_p{0..7}.mp3 + photo_*.mp3
"""

import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "audio"
OUT_DIR.mkdir(parents=True, exist_ok=True)

VOICE = "Melina"           # el_GR voice on macOS
RATE = 165                 # words per minute — measured. Adjust to taste.
MP3_BITRATE = "96k"

# ---------------------------------------------------------------------------
# Narrations — one per page (8 pages).
# Polytonic is normalized to monotonic before TTS (Melina handles monotonic better).
# ---------------------------------------------------------------------------
PAGES = [
    # 0 — Cover + intro
    "Ιερός Ναός Αγίου Ανδρέου Πατρών. Ο πολιούχος των Πατρών. "
    "Η ευλάβεια και η τιμή των Πατρέων προς τον ένδοξον πολιούχον τους, "
    "τους ωδήγησαν εις την απόφασιν να ανεγείρουν Ναόν αντάξιον "
    "του Πρωτοκλήτου των Αποστόλων.",

    # 1 — TOC + chapter A: Architectural Study (1902)
    "Αρχιτεκτονική Μελέτη. Έτος 1902. "
    "Προεκηρύχθη διεθνής διαγωνισμός διά την εκπόνησιν αρχιτεκτονικής μελέτης. "
    "Υπεβλήθηκαν 32 μελέται από Έλληνας και ξένους αρχιτέκτονας, "
    "εκ των οποίων εθεωρήθησαν μόνον οκτώ ικαναί. "
    "Πρώτο βραβείο έλαβε η μελέτη του Γάλλου αρχιτέκτονος Αιμιλίου Ρομπέρ.",

    # 2 — Reactions + Foundation Stone (1908)
    "Αντιδράσεις και κριτική. "
    "Προ της θεμελιώσεως υπήρξε σφοδρά κριτική, διότι εθεωρήθη ότι το σχέδιον "
    "δεν ανταπεκρίνετο εις την Ορθόδοξον εκκλησιαστικήν παράδοσιν. "
    "Την 1ην Ιουνίου του 1908, κατετέθη ο θεμέλιος λίθος "
    "από τον τότε Βασιλέα Γεώργιον τον Πρώτον, "
    "προεξάρχοντος του μακαριστού Μητροπολίτου Πατρών Αντωνίου Παράσχη.",

    # 3 — Interruptions + Reconstruction (1932-37)
    "Διακοπές και αναμονή. "
    "Τας προετοιμασίας προέλαβαν: ο Πρώτος Παγκόσμιος Πόλεμος, "
    "η Μικρασιατική Καταστροφή, η οικονομική ύφεσις και ο σεισμός της Κορίνθου το 1928. "
    "Το έτος 1932 απεφασίστη η ανοικοδόμησις του Ναού με οπλισμένον σκυρόδεμα. "
    "Το φθινόπωρον του 1936 ολοκληρώθη το κεντρικόν τμήμα.",

    # 4 — Inauguration (1974) + Interior
    "Εγκαίνια. "
    "Ο Ναός εγκαινιάσθη λαμπρώς την 26ην Σεπτεμβρίου 1974, "
    "εξήντα έξι έτη μετά την αρχικήν θεμελίωσιν. "
    "Συνεπληρώθη ο εσωτερικός διάκοσμος υπό του αγιογράφου "
    "μακαριστού Ιωάννου Καρούσου, με την αγιογράφησιν "
    "της κόγχης του Ιερού και του τρούλου.",

    # 5 — Stats + Cross of St. Andrew (1980)
    "Στοιχεία του Ναού. "
    "Συνολική επιφάνεια χιλίων εννιακοσίων τετραγωνικών μέτρων, "
    "χωρητικότης έξι χιλιάδων πεντακοσίων ατόμων, ύψος τρούλου σαράντα και ήμισυ μέτρα. "
    "Ο κεντρικός τρούλος περιστοιχίζεται από δώδεκα άλλους τρούλους, "
    "οι οποίοι συμβολίζουν τον Ιησούν με τους δώδεκα Αποστόλους. "
    "Το έτος 1980, ετοποθετήθη ο Σταυρός του Αγίου Ανδρέου "
    "εις πολύτιμον αργυροχρυσοποίκιλτον θήκην.",

    # 6 — Metropolitan Chrysostomos (2005) + Renovations
    "Επί Μητροπολίτου Χρυσοστόμου. "
    "Τον Φεβρουάριον του 2005 εχειροτονήθη Μητροπολίτης Πατρών, "
    "ο Αρχιμανδρίτης Χρυσόστομος Σκλήφας. "
    "Ενεθρονίσθη την 2αν Απριλίου, παρουσία του μακαριστού Αρχιεπισκόπου Χριστοδούλου. "
    "Εξεπονήθη ειδική μελέτη και ανεκαινίσθη εκ βάθρων ο Παλαιός Ιερός Ναός, "
    "με στεγανοποίησιν, αγιογράφησιν, και δημιουργίαν Μουσείου και Βιβλιοθήκης.",

    # 7 — Closing + Spiritual Center
    "Πνευματικόν κέντρον. "
    "Αξιοποιήθη ο χώρος έναντι του Ιερού Ναού και λειτουργεί πνευματικόν κέντρον. "
    "Απόστολος Ανδρέας ο Πρωτόκλητος. Πολιούχος των Πατρών.",
]

# Photo-specific narrations — short, plays automatically when photo modal opens.
PHOTOS = {
    "themelios": "Σχέδιο θεμελίων του Ιερού Ναού, υπογεγραμμένον από τον Αιμίλιον Ρομπέρ. "
                 "1η Ιουνίου 1908: κατάθεσις υπό του Βασιλέως Γεωργίου του Πρώτου.",
    "robert_drawing": "Η μελέτη του Γάλλου αρχιτέκτονος Αιμιλίου Ρομπέρ. "
                      "Πρώτο βραβείο του διεθνούς διαγωνισμού του 1902.",
    "modified": "Τροποποιημένη μελέτη. Μετά τις έντονες αντιδράσεις, "
                "ο Ρομπέρ υπεχρεώθη να τροποποιήσει την μελέτη του. "
                "Έγκρισις της τροποποιημένης μελέτης, 1907.",
    "foundation": "Τελετή θεμελιώσεως. 1η Ιουνίου 1908. "
                  "Ιστορική φωτογραφία της θεμελιώσεως του Ναού, "
                  "παρουσία του Βασιλέως Γεωργίου του Πρώτου.",
    "works": "Εργασίες θεμελιώσεως. Στιγμιότυπο από τις πρώτες εργασίες "
             "θεμελιώσεως του Ναού.",
    "dome": "Ανοικοδόμησις του τρούλου. Φωτογραφικό ντοκουμέντο από "
            "τις εργασίες κατασκευής του κεντρικού τρούλου.",
    "inauguration": "Τελετή εγκαινίων. 26 Σεπτεμβρίου 1974. "
                    "Η μεγαλειώδης τελετή των εγκαινίων του Ναού.",
    "interior": "Ο εσωτερικός διάκοσμος. Η αγιογράφησις της κόγχης "
                "του Ιερού και του τρούλου.",
    "cross": "Ο Σταυρός του Αγίου Ανδρέου. 1980. "
             "Ο Σταυρός του Πρωτοκλήτου Αποστόλου, "
             "εις πολύτιμον αργυροχρυσοποίκιλτον θήκην.",
    "enthronement": "Ενθρόνισις. 2 Απριλίου 2005. "
                    "Η ενθρόνισις του Μητροπολίτου Χρυσοστόμου "
                    "εις τον Ιερόν Ναόν του Αποστόλου Ανδρέου.",
}


def to_monotonic(text: str) -> str:
    """Strip polytonic diacritics; keep modern Greek monotonic accents."""
    decomposed = unicodedata.normalize("NFD", text)
    # Keep: tonos (U+0301), dialytika (U+0308), tonos+dialytika (U+0344). Strip others.
    keep = {0x0301, 0x0308, 0x0344}
    filtered = "".join(ch for ch in decomposed if not unicodedata.combining(ch) or ord(ch) in keep)
    return unicodedata.normalize("NFC", filtered)


def synthesize(text: str, out_mp3: Path) -> bool:
    text_mono = to_monotonic(text)
    aiff = out_mp3.with_suffix(".aiff")
    try:
        subprocess.run(
            ["say", "-v", VOICE, "-r", str(RATE), "-o", str(aiff), text_mono],
            check=True, capture_output=True,
        )
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(aiff),
             "-codec:a", "libmp3lame", "-b:a", MP3_BITRATE, str(out_mp3)],
            check=True, capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"  FAIL: {out_mp3.name}: {e.stderr.decode()[:200]}")
        return False
    finally:
        if aiff.exists():
            aiff.unlink()
    return True


def main():
    print(f"Generating to {OUT_DIR}\n")
    print("PAGE NARRATIONS:")
    for i, text in enumerate(PAGES):
        out = OUT_DIR / f"narration_p{i}.mp3"
        ok = synthesize(text, out)
        size = f"{out.stat().st_size // 1024}KB" if out.exists() else "—"
        print(f"  [{'OK' if ok else 'XX'}] page {i}: {size}  ({len(text)} chars)")

    print("\nPHOTO NARRATIONS:")
    for key, text in PHOTOS.items():
        out = OUT_DIR / f"photo_{key}.mp3"
        ok = synthesize(text, out)
        size = f"{out.stat().st_size // 1024}KB" if out.exists() else "—"
        print(f"  [{'OK' if ok else 'XX'}] {key}: {size}")

    print(f"\nDone. {len(list(OUT_DIR.glob('*.mp3')))} mp3 files in {OUT_DIR}")


if __name__ == "__main__":
    main()
