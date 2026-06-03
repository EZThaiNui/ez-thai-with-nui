// =====================================================================
// Thai consonants data — Khruu Nui's romanization system.
// Replace `image` and `audio` URLs with your own Cloudinary links.
//
// Romanization rules (Khruu Nui):
//   - Learner-friendly phonetics (not IPA)
//   - Tone marks placed on the vowel:
//       ˆ falling, ́ rising, ̀ low,  ̌ marker for rising (e.g. nǔu)
//   - Use dt for ต (between t and d)
//   - Use bp for ป (between p and b)
//   - Use ʉ for short Thai ึ  (e.g. ผึ้ง → phʉ̂ng)
//   - Use ʉʉ for long Thai ือ (e.g. ฤๅษี → rʉʉ-sǐi)
//   - Hyphens separate Thai syllables
// =====================================================================
const CONSONANTS = [
  // ===== Middle class (อักษรกลาง — 9 letters) =====
  { letter: "ก", name: "ก ไก่",      roman: "gaw-gài",        sound: "g",          class: "Middle", meaning: "chicken",        image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260471/%E0%B8%81_hwkuxg.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185802/%E0%B8%81_btfslg.m4a" },
  { letter: "ข", name: "ข ไข่",      roman: "khaw-khài",      sound: "kh",         class: "High",   meaning: "egg",            image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260467/%E0%B8%82_fhzn1y.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185802/%E0%B8%82_rnr1wj.m4a" },
  { letter: "ฃ", name: "ฃ ขวด",     roman: "khaw-khùat",     sound: "kh",         class: "High",   meaning: "bottle (obs.)",  image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260467/%E0%B8%83_xitast.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185802/%E0%B8%83_tcu4kg.m4a" },
  { letter: "ค", name: "ค ควาย",    roman: "khaw-khwaai",    sound: "kh",         class: "Low",    meaning: "buffalo",        image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778261307/%E0%B8%84_rpx2s5.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185803/%E0%B8%84_fo2e54.m4a" },
  { letter: "ฅ", name: "ฅ คน",      roman: "khaw-khon",      sound: "kh",         class: "Low",    meaning: "person (obs.)",  image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260463/%E0%B8%85_vrml9w.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185802/%E0%B8%85_dxfkbe.m4a" },
  { letter: "ฆ", name: "ฆ ระฆัง",   roman: "khaw-rá-khang",  sound: "kh",         class: "Low",    meaning: "bell",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260462/%E0%B8%86_tuyxrq.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185801/%E0%B8%86_riewtb.m4a" },
  { letter: "ง", name: "ง งู",       roman: "ngaw-nguu",      sound: "ng",         class: "Low",    meaning: "snake",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260459/%E0%B8%87%E0%B8%B9_iifqnt.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185801/%E0%B8%87_emrtmh.m4a" },
  { letter: "จ", name: "จ จาน",     roman: "jaw-jaan",       sound: "j",          class: "Middle", meaning: "plate",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260456/%E0%B8%88_gpdeqo.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185801/%E0%B8%88_e2t0wm.m4a" },
  { letter: "ฉ", name: "ฉ ฉิ่ง",     roman: "chaw-chìng",     sound: "ch",         class: "High",   meaning: "cymbals",        image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260455/%E0%B8%89_j3baoe.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185801/%E0%B8%89_slfaau.m4a" },
  { letter: "ช", name: "ช ช้าง",    roman: "chaw-cháang",    sound: "ch",         class: "Low",    meaning: "elephant",       image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260453/%E0%B8%8A_p1wwbo.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185800/%E0%B8%8A_oc2xil.m4a" },
  { letter: "ซ", name: "ซ โซ่",     roman: "saw-sôo",        sound: "s",          class: "Low",    meaning: "chain",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260451/%E0%B8%8B_g283xu.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185800/%E0%B8%8B_zv5acj.m4a" },
  { letter: "ฌ", name: "ฌ เฌอ",    roman: "chaw-chooe",     sound: "ch",         class: "Low",    meaning: "tree",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260448/%E0%B8%8C_jzmog8.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185800/%E0%B8%8C_jfqth1.m4a" },
  { letter: "ญ", name: "ญ หญิง",   roman: "yaw-yǐng",       sound: "y",          class: "Low",    meaning: "woman",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260447/%E0%B8%8D_hrzayr.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185800/%E0%B8%8D_l1zv93.m4a" },
  { letter: "ฎ", name: "ฎ ชฎา",    roman: "daw-chá-daa",    sound: "d",          class: "Middle", meaning: "headdress",      image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260443/%E0%B8%8E_ocki7l.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778188523/%E0%B8%8E_blip0x.m4a" },
  { letter: "ฏ", name: "ฏ ปฏัก",   roman: "dtaw-bpà-dtàk",  sound: "dt",         class: "Middle", meaning: "goad",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260442/%E0%B8%8F_bfil4x.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778188522/%E0%B8%8F_by9u88.m4a" },
  { letter: "ฐ", name: "ฐ ฐาน",    roman: "thaw-thǎan",     sound: "th",         class: "High",   meaning: "pedestal",       image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260438/%E0%B8%90_w9zqvf.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185799/%E0%B8%90_cuebae.m4a" },
  { letter: "ฑ", name: "ฑ มณโฑ",  roman: "thaw-mon-thoh",  sound: "th",         class: "Low",    meaning: "Montho",         image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260436/%E0%B8%91_lztvsf.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185799/%E0%B8%91_lafj0v.m4a" },
  { letter: "ฒ", name: "ฒ ผู้เฒ่า",  roman: "thaw-phûu-thâo", sound: "th",         class: "Low",    meaning: "elder",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260433/%E0%B8%92_dcs9ni.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185799/%E0%B8%92_phuchp.m4a" },
  { letter: "ณ", name: "ณ เณร",   roman: "naw-neen",       sound: "n",          class: "Low",    meaning: "novice monk",    image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260432/%E0%B8%93_kmdy5i.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185798/%E0%B8%93_twm48a.m4a" },
  { letter: "ด", name: "ด เด็ก",    roman: "daw-dèk",        sound: "d",          class: "Middle", meaning: "child",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260429/%E0%B8%94_pv455l.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185798/%E0%B8%94_n6o5de.m4a" },
  { letter: "ต", name: "ต เต่า",    roman: "dtaw-dtàow",     sound: "dt",         class: "Middle", meaning: "turtle",         image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260427/%E0%B8%95_vif7qe.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185798/%E0%B8%95_zq0edw.m4a" },
  { letter: "ถ", name: "ถ ถุง",     roman: "thaw-thǔng",     sound: "th",         class: "High",   meaning: "bag",            image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260425/%E0%B8%96_mygblh.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185798/%E0%B8%96_cz8euq.m4a" },
  { letter: "ท", name: "ท ทหาร",   roman: "thaw-thá-hǎan",  sound: "th",         class: "Low",    meaning: "soldier",        image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260423/%E0%B8%97_oy84ap.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185797/%E0%B8%97_u5mkiv.m4a" },
  { letter: "ธ", name: "ธ ธง",      roman: "thaw-thong",     sound: "th",         class: "Low",    meaning: "flag",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260422/%E0%B8%98_aftvjn.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185797/%E0%B8%98_rpbye1.m4a" },
  { letter: "น", name: "น หนู",    roman: "naw-nǔu",        sound: "n",          class: "Low",    meaning: "mouse",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260419/%E0%B8%99_ahu2iu.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185797/%E0%B8%99_duzumw.m4a" },
  { letter: "บ", name: "บ ใบไม้",  roman: "baw-bai-máai",   sound: "b",          class: "Middle", meaning: "leaf",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260418/%E0%B8%9A_mxxdfd.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185797/%E0%B8%9A_gjrilt.m4a" },
  { letter: "ป", name: "ป ปลา",    roman: "bpaw-bplaa",     sound: "bp",         class: "Middle", meaning: "fish",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260415/%E0%B8%9B_lgfane.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185796/%E0%B8%9B_lfdgt9.m4a" },
  { letter: "ผ", name: "ผ ผึ้ง",     roman: "phaw-phʉ̂ng",     sound: "ph",         class: "High",   meaning: "bee",            image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260414/%E0%B8%9C_gw2ysk.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185796/%E0%B8%9C_dvzenp.m4a" },
  { letter: "ฝ", name: "ฝ ฝา",     roman: "faw-fǎa",        sound: "f",          class: "High",   meaning: "lid",            image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260412/%E0%B8%9D_r2nzjv.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185796/%E0%B8%9D_tvwzze.m4a" },
  { letter: "พ", name: "พ พาน",    roman: "phaw-phaan",     sound: "ph",         class: "Low",    meaning: "tray",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260411/%E0%B8%9E_vvmi8i.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185796/%E0%B8%9E_va4u9m.m4a" },
  { letter: "ฟ", name: "ฟ ฟัน",    roman: "faw-fan",        sound: "f",          class: "Low",    meaning: "teeth",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260409/%E0%B8%9F_scvpch.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185795/%E0%B8%9F_ehamlv.m4a" },
  { letter: "ภ", name: "ภ สำเภา",  roman: "phaw-sǎm-phao",  sound: "ph",         class: "Low",    meaning: "junk boat",      image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260408/%E0%B8%A0_bouwdy.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185795/%E0%B8%A0_ee1ljh.m4a" },
  { letter: "ม", name: "ม ม้า",     roman: "maw-máa",        sound: "m",          class: "Low",    meaning: "horse",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260405/%E0%B8%A1_ro31ar.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185795/%E0%B8%A1_ehsypi.m4a" },
  { letter: "ย", name: "ย ยักษ์",   roman: "yaw-yák",        sound: "y",          class: "Low",    meaning: "giant",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260403/%E0%B8%A2_jlevyl.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185795/%E0%B8%A2_cdcnit.m4a" },
  { letter: "ร", name: "ร เรือ",    roman: "raw-rʉa",        sound: "r",          class: "Low",    meaning: "boat",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260402/%E0%B8%A3_azytoc.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185794/%E0%B8%A3_otaacp.m4a" },
  { letter: "ล", name: "ล ลิง",     roman: "law-ling",       sound: "l",          class: "Low",    meaning: "monkey",         image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260401/%E0%B8%A5_bct340.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185794/%E0%B8%A5_zvl6zh.m4a" },
  { letter: "ว", name: "ว แหวน",  roman: "waw-wǎen",       sound: "w",          class: "Low",    meaning: "ring",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260399/%E0%B8%A7_qzyuff.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185794/%E0%B8%A7_tfjhm4.m4a" },
  { letter: "ศ", name: "ศ ศาลา",   roman: "saw-sǎa-laa",    sound: "s",          class: "High",   meaning: "pavilion",       image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260397/%E0%B8%A8_zkv6ya.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185794/%E0%B8%A8_b6y5q5.m4a" },
  { letter: "ษ", name: "ษ ฤๅษี",   roman: "saw-rʉʉ-sǐi",    sound: "s",          class: "High",   meaning: "hermit",         image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260396/%E0%B8%A9_gz1yme.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185794/%E0%B8%A9_y0ffst.m4a" },
  { letter: "ส", name: "ส เสือ",   roman: "saw-sʉ̌a",        sound: "s",          class: "High",   meaning: "tiger",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260395/%E0%B8%AA_iginjh.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185793/%E0%B8%AA_sd8aiu.m4a" },
  { letter: "ห", name: "ห หีบ",    roman: "haw-hìip",       sound: "h",          class: "High",   meaning: "chest/trunk",    image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260394/%E0%B8%AB_vis9ex.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185793/%E0%B8%AB_trmz8n.m4a" },
  { letter: "ฬ", name: "ฬ จุฬา",   roman: "law-jù-laa",     sound: "l",          class: "Low",    meaning: "kite",           image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260392/%E0%B8%AC_vukone.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185793/%E0%B8%AC_opmrnv.m4a" },
  { letter: "อ", name: "อ อ่าง",    roman: "aw-àang",        sound: "o (silent)", class: "Middle", meaning: "basin",          image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260392/%E0%B8%AD_sfhbi8.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185793/%E0%B8%AD_h62h6k.m4a" },
  { letter: "ฮ", name: "ฮ นกฮูก",  roman: "haw-nók-hûuk",   sound: "h",          class: "Low",    meaning: "owl",            image: "https://res.cloudinary.com/dytwyhtsh/image/upload/v1778260391/%E0%B8%AE_yc8gsl.png", audio: "https://res.cloudinary.com/dytwyhtsh/video/upload/v1778185793/%E0%B8%AE_io1xmw.m4a" }
];

// =====================================================================
// Class color palette — soft pastel shades, child-friendly
// =====================================================================
const CLASS_STYLES = {
  Middle: {
    bg: "#E6F4FE", bgFront: "#F4FAFF",
    accent: "#7cc9f5",
    badgeBg: "#7cc9f5", badgeText: "#0c4a6e",
    ring: "rgba(124,201,245,0.55)",
    label: "Middle Class"
  },
  High: {
    bg: "#E3F6E8", bgFront: "#F2FBF4",
    accent: "#6bcf8a",
    badgeBg: "#6bcf8a", badgeText: "#14532d",
    ring: "rgba(107,207,138,0.55)",
    label: "High Class"
  },
  Low: {
    bg: "#FFEFD6", bgFront: "#FFF8EC",
    accent: "#ffbd59",
    badgeBg: "#ffbd59", badgeText: "#7c2d12",
    ring: "rgba(255,189,89,0.6)",
    label: "Low Class"
  }
};

export { CONSONANTS, CLASS_STYLES };
