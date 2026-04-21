/**
 * characters.js — Fuente única de verdad para todos los personajes del juego.
 *
 * Convenciones:
 *  ID de personaje : "{faction}/{pieceType}/{filename}"
 *    - faction     : 'guerreros' | 'villanos'
 *    - pieceType   : 'rey' | 'reina' | 'torre' | 'caballo' | 'alfil' | 'peon'
 *    - filename    : nombre del archivo sin extensión (exacto, igual que en disco)
 *
 *  Ruta de imagen : Cloudinary (vía VITE_CLOUDINARY_CLOUD_NAME)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_BASE_FOLDER = (import.meta.env.VITE_CLOUDINARY_BASE_FOLDER || 'Dragon-chess/characters')
    .replace(/^\/+|\/+$/g, '');
const CLOUDINARY_BASE_URL = CLOUDINARY_CLOUD_NAME
    ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`
    : '';
const MEDIA_SERVICE_URL = (import.meta.env.VITE_MEDIA_SERVICE_URL || '').replace(/\/+$/g, '');
const MEDIA_CATALOG_PATH = import.meta.env.VITE_MEDIA_CATALOG_PATH || '/api/media/catalog';

const CATALOG_URL_BY_ID = new Map();
let catalogReady = false;
let preloadPromise = null;

/** Directorio de carpeta según faction key */
const FACTION_DIR = { guerreros: 'Guerreros', villanos: 'Villanos' };

/** Directorio de carpeta según pieceType key */
const PIECE_DIR = {
    rey:     'Rey',
    reina:   'Reina',
    torre:   'Torre',
    caballo: 'Caballo',
    alfil:   'Alfil',
    peon:    'Peon',
};

const REVERSE_FACTION_DIR = Object.fromEntries(
    Object.entries(FACTION_DIR).map(([key, value]) => [value.toLowerCase(), key])
);

const REVERSE_PIECE_DIR = Object.fromEntries(
    Object.entries(PIECE_DIR).map(([key, value]) => [value.toLowerCase(), key])
);

