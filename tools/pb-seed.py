#!/usr/bin/env python3
"""
Seed church_pages + church_animations with the book content.
Idempotent: looks up existing record by `order` and updates if found.

Usage:
    PB_TOKEN=... python3 tools/pb-seed.py
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error

PB_URL   = os.environ.get("PB_URL", "https://yms.galerra.art")
PB_TOKEN = os.environ.get("PB_TOKEN")
if not PB_TOKEN:
    sys.exit("PB_TOKEN env required")

HEADERS = {
    "Authorization": PB_TOKEN,
    "Content-Type":  "application/json",
    # Cloudflare blocks default Python urllib UA (error 1010).
    "User-Agent":    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}

# ---------------------------------------------------------------------------
# 16 pages = 8 sheets × 2 sides (front + back)
# Content mirrors the book's inline PAGES at the time of seeding.
# Photo / audio files are NOT uploaded here — admin uploads via the UI.
# /book reads PB; if a photo is missing it falls back to inline defaults.
# ---------------------------------------------------------------------------
PAGES = [
    # sheet 0 — Cover + intro
    dict(order=0, type="cover",label="Ἐξώφυλλο",
         eyebrow="", title="Ι.Ν.\nἉγίου\nἈνδρέου",       date="",
         lead="", body="Ὁ καθεδρικὸς τῶν Πατρῶν · τὸ χρονικὸ ἀνεγέρσεως",
         photo_title="", photo_cap="", photo_desc="", photo_italic=""),

    dict(order=1, type="page",label="Πρόλογος",
         eyebrow="πρόλογος", title="Ὁ πολιοῦχος\nτῶν Πατρῶν", date="",
         lead="Ἡ εὐλάβεια καὶ ἡ τιμὴ τῶν Πατρέων πρὸς τὸν ἔνδοξον πολιοῦχον τῶν Πατρῶν, τοὺς ὡδήγησαν εἰς τὴν ἀπόφασιν νὰ ἀνεγείρουν Ναὸν ἀντάξιον τοῦ Πρωτοκλήτου τῶν Ἀποστόλων.",
         body="Πάτησε σὲ μιὰ φωτογραφία γιὰ νὰ τὴν δεῖς ἀπὸ κοντά. Στὶς ἑπόμενες σελίδες, τὸ χρονικὸ ἀνεγέρσεως ἀπὸ τὸν διαγωνισμὸ τοῦ 1902 ἕως τὶς ἀνακαινίσεις τοῦ 21ου αἰῶνος.",
         photo_title="Σχέδιο θεμελίων",
         photo_cap="σχέδιο θεμελίων · 1908",
         photo_desc="Λεπτομερὲς ἀρχιτεκτονικὸ σχέδιο τῶν θεμελίων τοῦ Ἱεροῦ Ναοῦ, ὑπογεγραμμένον ἀπὸ τὸν Αἰμίλιον Ρομπέρ.",
         photo_italic="1ᾳ Ἰουνίου 1908 — κατάθεσις ὑπὸ Βασιλέως Γεωργίου Α´."),

    # sheet 1 — TOC + chapter A
    dict(order=2, type="page",label="Περιεχόμενα",
         eyebrow="Περιεχόμενα", title="Τὸ Χρονικὸ\nτῆς Ἀνεγέρσεως", date="",
         lead="", body="", photo_title="", photo_cap="", photo_desc="", photo_italic=""),

    dict(order=3, type="page",label="α´ Μελέτη",
         eyebrow="κεφάλαιο α´", title="Ἀρχιτεκτονικὴ\nΜελέτη", date="1902 — διεθνὴς διαγωνισμός",
         lead="Πρὸς τοῦτο προεκηρύχθη διεθνὴς διαγωνισμὸς τὸ ἔτος 1902 διὰ τὴν ἐκπόνησιν Ἀρχιτεκτονικῆς μελέτης.",
         body="Ὑπεβλήθηκαν 32 μελέται ἀπὸ Ἕλληνας καὶ ξένους ἀρχιτέκτονας, ἐκ τῶν ὁποίων ἐθεωρήθησαν μόνον 8 ἱκαναί.",
         photo_title="Σχέδιο τοῦ Ρομπέρ",
         photo_cap="ἀρχιτεκτονικὸ σχέδιο · ρομπὲρ",
         photo_desc="Ἡ μελέτη τοῦ Γάλλου ἀρχιτέκτονος Αἰμιλίου Ρομπέρ, ἡ ὁποία ἔλαβε τὸ πρῶτο βραβεῖον τοῦ διεθνοῦς διαγωνισμοῦ τοῦ 1902.",
         photo_italic="πρῶτο βραβεῖο, Ἀκαδημία Βερολίνου"),

    # sheet 2 — reactions + foundation 1908
    dict(order=4, type="page",label="α´ Ἀντιδράσεις",
         eyebrow="κεφάλαιο α´ · συνέχεια", title="Ἀντιδράσεις\n& κριτική", date="",
         lead="Πρὸ τῆς θεμελιώσεως ὑπῆρξε σφοδρὰ κριτική, διότι ἐθεωρήθη ὅτι δὲν ἀνταπεκρίνετο εἰς τὴν Ὀρθόδοξον ἐκκλησιαστικὴν παράδοσιν.",
         body="Ἦτο εὐνόητον, ὅτι ὁ ἐκπονήσας τὸ σχέδιον Γάλλος μηχανικός, νὰ εἶχεν ἐπηρεασθῆ ἀπὸ τὴν Δυτικὴν παράδοσιν.",
         photo_title="Τροποποιημένη μελέτη",
         photo_cap="τροποποιημένα σχέδια",
         photo_desc="Μετὰ τὶς ἔντονες ἀντιδράσεις, ὁ Ρομπὲρ ὑπεχρεώθη νὰ τροποποιήσει τὴν μελέτη του.",
         photo_italic="1907 · ἔγκρισις τῆς τροποποιημένης μελέτης"),

    dict(order=5, type="page",label="β´ Θεμέλιος λίθος",
         eyebrow="κεφάλαιο β´", title="Ὁ θεμέλιος\nλίθος", date="1ᾳ Ἰουνίου 1908",
         lead="Τὴν 1ην Ἰουνίου τοῦ 1908 κατετέθη ὁ θεμέλιος λίθος ἀπὸ τὸν τότε Βασιλέα Γεώργιο Α´.",
         body="Προεξάρχοντος τῆς λαμπρᾶς τελετῆς, τοῦ μακαριστοῦ Μητροπολίτου Πατρῶν Ἀντωνίου Παράσχη.",
         photo_title="Τελετὴ θεμελιώσεως",
         photo_cap="τελετὴ θεμελιώσεως · 1908",
         photo_desc="Ἡ ἱστορικὴ φωτογραφία τῆς θεμελιώσεως τοῦ Ναοῦ, μὲ τὸν Βασιλέα Γεώργιο Α´.",
         photo_italic="1 Ἰουνίου 1908"),

    # sheet 3 — interruptions + reconstruction
    dict(order=6, type="page",label="β´ Διακοπές",
         eyebrow="κεφάλαιο β´ · συνέχεια", title="Διακοπὲς\n& ἀναμονή", date="",
         lead="",
         body="Τὰς προετοιμασίας προέλαβαν: ὁ Α´ Παγκόσμιος Πόλεμος, ἡ Μικρασιατικὴ Καταστροφή, ἡ οἰκονομικὴ ὕφεσις, ὁ σεισμὸς τῆς Κορίνθου (1928).",
         photo_title="Ἐργασίες θεμελιώσεως",
         photo_cap="ἐργασίες θεμελιώσεως",
         photo_desc="Στιγμιότυπο ἀπὸ τὶς πρῶτες ἐργασίες θεμελιώσεως τοῦ Ναοῦ.",
         photo_italic=""),

    dict(order=7, type="page",label="γ´ Ἀνοικοδόμησις",
         eyebrow="κεφάλαιο γ´", title="Ἀνοικοδόμησις", date="1932 — 1937",
         lead="Τὸ ἔτος 1932 ἀπεφασίστη ἡ ἀνοικοδόμησις τοῦ Ναοῦ μὲ ὁπλισμένον σκυρόδεμα.",
         body="Τὸ φθινόπωρον τοῦ 1936 ὁλοκληρώθη τὸ κεντρικὸν τμῆμα.",
         photo_title="Ἀνοικοδόμησις τοῦ τρούλου",
         photo_cap="ἐργασίες ἀνοικοδομήσεως",
         photo_desc="Φωτογραφικὸ ντοκουμέντο ἀπὸ τὶς ἐργασίες κατασκευῆς τοῦ κεντρικοῦ τρούλου.",
         photo_italic=""),

    # sheet 4 — inauguration + interior
    dict(order=8, type="page",label="δ´ Ἐγκαίνια",
         eyebrow="κεφάλαιο δ´", title="Ἐγκαίνια", date="26 Σεπτεμβρίου 1974",
         lead="Ὁ Ναὸς ἐγκαινιάσθη λαμπρῶς τὴν 26ην Σεπτεμβρίου 1974.",
         body="Ἑξήντα ἕξι ἔτη μετὰ τὴν ἀρχικὴν θεμελίωσιν.",
         photo_title="Τελετὴ ἐγκαινίων",
         photo_cap="τὰ ἐγκαίνια · 1974",
         photo_desc="Ἡ μεγαλειώδης τελετὴ τῶν ἐγκαινίων τοῦ Ναοῦ.",
         photo_italic="26 Σεπτεμβρίου 1974"),

    dict(order=9, type="page",label="δ´ Ἐσωτερικός",
         eyebrow="κεφάλαιο δ´ · συνέχεια", title="Ὁ ἐσωτερικὸς\nδιάκοσμος", date="",
         lead="",
         body="Συνεπληρώθη ὁ ἐσωτερικὸς διάκοσμος ὑπὸ τοῦ ἁγιογράφου μακαριστοῦ Ἰωάννου Καρούσου.",
         photo_title="Ὁ ἐσωτερικὸς διάκοσμος",
         photo_cap="ὁ ἐσωτερικὸς χῶρος",
         photo_desc="Ἡ ἁγιογράφησις τῆς κόγχης τοῦ Ἱεροῦ καὶ τοῦ τρούλου.",
         photo_italic=""),

    # sheet 5 — stats + cross 1980
    dict(order=10, type="page",label="ε´ Στοιχεῖα",
         eyebrow="κεφάλαιο ε´", title="Στοιχεῖα\nτοῦ Ναοῦ", date="",
         lead="", body="Συνολικὴ ἐπιφάνεια 1.900 m². Χωρητικότης 6.500 ἄτομα. Ὕψος τρούλου 40,5 μ. Ὁ κεντρικὸς τροῦλος περιστοιχίζεται ἀπὸ 12 ἄλλους τρούλους, οἱ ὁποῖοι συμβολίζουν τὸν Ἰησοῦν μὲ τοὺς 12 Ἀποστόλους.",
         photo_title="", photo_cap="", photo_desc="", photo_italic=""),

    dict(order=11, type="page",label="ϛ´ Ὁ Σταυρός",
         eyebrow="κεφάλαιο ϛ´", title="Ὁ Σταυρὸς\nτοῦ Ἁγίου", date="1980",
         lead="Ἐτοποθετήθη ὁ Σταυρὸς τοῦ Ἁγίου Ἀνδρέου εἰς πολύτιμον ἀργυροχρυσοποίκιλτον θήκην.",
         body="",
         photo_title="Ὁ Σταυρὸς τοῦ Ἁγίου Ἀνδρέου",
         photo_cap="ὁ Σταυρὸς τοῦ Ἁγίου · 1980",
         photo_desc="Ὁ Σταυρὸς τοῦ Πρωτοκλήτου Ἀποστόλου, εἰς πολύτιμον ἀργυροχρυσοποίκιλτον θήκην.",
         photo_italic="ἐπιστροφὴ τοῦ ἱεροῦ συμβόλου"),

    # sheet 6 — enthronement 2005 + renovations
    dict(order=12, type="page",label="ζ´ Χρυσόστομος",
         eyebrow="κεφάλαιο ζ´", title="Μητροπολίτης\nΧρυσόστομος", date="Φεβρουάριος 2005",
         lead="Τὸν Φεβρουάριον τοῦ 2005 ἐχειροτονήθη Μητροπολίτης Πατρῶν, ὁ Ἀρχιμ. Χρυσόστομος Σκλήφας.",
         body="Ἐνεθρονίσθη τὴν 2αν Ἀπριλίου, παρουσίᾳ τοῦ μακαριστοῦ Ἀρχιεπισκόπου Χριστοδούλου.",
         photo_title="Ἐνθρόνισις",
         photo_cap="ἐνθρόνισις · 2 Ἀπριλίου 2005",
         photo_desc="Ἡ ἐνθρόνισις τοῦ Μητροπολίτου Χρυσοστόμου εἰς τὸν Ἱερὸν Ναὸν τοῦ Ἀποστόλου Ἀνδρέου.",
         photo_italic="2 Ἀπριλίου 2005"),

    dict(order=13, type="page",label="ζ´ Ἀνακαινίσεις",
         eyebrow="κεφάλαιο ζ´ · συνέχεια", title="Ἀνακαινίσεις", date="",
         lead="Ἀνεκαινίσθη ἐκ βάθρων ὁ Παλαιὸς Ἱερὸς Ναός.",
         body="Στεγανοποίησις τῆς στέγης, ἀνακαίνισις τῶν ἐξωτερικῶν ἐπιφανειῶν, ὁλοκλήρωσις τῆς ἁγιογραφήσεως, δημιουργία Μουσείου & Βιβλιοθήκης, κατασκευὴ ἀνελκυστῆρος.",
         photo_title="", photo_cap="", photo_desc="", photo_italic=""),

    # sheet 7 — epilogue + back cover
    dict(order=14, type="page",label="τέλος",
         eyebrow="τέλος", title="Πνευματικὸν\nκέντρον", date="",
         lead="Ἀξιοποιήθη ὁ χῶρος ἔναντι τοῦ Ἱεροῦ Ναοῦ καὶ λειτουργεῖ πνευματικὸν κέντρον.",
         body="πηγή · ἐκπαιδευτικὸ ὑλικό\nἹ. Ν. Ἁγίου Ἀνδρέου Πατρῶν\nthree.js · webxr · paper & light — mmxxvi",
         photo_title="", photo_cap="", photo_desc="", photo_italic=""),

    dict(order=15, type="back-cover",label="Ὀπισθόφυλλο",
         eyebrow="", title="Ἀπόστολος\nἈνδρέας\nὁ Πρωτόκλητος", date="",
         lead="", body="πολιοῦχος τῶν Πατρῶν · τρισδιάστατη ἐκπαιδευτικὴ ἐφαρμογή",
         photo_title="", photo_cap="", photo_desc="", photo_italic=""),
]

# ---------------------------------------------------------------------------
# 2 default animations driving the photo modal (image + info side)
# ---------------------------------------------------------------------------
ANIMATIONS = [
    dict(anim_name="photoModalOpen", duration=0.7, loop=False,
         description="Φωτογραφία ξεπροβάλλει με bounce και η περιγραφὴ ἔρχεται ἀπὸ δεξιά",
         tracks=[
            { "target": "modalImg", "properties": {
                "scale":    [{ "t":0.0, "value":0.65, "ease":"easeOutBack" }, { "t":0.78, "value":1.04 }, { "t":1.0, "value":1.0 }],
                "rotation": [{ "t":0.0, "value":-0.035, "ease":"easeOutCubic" }, { "t":0.55, "value":0.008 }, { "t":1.0, "value":0 }],
                "opacity":  [{ "t":0.0, "value":0, "ease":"easeOutCubic" }, { "t":0.45, "value":1 }, { "t":1.0, "value":1 }],
            }},
            { "target": "modalInfo", "properties": {
                "translateX": [{ "t":0.0, "value":40, "ease":"easeOutCubic" }, { "t":0.3, "value":40 }, { "t":1.0, "value":0 }],
                "opacity":    [{ "t":0.0, "value":0 }, { "t":0.3, "value":0, "ease":"easeOutCubic" }, { "t":1.0, "value":1 }],
            }},
         ],
         track_locks={}),

    dict(anim_name="photoModalClose", duration=0.35, loop=False,
         description="Κλείσιμο modal — γρήγορο fade-out",
         tracks=[
            { "target": "modalImg", "properties": {
                "scale":   [{ "t":0.0, "value":1.0, "ease":"easeInCubic" }, { "t":1.0, "value":0.85 }],
                "opacity": [{ "t":0.0, "value":1.0, "ease":"easeInCubic" }, { "t":1.0, "value":0 }],
            }},
            { "target": "modalInfo", "properties": {
                "translateX": [{ "t":0.0, "value":0, "ease":"easeInCubic" }, { "t":1.0, "value":30 }],
                "opacity":    [{ "t":0.0, "value":1, "ease":"easeInCubic" }, { "t":1.0, "value":0 }],
            }},
         ],
         track_locks={}),
]


def api(path, method="GET", body=None):
    url  = PB_URL + path
    data = json.dumps(body).encode() if body is not None else None
    req  = urllib.request.Request(url, data=data, method=method, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  HTTP {e.code} on {method} {path}: {body[:300]}")
        raise


def upsert(collection, filter_q, body):
    """Find by filter; if found PATCH, else POST."""
    q = urllib.parse.urlencode({"filter": filter_q, "perPage": 1})
    found = api(f"/api/collections/{collection}/records?{q}").get("items", [])
    if found:
        rid = found[0]["id"]
        return api(f"/api/collections/{collection}/records/{rid}", method="PATCH", body=body)
    return api(f"/api/collections/{collection}/records", method="POST", body=body)


def main():
    print(f"PB_URL = {PB_URL}\n")

    print("• seeding church_pages (16 records)")
    for p in PAGES:
        r = upsert("church_pages", f"order = {p['order']}", p)
        print(f"  [{p['order']:2}] {p['label']:24s} → {r['id']}")

    print("\n• seeding church_animations (2 records)")
    for a in ANIMATIONS:
        # filter expression with quoted string
        name = a["anim_name"].replace('"', '\\"')
        r = upsert("church_animations", f'anim_name = "{name}"', a)
        print(f"  {a['anim_name']:22s} → {r['id']}")

    print("\nDone.")


if __name__ == "__main__":
    main()
