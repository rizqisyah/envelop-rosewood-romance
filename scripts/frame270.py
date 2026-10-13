"""
Frame 270 (3014:151), the invitation sheet, 596 x 15058 -- every ART child in Figma paint
order, transcribed from get_design_context, plus the generator that turns it into the band
tables under src/lib/bands/.

    python scripts/frame270.py            # writes src/lib/bands/*.ts + .figma-ref/frame270-layers.json

`z` is the node's index in the frame's child list, which IS the paint order (first = bottom).
TEXT and CSS-drawn children keep their slot in the list (kind 'live') so the z the section
components give their live copy is comparable with the art's -- see SLICING.md.

Geometry is Figma's, not measured: `box` is the node's axis-aligned box in frame px exactly
as get_design_context places it. A rotated or flipped node also carries `inner`, the
unrotated size that is centred in that box and turned (`rot`, then `fy` = scaleY(-1), the
same individual-transform order Tailwind v4 and Figma use -- rot 180 + fy is a plain
horizontal mirror). `crop` is the image's own placement inside the node in % (left, top,
width, height) when Figma crops the fill rather than covering it.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRAME_W, FRAME_H = 596, 15058

# Figma image hash (first 5 hex of the fill's asset name) -> the committed file under
# src/assets/art/. Shared fills are one file: the frame reuses most of its florals.
ASSETS = {
    'f8735': 'date-cartouche', '184a6': 'tree-small', '73d06': 'tree-tall', 'baca6': 'paper',
    '5ec46': 'toile', '849b0': 'oval-florals', 'e7302': 'tree-edge', 'c941e': 'rsvp-cabinet',
    '827a3': 'garden-path', '0e159': 'valley', '8f2fc': 'mirror-frame', 'c7a3d': 'hedge',
    '27873': 'castle', '663eb': 'garden-steps', '1010a': 'meadow', '009a5': 'floral-border-a',
    '0f49d': 'floral-border-b', '807af': 'set-table', '6782a': 'amaranthus',
    '6ce53': 'shield-frame', 'b83f0': 'floral-crown', 'b95fe': 'bride', 'cc286': 'groom',
    'bbdfd': 'envelope', 'b9e5e': 'event-card', 'c252d': 'event-decor', 'a07a5': 'event-frame',
    'c1dc5': 'lace', '16cce': 'iris', 'dfc84': 'orchid', '4696f': 'hero-toile',
    '8224e': 'hero-couple', '7f9ae': 'hero-frame', '6057b': 'sweet-pea',
    'fd55b': 'trumpet-flower', '0988e': 'lily-stem', 'd4127': 'dahlia', 'dcd94': 'vine',
    '41a9a': 'succulent', 'bc3ea': 'leafy-vine', '12633': 'candelabra', '4f721': 'lace-motif',
    'c6139': 'pearls-a', '69f9d': 'pearls-b', '0de6d': 'pearl-swag', 'd1870': 'lilies',
    'c6d30': 'wax-seal', '96422': 'banquet', '1443c': 'side-florals', '8354a': 'tree-edge-b',
    '3a898': 'chairs', '2fca4': 'bouquet', '6130f': 'peony', '40310': 'roses-corner',
    '91cb7': 'flower-bed', '277cd': 'dahlias', 'e2947': 'peony-bouquet', '69eff': 'hydrangea',
    'aa5f7': 'photo-closing', 'b2670': 'heart-seal', '84df4': 'divider',
    '2eccc': 'photo-gallery-1', 'be91f': 'photo-gallery-2', 'c0f62': 'photo-gallery-3',
    'ef39e': 'photo-gallery-4',
    # SVG glows: Figma's foreground-blurred ellipses, kept as the exported SVG.
    'e16f7.svg': 'glow-castle', 'b5138.svg': 'glow-castle', '747e3.svg': 'glow-closing-a',
    '58caf.svg': 'glow-closing-b', '0a28a.svg': 'glow-closing-c', 'a82ac.svg': 'glow-card',
    '7ecc3.svg': 'rsvp-plate', 'b24b1.svg': 'chevron', '497ba.svg': 'chevron',
}

LAYERS = []


def art(z, nid, name, src, box, **o):
    LAYERS.append(dict(z=z, id=nid, name=name, kind='art', src=src, box=box, **o))


def live(z, nid, name):
    """A child the section components draw themselves (text, form chrome, CSS shapes)."""
    LAYERS.append(dict(z=z, id=nid, name=name, kind='live'))


def skip(z, nid, name, why):
    LAYERS.append(dict(z=z, id=nid, name=name, kind='skip', why=why))


M = dict(rot=180, fy=True)  # Figma's horizontal mirror

art(1, '3023:155', 'Open (14) 3', 'f8735', (146, 5971, 304, 304), **M)
art(2, '3026:327', 'Desain tanpa judul (40) 1', '184a6', (275, 3697, 625, 625), **M)
art(3, '3026:326', 'Desain tanpa judul (40) 1', '184a6', (-313, 2387, 625, 625))
art(4, '3014:440', 'image 41', '73d06', (-207, 4844, 436.196, 428.548), inner=(351, 339.35), rot=17.34, crop=(0, 0, 100, 155.59))
art(5, '3014:441', 'image 59', '73d06', (348, 4844, 436.196, 428.548), inner=(351, 339.35), rot=162.66, fy=True, crop=(0, 0, 100, 155.59))
art(6, '3023:275', 'download (42) 2', 'baca6', (-42, -270, 637, 1132))
art(7, '3023:272', 'back', '5ec46', (-53, 13358, 717, 1411), crop=(0, -31.62, 195.26, 131.64))
art(8, '3023:268', 'image 108', '849b0', (0, 9374, 596, 322))
art(9, '3023:259', 'image 106', 'e7302', (469, 10201, 255, 569))
art(10, '3024:299', 'image 114', 'e7302', (-135, 10201, 255, 569), **M)
art(11, '3023:250', 'wood', 'c941e', (133, 12017, 330, 440))
art(12, '3018:657', 'The Wedding of (37) 1', '827a3', (-49, 5095, 855, 855), a=0.9)
art(13, '3018:638', 'image 2', '0e159', (-101, 4757, 714, 714))
art(14, '3018:636', 'Regency frame element', '8f2fc', (-176, 1283, 951, 951))
art(15, '3018:631', 'hedge bush 3', 'c7a3d', (-310, 578, 1172, 657))
skip(16, '3018:564', 'hedge bush 1', 'no visible fill: get_design_context emits an empty box')
skip(17, '3018:593', 'hedge bush 2', 'no visible fill: get_design_context emits an empty box')
art(18, '3018:557', 'white fantasy castle 1', '27873', (180, 2433, 523.232, 655))
art(19, '3018:594', 'white fantasy castle 2', '27873', (-78, 3697, 523.232, 655), **M)
art(20, '3018:558', 'Ellipse 12', 'e16f7.svg', (312, 2916, 384, 214), svg=(46.73, 26.04))
art(21, '3018:595', 'Ellipse 13', 'b5138.svg', (-54.24, 4183, 384, 214), svg=(46.73, 26.04), **M)
art(22, '3018:566', 'front', '663eb', (5, 2952, 690.27, 460))
art(23, '3018:596', 'front', '663eb', (-53.51, 4219, 690.27, 460), **M)
art(24, '3014:156', 'njnjk 1', '1010a', (-116.96, 5150, 746.279, 481))
art(25, '3014:157', 'Open (19) 7', '009a5', (-171, 8950, 355, 367), inner=(367, 355), rot=90, crop=(3.27, 0, 96.73, 100))
art(26, '3014:158', 'Open (19) 8', '0f49d', (418, 8962, 355, 355), rot=90, fy=True)
art(27, '3014:162', 'njnjk 4', '1010a', (-108.96, 8480, 750.933, 484))
art(28, '3023:157', 'set table', '807af', (128, 8480, 459, 459))
art(29, '3014:172', 'Ellipse 11', '747e3.svg', (-146, 12746, 887, 1056), svg=(21.36, 25.43))
art(30, '3023:278', 'Ellipse 14', '58caf.svg', (49, 13426, 496, 1389), svg=(17.71, 49.58))
art(31, '3026:315', 'Ellipse 15', '0a28a.svg', (-254, 14552, 1135, 574), svg=(42.84, 21.67))
art(32, '3026:378', 'image 117', '6782a', (-34, 5235, 180, 544), **M)
art(33, '3026:380', 'image 118', '6782a', (453, 5235, 180, 544))
art(34, '3026:377', 'shield frame', '6ce53', (42, 5095, 511, 800), crop=(-8.02, -0.02, 113.31, 100.05))
art(35, '3014:173', 'Open (20) 1', 'b83f0', (93, 9197, 402, 265), crop=(0.09, -13.43, 100, 151.54), **M)
art(36, '3026:334', 'csac 3', 'b95fe', (237, 3870, 552, 578), crop=(8.36, 0, 104.79, 100), **M)
art(37, '3014:302', 'csac 2', 'cc286', (-54, 2640, 417, 527), crop=(-20.86, -9.3, 138.13, 109.3), **M)
art(38, '3023:277', 'amplop', 'bbdfd', (-28, 14044, 651, 651))
art(39, '3014:175', 'dbfb', 'b9e5e', (63, 6302, 471, 706), inset=(0, 4, 3.1, 'rgba(29, 115, 128, 0.39)'))
art(40, '3023:159', 'dbfb', 'b9e5e', (63, 7374, 471, 706), inset=(0, 4, 3.1, 'rgba(29, 115, 128, 0.39)'))
# Both decors are masked by their card (Group 305 = dbfb): same shape, same alpha.
art(41, '3018:647', 'decor', 'c252d', (112, 6803, 374, 204.368), crop=(0, -0.05, 100, 113.12), mask=('b9e5e', -49, -501, 471, 706))
art(42, '3023:163', 'decor', 'c252d', (112, 7875, 374, 204.368), crop=(0, -0.05, 100, 113.12), mask=('b9e5e', -49, -501, 471, 706))
# get_design_context gives both `opacity-56`, but that is the FILL's opacity and the exported
# fill already carries it: a07a5's alpha tops out at 143 (0.56 x 255), and Figma's own render
# of 3014:176 in isolation tops out at 142. Applying it again halved the frame -- so no `a`.
art(43, '3014:176', 'Open (13) 1', 'a07a5', (24, 6273, 548.23, 763))
art(44, '3023:164', 'Open (13) 2', 'a07a5', (24, 7345, 548.23, 763))
art(45, '3014:181', 'Untitled_Artwork-1 1', 'c1dc5', (-11, 8606, 631.36, 441))
art(46, '3018:646', 'Group 304', 'a82ac.svg', (112, 7038, 374, 131), svg=(76.34, 26.74))
art(47, '3014:207', 'iris 6', '16cce', (464, 6459, 222.963, 301))
art(48, '3023:166', 'iris 11', '16cce', (464, 7531, 222.963, 301))
art(49, '3014:214', 'orchid 1', 'dfc84', (-93, 2781, 164.859, 193.732), inner=(136.219, 172.104), rot=10.32)
art(50, '3018:597', 'orchid 2', 'dfc84', (529, 4033, 164.859, 193.732), inner=(136.219, 172.104), rot=169.68, fy=True)
art(51, '3014:217', 'image 15', '73d06', (-229, 494, 386.553, 550.934), inner=(351, 528), rot=-3.95)
art(52, '3014:218', 'image 16', '73d06', (435, 494, 386.553, 550.934), inner=(351, 528), rot=-176.05, fy=True)
# Frame 2 (3014:219) clips both to its own box, which is theirs to within half a pixel.
art(53, '3014:220', 'Vector 1', '4696f', (80, 409, 437, 688))
art(54, '3014:221', 'br', '8224e', (80, 409, 437, 688))
art(55, '3014:223', 'Open (9) 1', '7f9ae', (-48, 409, 699, 699))
skip(56, '3014:226', 'Group 1', 'an empty Paragraph frame')
live(57, '3014:230', 'Save The Date')
art(58, '3014:235', 'image 7', '6057b', (-163, 269, 393, 290.5))
art(59, '3014:238', 'image 31', '6057b', (424.73, 2818, 342.268, 253), **M)
art(60, '3018:599', 'image 70', '6057b', (-152, 4117, 342.268, 253))
art(61, '3014:242', 'image 10', '6057b', (378, 265, 393, 290.5), **M)
art(62, '3014:243', 'image 8', 'fd55b', (-53, 209, 161.696, 173.233), inner=(104.408, 139.211), rot=31.44)
art(63, '3014:244', 'image 11', 'fd55b', (499.3, 205, 161.696, 173.233), inner=(104.408, 139.211), rot=148.56, fy=True)
art(64, '3014:245', 'image 9', '0988e', (-134, 258, 220, 335))
art(65, '3014:246', 'image 12', '0988e', (522, 254, 220, 335), **M)
art(66, '3014:247', 'dahlia 1', 'd4127', (-82, 314, 186.551, 166.406), inner=(125, 156), rot=72.35)
live(67, '3014:251', 'countdown')
live(68, '3014:297', 'greeting')
live(69, '3014:299', 'journey together')
art(70, '3014:303', 'image 28', 'dcd94', (-101, 2684, 202, 526))
art(71, '3018:612', 'image 72', 'dcd94', (495, 3956, 202, 526), **M)
live(72, '3014:327', 'And')
live(73, '3014:330', 'Q.S. Surah')
live(74, '3014:332', 'ayah')
art(75, '3014:337', 'succulent 9', '41a9a', (514, 6619, 149, 181))
art(76, '3026:322', 'succulent 23', '41a9a', (-61, 4448, 149, 181))
art(77, '3023:168', 'succulent 22', '41a9a', (514, 7691, 148.221, 181))
art(78, '3014:339', 'image 42', 'bc3ea', (418.96, 6541, 348.36, 454.72), inner=(435.614, 322), rot=-93.55)
art(79, '3023:169', 'image 75', 'bc3ea', (418.96, 7613, 348.36, 454.72), inner=(435.614, 322), rot=-93.55)
art(80, '3014:348', 'Open (14) 2', 'f8735', (146, 7036, 304, 304), **M)
art(81, '3024:282', 'Desain tanpa judul (38) 2', '12633', (-176, 13073, 438, 438))
art(82, '3024:295', 'Desain tanpa judul (38) 3', '12633', (347, 13073, 438, 438), **M)
live(83, '3014:349', 'akad date')
live(84, '3014:350', 'akad weekday')
art(85, '3014:352', 'Open (2) 4', '4f721', (-179, 7157, 365, 365), **M)
# `object-bottom` with no object-fit: the fill is stretched to the box, as Figma draws it.
art(86, '3014:364', 'pearls 2', 'c6139', (3, 8866, 303, 161), fit='fill', **M)
art(87, '3014:365', 'pearls 3', '69f9d', (290, 8866, 303, 161), fit='fill')
live(88, '3014:368', 'dresscode palette + note')
live(89, '3014:375', 'gallery oval')
live(90, '3014:378', 'gallery thumbnails')
live(91, '3014:388', 'gallery prev plate')
live(92, '3014:389', 'gallery next plate')
live(93, '3014:390', 'gallery prev chevron')
live(94, '3014:391', 'gallery next chevron')
live(95, '3014:392', 'video slot')
art(96, '3014:395', 'pearl swag', '0de6d', (-19, 10001, 633.209, 188), fit='fill')
live(97, '3014:396', 'gift accounts')
art(98, '3014:444', 'image 62', 'd1870', (530, 10836, 148, 176))
art(99, '3014:445', 'image 63', 'd1870', (-82, 10836, 148, 176), **M)
art(100, '3014:447', 'Open (21) 1', 'c6d30', (244, 347, 124, 124), shadow=(0, 8, 0, 'rgba(0, 0, 0, 0.16)'))
live(101, '3014:448', 'Dresscode')
live(102, '3014:449', 'Our Dearest Memories')
live(103, '3014:450', 'Wedding Gift')
live(104, '3014:451', 'Wedding Wishes')
live(105, '3014:452', 'Portraits of Affection')
live(106, '3014:453', 'Scenes from a love story')
live(107, '3014:456', 'wish field')
live(108, '3014:458', 'wish Send')
live(109, '3014:460', 'Show more')
live(110, '3014:462', 'name field')
live(111, '3014:464', 'wish date 1')
live(112, '3014:465', 'wish date 2')
live(113, '3014:466', 'wish name 1')
live(114, '3014:467', 'wish name 2')
live(115, '3014:468', 'wish message 1')
live(116, '3014:469', 'wish message 2')
art(117, '3014:472', 'Ellipse 9', '7ecc3.svg', (130, 12369, 335.798, 148), svg=(0, 0))
live(118, '3014:473', 'Rsvp')
live(119, '3014:474', 'rsvp lede')
live(120, '3014:476', 'rsvp fields')
live(121, '3014:486', 'rsvp Send')
live(122, '3014:495', 'closing message')
live(123, '3014:496', 'Thank You !')
live(124, '3014:497', 'closing signature')
live(125, '3024:308', 'With Love,')
skip(126, '3014:503', 'Buat video prewed', "the designer's note on the video slot, not copy")
skip(127, '3014:504', 'Mask group', 'empty')
art(128, '3026:314', 'last', '96422', (-92, 14588, 779, 464))
skip(129, '3023:173', 'Mask group', 'empty')
live(130, '3014:507', 'akad details')
live(131, '3014:509', 'akad title')
art(132, '3023:219', 'image 95', '1443c', (-5, 7397, 223, 478))
live(133, '3018:629', 'hero copy')
live(134, '3014:535', 'credit bar')
art(135, '3014:250', 'image 20', '8354a', (512, 2724, 191, 251), a=0.83, crop=(0, 0, 100, 241.83))
art(136, '3018:616', 'image 73', '8354a', (-90, 3956, 191, 251), a=0.83, crop=(0, 0, 100, 241.83), **M)
art(137, '3018:630', 'chairs', '3a898', (200, 1777, 223.756, 296.601))
art(138, '3018:637', 'Desain tanpa judul (32) 1', '2fca4', (342, 1407, 260, 260))
art(139, '3023:196', 'image 78', '8354a', (-93, 6981, 191, 569), a=0.83, crop=(0, 0, 100, 106.68), **M)
art(140, '3023:198', 'image 79', '8354a', (496, 6981, 191, 569), a=0.83, crop=(0, 0, 100, 106.68))
art(141, '3023:208', 'image 90', '6130f', (-34, 8675, 223, 304))
art(142, '3023:211', 'image 91', '6782a', (-1, 7797, 146, 442))
art(143, '3023:214', 'image 93', '6782a', (0, 6684, 146, 442))
art(144, '3023:213', 'image 92', '6782a', (452, 7797, 146, 442), **M)
art(145, '3023:215', 'image 94', '6782a', (450, 6684, 146, 442), **M)
art(146, '3023:222', 'image 96', '40310', (399, 985, 198, 373))
art(147, '3023:224', 'image 97', '40310', (0, 985, 198, 373), **M)
art(148, '3023:227', 'image 98', '91cb7', (-56, 2985, 545, 504))
art(149, '3023:229', 'image 99', '91cb7', (101, 4252, 545, 504), **M)
art(150, '3023:231', 'image 100', '1443c', (-12, 567, 223, 478))
art(151, '3023:233', 'image 101', '1443c', (378, 567, 223, 478), **M)
art(152, '3023:244', 'image 102', '277cd', (-176, 10556, 375, 311))
art(153, '3023:246', 'image 103', '277cd', (391, 10556, 375, 311), **M)
art(154, '3023:247', 'image 104', '6130f', (-60, 10663, 223, 304))
art(155, '3023:249', 'image 105', '6130f', (433, 10663, 223, 304), **M)
art(156, '3023:251', 'image 91', '6782a', (-3, 11904, 146, 442))
art(157, '3023:252', 'image 92', '6782a', (450, 11904, 146, 442), **M)
art(158, '3024:286', 'image 110', 'e2947', (453, 5841, 245, 349))
art(159, '3024:287', 'image 111', 'e2947', (-99, 5841, 245, 349), **M)
art(160, '3024:289', 'image 112', 'bc3ea', (-168, 13187, 258.369, 337.254), inner=(323.084, 238.819), rot=-93.55)
art(161, '3024:291', 'image 113', 'bc3ea', (505, 13187, 258.369, 337.254), inner=(323.084, 238.819), rot=-86.45, fy=True)
art(162, '3024:292', 'image 110', 'e2947', (466, 13286, 273.08, 389))
art(163, '3024:293', 'image 111', 'e2947', (-140, 13287, 273.08, 389), **M)
art(164, '3024:301', 'Desain tanpa judul (39) 1', '69eff', (-109, 13304, 213, 213))
art(165, '3024:303', 'Desain tanpa judul (39) 2', '69eff', (473.73, 13303, 213, 213), **M)
art(166, '3024:304', 'Rectangle 157', 'baca6', (134.0035, 13782, 333.913, 512), radius=192.146, shadow=(0, 4, 4, 'rgba(0, 0, 0, 0.78)'))
art(167, '3024:306', 'Rectangle 158', '5ec46', (149.2345, 13797.23, 303.451, 482.709), radius=181.154, crop=(-12.2, -79.89, 230.87, 192.76), inset=(0, 4, 4, 'rgba(0, 0, 0, 0.52)'))
art(168, '3024:307', 'Rectangle 159', 'aa5f7', (149.2345, 13797.23, 303.451, 482.709), radius=181.154, crop=(-43.25, 9.68, 193.71, 124.98))
art(169, '3023:279', 'Desain tanpa judul (37) 1', 'b2670', (410, 13971, 116, 116), shadow=(0, 4, 6.4, 'rgba(0, 0, 0, 0.33)'))
art(170, '3024:310', 'image 91', '6782a', (-3, 13417, 146, 442))
art(171, '3024:311', 'image 92', '6782a', (450, 13417, 146, 442), **M)
art(172, '3026:318', 'image 115', '1443c', (388, 3403, 223, 478), **M)
art(173, '3026:320', 'image 116', '1443c', (-10, 3403, 223, 478))
art(174, '3026:323', 'succulent 24', '41a9a', (513, 3496, 149, 181))
art(175, '3026:331', 'dahlia 2', 'd4127', (499, 314, 186.551, 166.406), inner=(125, 156), rot=107.65, fy=True)
live(176, '3014:274', 'first person details')
skip(177, '3026:332', 'Heading 3', 'an empty heading frame')
live(178, '3026:333', 'first call name')
live(179, '3026:339', 'second person details')
live(180, '3026:349', 'second call name')
live(181, '3026:350', 'resepsi date')
live(182, '3026:351', 'resepsi weekday')
live(183, '3026:363', 'resepsi details')
art(184, '3026:381', 'Desain tanpa judul (36) 1', '84df4', (213, 5683, 169, 90))

# Band tops, frame px. A layer belongs to the band its box TOP lands in unless BAND_OF says
# otherwise; heights are the distance to the next top, and art simply paints past a seam.
BANDS = [
    ('hero', 0),
    ('countdown', 1160),
    ('greeting', 2230),
    ('groom', 2400),
    ('bride', 3690),
    ('quote', 4750),
    ('akad', 5830),
    ('resepsi', 7030),
    ('dresscode', 8190),
    ('gallery', 9030),
    ('gift', 10200),
    ('wishes', 10990),
    ('rsvp', 11904),
    ('closing', 13060),
]
BAND_OF = {
    # Ellipse 11's node starts at 12746, inside rsvp, but it is the closing band's fog: it
    # whites out the toile wall behind "Thank You !". Revealed with rsvp it is missing
    # whenever the closing band is reached without rsvp having assembled first.
    '3014:172': 'closing',
}


def band_for(layer):
    if layer['id'] in BAND_OF:
        return BAND_OF[layer['id']]
    top = layer['box'][1]
    name = BANDS[0][0]
    for b, t in BANDS:
        if top >= t:
            name = b
    return name


def placed(layer):
    """The unrotated element box: `inner` centred in the axis-aligned `box`."""
    x, y, w, h = layer['box']
    if 'svg' in layer:
        # The SVG carries its blur's bleed: Figma insets it by -t%/-l% of the node box.
        t, l = layer['svg']
        return x - w * l / 100, y - h * t / 100, w * (1 + 2 * l / 100), h * (1 + 2 * t / 100)
    if 'inner' in layer:
        iw, ih = layer['inner']
        return x + w / 2 - iw / 2, y + h / 2 - ih / 2, iw, ih
    return x, y, w, h


def r(v):
    v = round(v, 2)
    return int(v) if v == int(v) else v


def ts_layer(layer, top):
    x, y, w, h = placed(layer)
    src = layer['src']
    name = ASSETS[src]
    ext = 'svg' if src.endswith('.svg') else 'webp'
    parts = [
        f"z: {layer['z']}",
        f"id: '{layer['id']}'",
        f"src: art['{name}.{ext}']",
        f'x: {r(x)}',
        f'y: {r(y - top)}',
        f'w: {r(w)}',
        f'h: {r(h)}',
    ]
    if layer.get('rot'):
        parts.append(f"r: {r(layer['rot'])}")
    if layer.get('fy'):
        parts.append('fy: true')
    if 'crop' in layer:
        parts.append('crop: [' + ', '.join(str(r(v)) for v in layer['crop']) + ']')
    if layer.get('fit'):
        parts.append(f"fit: '{layer['fit']}'")
    if 'a' in layer:
        parts.append(f"a: {layer['a']}")
    if 'radius' in layer:
        parts.append(f"radius: {r(layer['radius'])}")
    if 'shadow' in layer:
        sx, sy, blur, col = layer['shadow']
        parts.append(f"shadow: [{r(sx)}, {r(sy)}, {r(blur)}, '{col}']")
    if 'inset' in layer:
        sx, sy, blur, col = layer['inset']
        parts.append(f"inset: [{r(sx)}, {r(sy)}, {r(blur)}, '{col}']")
    if 'mask' in layer:
        m_src, mx, my, mw, mh = layer['mask']
        parts.append(f"mask: {{ src: art['{ASSETS[m_src]}.webp'], x: {r(mx)}, y: {r(my)}, w: {r(mw)}, h: {r(mh)} }}")
    return '  { ' + ', '.join(parts) + ' },'


def main():
    tops = dict(BANDS)
    names = [b for b, _ in BANDS]
    heights = {}
    for i, (b, t) in enumerate(BANDS):
        nxt = BANDS[i + 1][1] if i + 1 < len(BANDS) else FRAME_H
        heights[b] = nxt - t

    by_band = {b: [] for b in names}
    for layer in LAYERS:
        if layer['kind'] == 'art':
            by_band[band_for(layer)].append(layer)

    out_dir = os.path.join(ROOT, 'src', 'lib', 'bands')
    os.makedirs(out_dir, exist_ok=True)
    for b in names:
        top = tops[b]
        lines = (["import { art } from '../artAssets'"] if by_band[b] else []) + [
            "import type { BandLayer } from '../bandLayer'",
            '',
            '// Generated by scripts/frame270.py -- do not hand-edit; change the script and rerun.',
            f'// Frame 270 (3014:151) band "{b}": y {top}..{top + heights[b]}, {heights[b]} design px.',
            '// x/y are band-local design px; `z` is the GLOBAL Figma paint order, so layers stack',
            '// correctly against the bands above and below this one.',
            '',
            f'export const BAND_TOP = {top}',
            f'export const BAND_HEIGHT = {heights[b]}',
            '',
            'export const LAYERS: BandLayer[] = [',
        ]
        lines += [ts_layer(l, top) for l in by_band[b]]
        lines.append(']')
        with open(os.path.join(out_dir, f'{b}.ts'), 'w', encoding='utf-8', newline='\n') as f:
            f.write('\n'.join(lines) + '\n')

    ref = {
        'frame': {'id': '3014:151', 'name': 'Frame 270', 'w': FRAME_W, 'h': FRAME_H, 'fill': '#efe8de'},
        'bands': [{'name': b, 'top': tops[b], 'height': heights[b]} for b in names],
        'layers': [dict(l, band=band_for(l) if l['kind'] == 'art' else None) for l in LAYERS],
        'assets': ASSETS,
    }
    os.makedirs(os.path.join(ROOT, '.figma-ref'), exist_ok=True)
    with open(os.path.join(ROOT, '.figma-ref', 'frame270-layers.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(ref, f, indent=1, ensure_ascii=False)

    zs = [l['z'] for l in LAYERS]
    assert zs == list(range(1, len(zs) + 1)), 'z must be the contiguous paint order'
    for b in names:
        print(f'{b:10s} top {tops[b]:5d} h {heights[b]:5d}  {len(by_band[b]):3d} layers')
    print('art layers:', sum(len(v) for v in by_band.values()), ' total children:', len(LAYERS))


if __name__ == '__main__':
    main()