function legacyPathToCharacterId(imagePath) {
    const normalized = String(imagePath || '').trim();
    if (!normalized.startsWith('/images/characters/')) return null;

    const relative = normalized
        .replace(/^\/images\/characters\//, '')
        .replace(/\.(webp|png|jpe?g|gif|avif)$/i, '');

    const parts = relative.split('/');
    if (parts.length < 3) return null;

    const [factionDir, pieceDir, ...filenameParts] = parts;
    const faction = REVERSE_FACTION_DIR[String(factionDir).toLowerCase()] || String(factionDir).toLowerCase();
    const pieceType = REVERSE_PIECE_DIR[String(pieceDir).toLowerCase()] || String(pieceDir).toLowerCase();
    const filename = filenameParts.join('/');

    if (!faction || !pieceType || !filename) return null;
    return `${faction}/${pieceType}/${filename}`;
}

function buildCloudinaryImageUrl(characterId) {
    const [faction, pieceType, ...filenameParts] = String(characterId || '').split('/');
    const filename = filenameParts.join('/');

    if (!CLOUDINARY_BASE_URL || !faction || !pieceType || !filename) {
        return null;
    }

    const factionDir = FACTION_DIR[faction];
    const pieceDir = PIECE_DIR[pieceType];
    if (!factionDir || !pieceDir) return null;

    const encodedFile = filename
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');

    return `${CLOUDINARY_BASE_URL}/${CLOUDINARY_BASE_FOLDER}/${factionDir}/${pieceDir}/${encodedFile}`;
}

function normalizeCharacterId(characterId) {
    const [faction, pieceType, ...filenameParts] = String(characterId || '').split('/');
    if (!faction || !pieceType || filenameParts.length === 0) return '';
    return `${String(faction).toLowerCase()}/${String(pieceType).toLowerCase()}/${filenameParts.join('/')}`;
}

function normalizeCharacterFilename(filename) {
    return String(filename || '')
        .trim()
        .replace(/\.(webp|png|jpe?g|gif|avif)$/i, '');
}

function normalizeFilenameMatchKey(filename) {
    return normalizeCharacterFilename(filename)
        .toLowerCase()
        .replace(/[\s_]+/g, '');
}

function buildFilenameCandidates(filename) {
    const candidates = [];
    let current = normalizeCharacterFilename(filename);

    while (current) {
        candidates.push(current);
        const next = current.replace(/_[^_]+$/, '');
        if (!next || next === current) {
            break;
        }
        current = next;
    }

    return candidates;
}

function getCanonicalCharacterId(faction, pieceType, filename) {
    const normalizedFaction = String(faction || '').toLowerCase();
    const normalizedPieceType = String(pieceType || '').toLowerCase();
    const normalizedFilename = normalizeCharacterFilename(filename);
    const candidateFilenames = buildFilenameCandidates(normalizedFilename);
    const candidateKey = normalizeFilenameMatchKey(normalizedFilename);

    for (const candidateFilename of candidateFilenames) {
        const match = ALL_CHARACTERS.find((character) => {
            return character.faction === normalizedFaction
                && character.pieceType === normalizedPieceType
                && character.filename === candidateFilename;
        });

        if (match) {
            return match.id;
        }
    }

    const relaxedMatch = ALL_CHARACTERS.find((character) => {
        return character.faction === normalizedFaction
            && character.pieceType === normalizedPieceType
            && normalizeFilenameMatchKey(character.filename) === candidateKey;
    });

    if (relaxedMatch) {
        return relaxedMatch.id;
    }

    return `${normalizedFaction}/${normalizedPieceType}/${normalizedFilename}`;
}

function registerCatalogUrl(characterId, url) {
    const normalizedId = normalizeCharacterId(characterId);
    const normalizedUrl = String(url || '').trim();

    if (normalizedId && normalizedUrl) {
        CATALOG_URL_BY_ID.set(normalizedId, normalizedUrl);
    }
}

function getMediaCatalogUrl() {
    if (MEDIA_SERVICE_URL) {
        return `${MEDIA_SERVICE_URL}${MEDIA_CATALOG_PATH.startsWith('/') ? MEDIA_CATALOG_PATH : `/${MEDIA_CATALOG_PATH}`}`;
    }

    if (MEDIA_CATALOG_PATH.startsWith('/')) {
        return MEDIA_CATALOG_PATH;
    }

    return `/${MEDIA_CATALOG_PATH}`;
}

export async function preloadCharacterCatalog(force = false) {
    if (!force && catalogReady) return true;
    if (!force && preloadPromise) return preloadPromise;

    const endpoint = getMediaCatalogUrl();
    if (!endpoint) {
        catalogReady = true;
        return false;
    }

    preloadPromise = fetch(endpoint)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Media catalog request failed with status ${response.status}`);
            }

            const data = await response.json();
            const items = Array.isArray(data?.items) ? data.items : [];

            CATALOG_URL_BY_ID.clear();
            for (const item of items) {
                const rawId = item?.character_key || item?.id || '';
                const url = String(item?.url || item?.secure_url || '').trim();
                const [faction, pieceType, ...filenameParts] = String(rawId).split('/');
                const filename = filenameParts.join('/');
                const canonicalId = getCanonicalCharacterId(faction, pieceType, filename);

                registerCatalogUrl(rawId, url);
                registerCatalogUrl(canonicalId, url);

                const fallbackId = normalizeCharacterId(item?.id);
                if (fallbackId && url) {
                    CATALOG_URL_BY_ID.set(fallbackId, url);
                }
            }

            catalogReady = true;
            return true;
        })
        .catch(() => {
            catalogReady = true;
            return false;
        })
        .finally(() => {
            preloadPromise = null;
        });

    return preloadPromise;
}

export function resolveCharacterImageUrl(value) {
    if (!value) return '';
    if (String(value).startsWith('http')) return value;

    const legacyId = legacyPathToCharacterId(value);
    if (legacyId) {
        return charPath(legacyId);
    }

    if (String(value).startsWith('/images/characters/')) {
        const legacyCharacterId = legacyPathToCharacterId(value);
        return legacyCharacterId ? charPath(legacyCharacterId) : '';
    }

    return charPath(String(value));
}

/**
 * Genera la ruta de imagen pública a partir del ID de personaje.
 * @param {string} characterId — e.g. "guerreros/torre/piccolo"
 */
export function charPath(characterId) {
    const normalizedId = normalizeCharacterId(characterId);
    if (normalizedId && CATALOG_URL_BY_ID.has(normalizedId)) {
        return CATALOG_URL_BY_ID.get(normalizedId) || '';
    }

    const cloudinaryUrl = buildCloudinaryImageUrl(characterId);
    return cloudinaryUrl || '';
}

/**
 * Construye un objeto de personaje completo.
 */
function char(faction, pieceType, filename, displayName, shopPrice = null) {
    const id = `${faction}/${pieceType}/${filename}`;
    return { id, faction, pieceType, filename, displayName, path: charPath(id), shopPrice };
}

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo completo de personajes
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_CHARACTERS = [
    // ── GUERREROS Z ──────────────────────────────────────────────────────────

    // Rey
    char('guerreros', 'rey', 'Bills',              'Bills'),
    char('guerreros', 'rey', 'Bills_muychistoso',  'Bills (Enojado)'),
    char('guerreros', 'rey', 'kami',               'Kami Sama'),
    char('guerreros', 'rey', 'karim',              'Karim'),
    char('guerreros', 'rey', 'zen',                'Zen-Oh'),

    // Reina
    char('guerreros', 'reina', 'Bulma',            'Bulma'),
    char('guerreros', 'reina', 'daishinkan',       'Daishinkan'),
    char('guerreros', 'reina', 'gogetta',          'Gogeta'),
    char('guerreros', 'reina', 'goku_ui',          'Goku Ultra Instinto'),
    char('guerreros', 'reina', 'vegetto',          'Vegetto'),
    char('guerreros', 'reina', 'whiss',            'Whis'),

    // Torre
    char('guerreros', 'torre', 'gohan_adolescente','Gohan Adolescente'),
    char('guerreros', 'torre', 'Goku',             'Goku'),
    char('guerreros', 'torre', 'gokuss1',          'Goku SS1'),
    char('guerreros', 'torre', 'gokuss2',          'Goku SS2'),
    char('guerreros', 'torre', 'piccolo',          'Piccolo'),
    char('guerreros', 'torre', 'popo',             'Popo'),
    char('guerreros', 'torre', 'yajirobe',         'Yajirobe'),

    // Caballo
    char('guerreros', 'caballo', 'gohan',          'Gohan'),
    char('guerreros', 'caballo', 'granola',        'Granola'),
    char('guerreros', 'caballo', 'kyabe',          'Kyabe'),
    char('guerreros', 'caballo', 'tapion',         'Tapion'),
    char('guerreros', 'caballo', 'vegetta',        'Vegeta'),

    // Alfil
    char('guerreros', 'alfil', 'caulifla',         'Caulifla'),
    char('guerreros', 'alfil', 'hit',              'Hit'),
    char('guerreros', 'alfil', 'ten',              'Ten Shin Han'),
    char('guerreros', 'alfil', 'Trunks',           'Trunks'),
    char('guerreros', 'alfil', 'yamcha',           'Yamcha'),

    // Peón
    char('guerreros', 'peon', 'chaos',             'Chaos'),
    char('guerreros', 'peon', 'gohan_niño',        'Gohan Niño'),
    char('guerreros', 'peon', 'krilin',            'Krillin'),
    char('guerreros', 'peon', 'pan',               'Pan'),
    char('guerreros', 'peon', 'roshi',             'Roshi'),
    char('guerreros', 'peon', 'satan',             'Mr. Satan'),
    char('guerreros', 'peon', 'videl',             'Videl'),

    // ── VILLANOS ─────────────────────────────────────────────────────────────

    // Rey
    char('villanos', 'rey', 'Champa',              'Champa'),
    char('villanos', 'rey', 'Dabura',              'Dabura'),
    char('villanos', 'rey', 'Freezer',             'Freezer'),
    char('villanos', 'rey', 'Ginyu',               'Ginyu'),
    char('villanos', 'rey', 'Moro',                'Moro'),

    // Reina
    char('villanos', 'reina', 'Arinsu',            'Arinsu'),
    char('villanos', 'reina', 'Cell',              'Cell'),
    char('villanos', 'reina', 'Freezer_Black',     'Black Freezer'),
    char('villanos', 'reina', 'Jiren',             'Jiren'),
    char('villanos', 'reina', 'Zamas_fusion',      'Zamas Fusión'),

    // Torre
    char('villanos', 'torre', 'Broly_Z',           'Broly Z'),
    char('villanos', 'torre', 'Freezer_2da Forma', 'Freezer 2da Forma'),
    char('villanos', 'torre', 'Gas',               'Gas'),
    char('villanos', 'torre', 'Majin Buu',         'Majin Buu'),
    char('villanos', 'torre', 'Recoome',           'Recoome'),
    char('villanos', 'torre', 'Toppo',             'Toppo'),

    // Caballo
    char('villanos', 'caballo', 'Androide 17',     'Androide 17'),
    char('villanos', 'caballo', 'Freezer_100',     'Freezer 100%'),
    char('villanos', 'caballo', 'Jeice',           'Jeice'),
    char('villanos', 'caballo', 'Kid Buu',         'Kid Buu'),
    char('villanos', 'caballo', 'Zamasu',          'Zamas'),

    // Alfil
    char('villanos', 'alfil', 'Androide 18',       'Androide 18'),
    char('villanos', 'alfil', 'Black Goku',        'Goku Black'),
    char('villanos', 'alfil', 'Broly Super',       'Broly Super'),
    char('villanos', 'alfil', 'Burter',            'Burter'),
    char('villanos', 'alfil', 'Dyspo',             'Dyspo'),
    char('villanos', 'alfil', 'Freezer_3ra forma', 'Freezer 3ra forma'),
    char('villanos', 'alfil', 'Janemba',           'Janemba'),
    char('villanos', 'alfil', 'Super Buu',         'Super Buu'),

    // Peón
    char('villanos', 'peon', 'Freezer_1ra forma',  'Freezer 1ra forma'),
    char('villanos', 'peon', 'Guldo',              'Guldo'),
    char('villanos', 'peon', 'Pilaf',              'Pilaf'),
    char('villanos', 'peon', 'Saibaiman',          'Saibaiman'),
    char('villanos', 'peon', 'Zoirei',             'Zoirei'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Lookup rápido por ID
// ─────────────────────────────────────────────────────────────────────────────
export const CHARACTERS_BY_ID = Object.fromEntries(ALL_CHARACTERS.map(c => [c.id, c]));

// ─────────────────────────────────────────────────────────────────────────────
// Acceso por faction/pieceType (para personalizar piezas)
// ─────────────────────────────────────────────────────────────────────────────
export function getCharactersByFactionAndPiece(faction, pieceType) {
    return ALL_CHARACTERS.filter(c => c.faction === faction && c.pieceType === pieceType);
}

export function getCharactersByFaction(faction) {
    return ALL_CHARACTERS.filter(c => c.faction === faction);
}

// ─────────────────────────────────────────────────────────────────────────────
// Personajes desbloqueados por defecto (primero de cada tipo/facción)
// Son la primera pieza alfabética de cada combinación faction+pieceType.
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_UNLOCKED_IDS = [
    // Guerreros Z
    'guerreros/alfil/caulifla',
    'guerreros/caballo/gohan',
    'guerreros/peon/chaos',
    'guerreros/reina/Bulma',
    'guerreros/rey/Bills',
    'guerreros/torre/gohan_adolescente',
    'guerreros/torre/Goku',
    // Villanos
    'villanos/alfil/Androide 18',
    'villanos/caballo/Androide 17',
    'villanos/peon/Freezer_1ra forma',
    'villanos/reina/Arinsu',
    'villanos/rey/Champa',
    'villanos/torre/Broly_Z',
];

// ─────────────────────────────────────────────────────────────────────────────
// Pase de Batalla — 50 niveles, 1 personaje cada 3 niveles (niveles 3..48)
// ─────────────────────────────────────────────────────────────────────────────
export const BATTLE_PASS_REWARDS = {
     3: { id: 'guerreros/torre/piccolo',          name: 'Piccolo',          senzuPrice: null },
     6: { id: 'villanos/rey/Freezer',             name: 'Freezer',          senzuPrice: null },
     9: { id: 'guerreros/alfil/hit',              name: 'Hit',              senzuPrice: null },
    12: { id: 'villanos/caballo/Kid Buu',         name: 'Kid Buu',          senzuPrice: null },
    15: { id: 'guerreros/reina/vegetto',          name: 'Vegetto',          senzuPrice: null },
    18: { id: 'villanos/reina/Cell',              name: 'Cell',             senzuPrice: null },
    21: { id: 'guerreros/peon/krilin',            name: 'Krillin',          senzuPrice: null },
    24: { id: 'villanos/alfil/Janemba',           name: 'Janemba',          senzuPrice: null },
    27: { id: 'guerreros/caballo/vegetta',        name: 'Vegeta',           senzuPrice: null },
    30: { id: 'villanos/torre/Toppo',             name: 'Toppo',            senzuPrice: null },
    33: { id: 'guerreros/rey/Bills_muychistoso',  name: 'Bills (Enojado)',  senzuPrice: null },
    36: { id: 'villanos/reina/Jiren',             name: 'Jiren',            senzuPrice: null },
    39: { id: 'guerreros/reina/goku_ui',          name: 'Goku Ultra Instinto', senzuPrice: null },
    42: { id: 'villanos/alfil/Black Goku',        name: 'Goku Black',       senzuPrice: null },
    45: { id: 'guerreros/rey/zen',                name: 'Zen-Oh',           senzuPrice: null },
    48: { id: 'villanos/torre/Gas',               name: 'Gas',              senzuPrice: null },
};

/** Set de IDs que pertenecen al Pase de Batalla (para excluirlos de la tienda) */
export const BATTLE_PASS_IDS = new Set(Object.values(BATTLE_PASS_REWARDS).map(r => r.id));

// ─────────────────────────────────────────────────────────────────────────────
// Tienda — todos los que no son default ni pase de batalla
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_SET     = new Set(DEFAULT_UNLOCKED_IDS);

export const SHOP_ITEMS = ALL_CHARACTERS
    .filter(c => !DEFAULT_SET.has(c.id) && !BATTLE_PASS_IDS.has(c.id))
    .map(c => ({
        ...c,
        shopPrice: 25, // precio base en Semillas Senzu
    }));

/** Lookup de tienda por ID */
export const SHOP_ITEMS_BY_ID = Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i]));

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de desbloqueoo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Devuelve true si el personaje está desbloqueado para este jugador.
 * @param {string}   characterId
 * @param {string[]} unlockedIds  — array del backend (player_stats.unlocked_characters)
 * @param {boolean}  unlockAll    — users.unlock_all
 */
export function isUnlocked(characterId, unlockedIds = [], unlockAll = false) {
    if (unlockAll) return true;
    if (DEFAULT_SET.has(characterId)) return true;
    return unlockedIds.includes(characterId);
}

/**
 * Comprueba si un personaje del Pase de Batalla está disponible para el nivel dado.
 */
export function isBattlePassRewardUnlocked(level, rewardLevel) {
    return level >= rewardLevel;
}

// ─────────────────────────────────────────────────────────────────────────────
// Nombres de visualización de tipos de pieza
// ─────────────────────────────────────────────────────────────────────────────
export const PIECE_TYPE_DISPLAY = {
    rey:     'Rey',
    reina:   'Reina',
    torre:   'Torre',
    caballo: 'Caballo',
    alfil:   'Alfil',
    peon:    'Peón',
};

export const FACTION_DISPLAY = {
    guerreros: 'Guerreros Z',
    villanos:  'Villanos',
};

export const PIECE_TYPES = ['rey', 'reina', 'torre', 'caballo', 'alfil', 'peon'];
export const FACTIONS    = ['guerreros', 'villanos'];
