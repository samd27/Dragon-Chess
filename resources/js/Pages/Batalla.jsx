import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { TrophyIcon, HandRaisedIcon, XMarkIcon, PauseIcon, PlayIcon, PhotoIcon, ClipboardDocumentListIcon, ChevronUpIcon, ChevronDownIcon, ClockIcon, ArrowDownCircleIcon, BeakerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import ElectricBorder from '@/Components/ElectricBorder';
import useStockfish from '@/hooks/useStockfish';
import RewardCard from '@/Components/RewardCard';
import GameLayout from '@/Layouts/GameLayout';
import { resolveCharacterImageUrl } from '@/data/characters';

const TILE_TYPE_META = {
    time_chamber: { label: 'Tiempo', displayName: 'Cámara del Tiempo', icon: ClockIcon },
    heavy_gravity: { label: 'Gravedad', displayName: 'Gravedad Aumentada', icon: ArrowDownCircleIcon },
    sacred_water: { label: 'Agua', displayName: 'Agua Ultra Sagrada', icon: BeakerIcon },
};

export default function GameArena({ auth, faction, mode = 'PVP', variant = 'CLASSIC', difficulty = 2, player2 = null, player1Preferences = {}, player2Preferences = {} }) {
    const normalizedMode = mode === 'DRAGON_PVP' ? 'PVP' : mode === 'DRAGON_PVC' ? 'PVC' : mode;
    const normalizedVariant = variant ?? (mode === 'DRAGON_PVP' || mode === 'DRAGON_PVC' ? 'SPECIAL' : 'CLASSIC');
    const isPvpMode = normalizedMode === 'PVP';
    const isCpuMode = normalizedMode === 'PVC';
    const isDragonMode = normalizedVariant === 'SPECIAL';

    const [game, setGame] = useState(new Chess());
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [possibleMoves, setPossibleMoves] = useState([]);
    const [showPauseMenu, setShowPauseMenu] = useState(false);
    const [showPiecesReference, setShowPiecesReference] = useState(false);
    const [showConfirmAbort, setShowConfirmAbort] = useState(false);
    const [gameOver, setGameOver] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [whiteTime, setWhiteTime] = useState(600);
    const [blackTime, setBlackTime] = useState(600);
    const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
    const [promotionPending, setPromotionPending] = useState(null);
    const [showCheckAnimation, setShowCheckAnimation] = useState(false);
    const [showCapturedPiecesModal, setShowCapturedPiecesModal] = useState(false);
    const [showMoveHistoryModal, setShowMoveHistoryModal] = useState(false);
    const [cpuThinking, setCpuThinking] = useState(false);
    const [showPiecesIntro, setShowPiecesIntro] = useState(true);
    const [lastMove, setLastMove] = useState(null); // { from, to }
    const [gameRewards, setGameRewards] = useState(null);
    const [gameOverMinimized, setGameOverMinimized] = useState(false);
    const [specialTiles, setSpecialTiles] = useState({});
    const [specialTileQueue, setSpecialTileQueue] = useState([]);
    const [specialMessage, setSpecialMessage] = useState('');
    const [anchoredPieces, setAnchoredPieces] = useState({});
    const [forcedExtraMove, setForcedExtraMove] = useState(null);
    const [kiBurst, setKiBurst] = useState({ white: false, black: false });

    // Stockfish engine (solo se activa en modo PVC)
    const { isReady: stockfishReady, getBestMove, getBestMoveWithEvaluations, stop: stopStockfish } = useStockfish(isCpuMode ? difficulty : 2);
    
    // Refs para auto-scroll
    const moveHistoryRef  = useRef(null);
    const playerCapturedRef   = useRef(null);
    const opponentCapturedRef = useRef(null);
    const rewardsSavedRef     = useRef(false); // evita guardar el mismo resultado 2 veces
    
    // Determinar qué jugador es blanco y cuál es negro
    // Guerrero Z controla blancas (naranjas) y mueve primero
    // Villano controla negras (moradas) y mueve segundo
    const playerIsWhite = faction === 'Z_WARRIORS';
    
    const player = {
        name: auth.user?.name || 'Kakarot_99',
        avatar: resolveCharacterImageUrl(auth.user?.avatar || 'guerreros/torre/Goku'),
    };

    const handleAbortMission = () => {
        setShowConfirmAbort(false);
        // Limpiar sesión de jugador 2 si existe
        if (isPvpMode && player2) {
            fetch(route('clear.player2.session'), { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } });
        }
        router.visit(route('game.mode'));
    };
    
    const handleReturnToMenu = () => {
        // Limpiar sesión de jugador 2 si existe
        if (isPvpMode && player2) {
            fetch(route('clear.player2.session'), { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } })
                .then(() => router.visit(route('game.mode')));
        } else {
            router.visit(route('game.mode'));
        }
    };

    const opponent = {
        name: isCpuMode
            ? 'CPU' 
            : (player2 ? player2.name : 'Invitado'),
        avatar: isCpuMode
            ? resolveCharacterImageUrl(faction === 'Z_WARRIORS' ? 'villanos/rey/Freezer' : 'guerreros/torre/Goku')
            : resolveCharacterImageUrl(player2 ? player2.avatar : (faction === 'Z_WARRIORS' ? 'villanos/rey/Freezer' : 'guerreros/torre/Goku')),
    };

    // Mapeo de tipos de piezas de chess.js a nombres de carpetas
    const pieceTypeMap = {
        'p': 'peon',
        'n': 'caballo',
        'b': 'alfil',
        'r': 'torre',
        'q': 'reina',
        'k': 'rey'
    };

    // Obtener la imagen de la pieza personalizada
    const getPieceImage = (piece) => {
        if (!piece) return null;
        
        const pieceKey = pieceTypeMap[piece.type];
        const isPlayer1Piece = (piece.color === 'w' && playerIsWhite) || (piece.color === 'b' && !playerIsWhite);
        
        // Si no hay player2 (modo invitado), siempre usar player1Preferences
        const preferences = (player2 === null || !player2) ? player1Preferences : (isPlayer1Piece ? player1Preferences : player2Preferences);
        
        // Determinar la facción: si es pieza del jugador 1, usa su facción elegida. Si es del jugador 2, usa la contraria.
        let factionKey;
        if (isPlayer1Piece) {
            factionKey = faction === 'Z_WARRIORS' ? 'guerreros' : 'villanos';
        } else {
            factionKey = faction === 'Z_WARRIORS' ? 'villanos' : 'guerreros';
        }
        
        // Obtener la imagen desde las preferencias
        if (preferences && preferences[factionKey] && preferences[factionKey][pieceKey]) {
            return resolveCharacterImageUrl(preferences[factionKey][pieceKey]);
        }
        
        return null;
    };

    // Obtener imagen para pieza capturada (tipo string como 'p', 'n', etc)
    const getCapturedPieceImage = (pieceType, isWhitePiece) => {
        const pieceKey = pieceTypeMap[pieceType.toLowerCase()];
        
        // Determinar qué jugador poseyía esa pieza capturada
        const wasPlayer1Piece = (isWhitePiece && playerIsWhite) || (!isWhitePiece && !playerIsWhite);
        
        // Si no hay player2 (modo invitado), siempre usar player1Preferences
        const preferences = (player2 === null || !player2) ? player1Preferences : (wasPlayer1Piece ? player1Preferences : player2Preferences);
        
        // La facción de la pieza capturada es la que tenía cuando estaba en juego
        let factionKey;
        if (wasPlayer1Piece) {
            factionKey = faction === 'Z_WARRIORS' ? 'guerreros' : 'villanos';
        } else {
            factionKey = faction === 'Z_WARRIORS' ? 'villanos' : 'guerreros';
        }
        
        if (preferences && preferences[factionKey] && preferences[factionKey][pieceKey]) {
            return resolveCharacterImageUrl(preferences[factionKey][pieceKey]);
        }
        
        return null;
    };

    // Obtener imagen para promoción de peón
    const getPromotionPieceImage = (pieceType) => {
        const pieceKey = pieceTypeMap[pieceType];
        
        // La promoción es siempre del jugador actual (quien está moviendo)
        const isPlayer1Turn = (game.turn() === 'w' && playerIsWhite) || (game.turn() === 'b' && !playerIsWhite);
        
        // Si no hay player2 (modo invitado), siempre usar player1Preferences
        const preferences = (player2 === null || !player2) ? player1Preferences : (isPlayer1Turn ? player1Preferences : player2Preferences);
        
        // Determinar la facción según de quién es el turno
        let factionKey;
        if (isPlayer1Turn) {
            factionKey = faction === 'Z_WARRIORS' ? 'guerreros' : 'villanos';
        } else {
            factionKey = faction === 'Z_WARRIORS' ? 'villanos' : 'guerreros';
        }
        
        if (preferences && preferences[factionKey] && preferences[factionKey][pieceKey]) {
            return resolveCharacterImageUrl(preferences[factionKey][pieceKey]);
        }
        
        return null;
    };

    // Piezas Unicode para renderizar (fallback)
    const pieceSymbols = {
        'p': '\u265F', 'n': '\u265E', 'b': '\u265D', 'r': '\u265C', 'q': '\u265B', 'k': '\u265A',
        'P': '\u2659', 'N': '\u2658', 'B': '\u2657', 'R': '\u2656', 'Q': '\u2655', 'K': '\u2654'
    };

    const previousTurnRef = useRef(game.turn());

    const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

    const generateSpecialTileQueue = useCallback(() => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['3', '4', '5', '6'];
        const pool = [];

        files.forEach((file) => {
            ranks.forEach((rank) => {
                pool.push(`${file}${rank}`);
            });
        });

        const baseTypes = ['time_chamber', 'heavy_gravity', 'sacred_water'];
        const queue = [];

        const pickUnusedSquare = () => {
            let selected = null;
            while (!selected && pool.length > 0) {
                const idx = Math.floor(Math.random() * pool.length);
                const candidate = pool[idx];
                pool.splice(idx, 1);
                if (!queue.some((tile) => tile.square === candidate)) {
                    selected = candidate;
                }
            }
            return selected;
        };

        const specialTypes = [...baseTypes, randomFrom(baseTypes), randomFrom(baseTypes)];

        specialTypes.forEach((type) => {
            const square = pickUnusedSquare();
            if (square) {
                queue.push({ square, type });
            }
        });

        return queue.sort(() => Math.random() - 0.5);
    }, []);

    const squareIsAnchored = useCallback((square, pieceColor) => {
        const entry = anchoredPieces[square];
        return Boolean(entry && entry.color === pieceColor && entry.state === 'active');
    }, [anchoredPieces]);

    const getPossibleMovesForSquare = useCallback((square) => {
        const piece = game.get(square);
        if (!piece) return [];
        if (squareIsAnchored(square, piece.color)) return [];

        // Si hay un forcedExtraMove y esta pieza no es la forzada, retornar vacío
        if (forcedExtraMove && (square !== forcedExtraMove.square || piece.color !== forcedExtraMove.color)) {
            return [];
        }

        let moves = game.moves({ square, verbose: true });

        if (!isDragonMode) {
            return moves;
        }

        const burstEnabled = piece.color === 'w' ? kiBurst.white : kiBurst.black;
        if (!burstEnabled) {
            return moves;
        }

        if (piece.type === 'p') {
            const direction = piece.color === 'w' ? 1 : -1;
            const rank = Number(square[1]);
            const fileCode = square.charCodeAt(0);
            const oneForward = `${square[0]}${rank + direction}`;
            const twoForward = `${square[0]}${rank + (direction * 2)}`;

            if (game.get(oneForward) === null && game.get(twoForward) === null && rank + (direction * 2) >= 1 && rank + (direction * 2) <= 8) {
                const alreadyIncluded = moves.some((m) => m.to === twoForward);
                if (!alreadyIncluded) {
                    moves = [...moves, { from: square, to: twoForward, color: piece.color, piece: 'p' }];
                }
            }

            const captureOffsets = [-1, 1];
            captureOffsets.forEach((offset) => {
                const targetFileCode = fileCode + offset;
                const targetRank = rank + (direction * 2);
                if (targetFileCode >= 97 && targetFileCode <= 104 && targetRank >= 1 && targetRank <= 8) {
                    const targetSquare = `${String.fromCharCode(targetFileCode)}${targetRank}`;
                    const targetPiece = game.get(targetSquare);
                    if (targetPiece && targetPiece.color !== piece.color && !moves.some((m) => m.to === targetSquare)) {
                        moves = [...moves, { from: square, to: targetSquare, color: piece.color, piece: 'p', captured: targetPiece.type }];
                    }
                }
            });
        }

        return moves;
    }, [game, squareIsAnchored, isDragonMode, kiBurst, forcedExtraMove]);

    const evaluateSpecialTileImpact = useCallback((moveObj, stockfishScore, aiColor) => {
        if (!isDragonMode) {
            return stockfishScore;
        }

        const tileType = specialTiles[moveObj.to];
        let adjustment = 0;

        if (tileType === 'time_chamber') {
            adjustment += moveObj.piece === 'n' || moveObj.piece === 'b' ? 300 : 220;
        }

        if (tileType === 'heavy_gravity') {
            const penaltyBase = moveObj.piece === 'q' || moveObj.piece === 'r' ? -550 : -320;
            adjustment += penaltyBase;
        }

        if (tileType === 'sacred_water') {
            adjustment += moveObj.piece === 'p' ? 900 : -40;
        }

        const opponentColor = aiColor === 'w' ? 'b' : 'w';
        Object.entries(specialTiles).forEach(([sq, type]) => {
            const piece = game.get(sq);
            if (!piece || piece.color !== opponentColor) return;
            if (type === 'sacred_water' && piece.type === 'p') adjustment -= 220;
            if (type === 'time_chamber') adjustment -= 90;
        });

        return stockfishScore + adjustment;
    }, [isDragonMode, specialTiles, game]);

    const selectBestDragonComputerMove = useCallback(async () => {
        const analysis = await getBestMoveWithEvaluations(game.fen(), { multiPv: difficulty === 3 ? 8 : difficulty === 2 ? 5 : 3 });
        const aiColor = playerIsWhite ? 'b' : 'w';
        const legalMoves = game.moves({ verbose: true }).filter((m) => {
            if (!isDragonMode) return true;
            return !squareIsAnchored(m.from, aiColor);
        });
        const legalMap = new Map(
            legalMoves.map((m) => {
                const key = `${m.from}${m.to}${m.promotion ?? ''}`;
                return [key, m];
            })
        );

        const candidates = [];
        analysis.evaluations.forEach((item) => {
            const key = item.move;
            const legalMove = legalMap.get(key);
            if (!legalMove) return;

            const finalScore = evaluateSpecialTileImpact(legalMove, item.scoreCP, aiColor);
            candidates.push({ move: item.move, score: finalScore, rank: item.rank });
        });

        if (analysis.bestMove && legalMap.has(analysis.bestMove) && !candidates.some((c) => c.move === analysis.bestMove)) {
            const legalMove = legalMap.get(analysis.bestMove);
            candidates.push({ move: analysis.bestMove, score: evaluateSpecialTileImpact(legalMove, 0, aiColor), rank: 99 });
        }

        if (candidates.length === 0) {
            return analysis.bestMove;
        }

        candidates.sort((a, b) => b.score - a.score || a.rank - b.rank);
        return candidates[0].move;
    }, [getBestMoveWithEvaluations, game, difficulty, evaluateSpecialTileImpact, playerIsWhite, isDragonMode, squareIsAnchored]);

    const triggerTileEffects = useCallback((workingGame, move, updatedHistory) => {
        if (!isDragonMode) return;

        const tileType = specialTiles[move.to];
        if (!tileType) return;

        if (tileType === 'time_chamber') {
            const fenParts = workingGame.fen().split(' ');
            fenParts[1] = move.color;
            workingGame.load(fenParts.join(' '));
            setForcedExtraMove({ square: move.to, color: move.color });
            setSpecialMessage('Cámara del Tiempo: la misma pieza debe mover otra vez.');
        }

        if (tileType === 'heavy_gravity') {
            setAnchoredPieces((prev) => ({
                ...prev,
                [move.to]: { color: move.color, state: 'pending' },
            }));
            setSpecialMessage('Gravedad Aumentada: esa pieza quedará anclada en su próximo turno.');
        }

        if (tileType === 'sacred_water' && move.piece === 'p') {
            const promotedType = randomFrom(['q', 'r', 'b', 'n']);
            workingGame.remove(move.to);
            workingGame.put({ type: promotedType, color: move.color }, move.to);

            setMoveHistory((prev) => {
                if (!updatedHistory) return prev;
                const clone = [...updatedHistory];
                const lastIndex = clone.length - 1;
                if (lastIndex >= 0) {
                    clone[lastIndex] = {
                        ...clone[lastIndex],
                        san: `${clone[lastIndex].san} (Zenkai→${promotedType.toUpperCase()})`,
                    };
                }
                return clone;
            });
            setSpecialMessage(`Agua Ultra Sagrada: Zenkai Boost → ${pieceNames[promotedType]}.`);
        }
    }, [isDragonMode, specialTiles]);

    // Cronómetro activo
    useEffect(() => {
        if (gameOver || showPauseMenu || showPiecesIntro) return;
        
        const interval = setInterval(() => {
            if (game.turn() === 'w') {
                setWhiteTime(prev => {
                    if (prev <= 0) {
                        setGameOver({
                            type: 'timeout',
                            winner: 'black',
                            message: '¡Negras Ganan por Tiempo!'
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            } else {
                setBlackTime(prev => {
                    if (prev <= 0) {
                        setGameOver({
                            type: 'timeout',
                            winner: 'white',
                            message: '¡Blancas Ganan por Tiempo!'
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, [game, gameOver, showPauseMenu, showPiecesIntro]);

    useEffect(() => {
        if (!isDragonMode) {
            setSpecialTiles({});
            setSpecialTileQueue([]);
            setAnchoredPieces({});
            setForcedExtraMove(null);
            setKiBurst({ white: false, black: false });
            return;
        }

        setSpecialTiles({});
        const queue = generateSpecialTileQueue();
        
        // Revelar la primera casilla especial inmediatamente
        if (queue.length > 0) {
            const [firstTile, ...remaining] = queue;
            setSpecialTiles((prev) => ({
                ...prev,
                [firstTile.square]: firstTile.type,
            }));
            setSpecialMessage(`${TILE_TYPE_META[firstTile.type].displayName} activada en ${firstTile.square.toUpperCase()}.`);
            setSpecialTileQueue(remaining);
        } else {
            setSpecialTileQueue(queue);
        }
        
        setAnchoredPieces({});
        setForcedExtraMove(null);
        setKiBurst({ white: false, black: false });
    }, [isDragonMode, generateSpecialTileQueue]);

    useEffect(() => {
        if (!isDragonMode || gameOver || showPauseMenu || showPiecesIntro) return;
        if (specialTileQueue.length === 0) return;

        const revealTimer = setTimeout(() => {
            setSpecialTileQueue((prevQueue) => {
                if (prevQueue.length === 0) return prevQueue;

                const [nextTile, ...remaining] = prevQueue;
                setSpecialTiles((prevTiles) => ({
                    ...prevTiles,
                    [nextTile.square]: nextTile.type,
                }));
                setSpecialMessage(`${TILE_TYPE_META[nextTile.type].displayName} activada en ${nextTile.square.toUpperCase()}.`);
                return remaining;
            });
        }, 60000);

        return () => clearTimeout(revealTimer);
    }, [isDragonMode, gameOver, showPauseMenu, showPiecesIntro, specialTileQueue]);

    useEffect(() => {
        if (!specialMessage) return;

        const timeout = setTimeout(() => setSpecialMessage(''), 2200);
        return () => clearTimeout(timeout);
    }, [specialMessage]);

    useEffect(() => {
        if (!isDragonMode || gameOver) return;

        setKiBurst((prev) => {
            const next = {
                white: prev.white || whiteTime < 60,
                black: prev.black || blackTime < 60,
            };

            if (next.white !== prev.white || next.black !== prev.black) {
                if ((next.white && !prev.white) || (next.black && !prev.black)) {
                    setSpecialMessage('Explosión de Ki activada: poder máximo en tiempo crítico.');
                }
                return next;
            }

            return prev;
        });
    }, [whiteTime, blackTime, isDragonMode, gameOver]);

    useEffect(() => {
        if (!isDragonMode) {
            previousTurnRef.current = game.turn();
            return;
        }

        const previousTurn = previousTurnRef.current;
        const currentTurn = game.turn();

        if (previousTurn !== currentTurn) {
            // Limpiar forcedExtraMove cuando cambia el turno (la acción forzada ya terminó)
            if (forcedExtraMove && forcedExtraMove.color !== currentTurn) {
                setForcedExtraMove(null);
            }
            
            setAnchoredPieces((prev) => {
                const updated = { ...prev };
                Object.entries(prev).forEach(([square, value]) => {
                    // Activar cuando es turno del jugador OPONENTE (la gravedad bloquea en el turno del que se movió)
                    if (value.state === 'pending' && currentTurn !== value.color) {
                        updated[square] = { ...value, state: 'active' };
                    } else if (value.state === 'active' && currentTurn === value.color) {
                        // Desactivar cuando es turno del propietario de la pieza anclada
                        delete updated[square];
                    }
                });
                return updated;
            });
            previousTurnRef.current = currentTurn;
        }
    }, [game, isDragonMode, anchoredPieces, forcedExtraMove]);

    // Verificar estado del juego
    useEffect(() => {
        if (game.isCheck() && !gameOver) {
            setShowCheckAnimation(true);
        } else {
            setShowCheckAnimation(false);
        }
        
        if (game.isCheckmate()) {
            setGameOver({
                type: 'checkmate',
                winner: game.turn() === 'w' ? 'black' : 'white',
                message: game.turn() === 'w' ? '¡Negras Ganan por Jaque Mate!' : '¡Blancas Ganan por Jaque Mate!'
            });
        } else if (game.isDraw()) {
            setGameOver({
                type: 'draw',
                message: '¡Empate!'
            });
        } else if (game.isStalemate()) {
            setGameOver({
                type: 'stalemate',
                message: '¡Empate por Ahogado!'
            });
        } else if (game.isThreefoldRepetition()) {
            setGameOver({
                type: 'repetition',
                message: '¡Empate por Triple Repetición!'
            });
        } else if (game.isInsufficientMaterial()) {
            setGameOver({
                type: 'insufficient',
                message: '¡Empate por Material Insuficiente!'
            });
        }
    }, [game]);
    
    // Auto-scroll para historial de movimientos
    useEffect(() => {
        if (moveHistoryRef.current) {
            moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight;
        }
    }, [moveHistory]);
    
    // Auto-scroll para piezas capturadas
    useEffect(() => {
        if (playerCapturedRef.current) {
            playerCapturedRef.current.scrollTop = playerCapturedRef.current.scrollHeight;
        }
        if (opponentCapturedRef.current) {
            opponentCapturedRef.current.scrollTop = opponentCapturedRef.current.scrollHeight;
        }
    }, [capturedPieces]);

    // Si es PVC y la CPU juega blancas (jugador eligió Villanos), hacer primer movimiento automático
    useEffect(() => {
        if (isCpuMode && !playerIsWhite && game.turn() === 'w' && moveHistory.length === 0 && !gameOver) {
            setTimeout(() => makeComputerMove(), 1200);
        }
    }, [isCpuMode, playerIsWhite, stockfishReady, moveHistory.length, gameOver]);

    // Guardar resultado de la partida al terminar y obtener recompensas
    useEffect(() => {
        if (!gameOver || !auth.user || rewardsSavedRef.current) return;
        rewardsSavedRef.current = true;

        let result = 'draw';
        if (gameOver.type === 'checkmate' || gameOver.type === 'timeout') {
            const playerWon =
                (gameOver.winner === 'white' && playerIsWhite) ||
                (gameOver.winner === 'black' && !playerIsWhite);
            result = playerWon ? 'win' : 'loss';
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        fetch(route('game.save-result'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                result,
                mode: normalizedMode,
                variant: normalizedVariant,
                difficulty,
                opponent_ki: player2?.stats?.ki ?? null,
                player2_id: player2?.id ?? null,
                player2_result: result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw',
            }),
        })
            .then(async (r) => {
                const text = await r.text();
                if (!r.ok) {
                    console.error('Error al guardar resultado HTTP', r.status, text);
                    return;
                }
                try {
                    const data = JSON.parse(text);
                    setGameRewards(data);
                } catch (e) {
                    console.error('Respuesta no es JSON:', text);
                }
            })
            .catch((err) => console.error('Fetch falló:', err));
    }, [gameOver]);

    const handleSquareClick = (square) => {
        if (gameOver) return;
        // Si el juego es contra CPU y no es el turno del jugador, bloquear las acciones
        if (normalizedMode === 'PVC') {
            const isPlayerTurn = (game.turn() === 'w' && playerIsWhite) || (game.turn() === 'b' && !playerIsWhite);
            if (!isPlayerTurn) return;
        }
        
        // Bloquear interacción mientras la CPU piensa
        if (cpuThinking) return;

        if (forcedExtraMove && game.turn() !== forcedExtraMove.color) {
            return;
        }

        // Si hay una pieza seleccionada y hacemos click en un movimiento válido
        if (selectedSquare && possibleMoves.includes(square)) {
            // Verificar si es una promoción
            const piece = game.get(selectedSquare);
            const isPromotion = piece && piece.type === 'p' && 
                ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));
            
            if (isPromotion) {
                // Guardar el movimiento pendiente y mostrar selector
                setPromotionPending({ from: selectedSquare, to: square });
                return;
            }
            
            try {
                const move = game.move({
                    from: selectedSquare,
                    to: square
                });

                if (move) {
                    // Si se capturó una pieza, agregarla a la lista
                    if (move.captured) {
                        const capturedColor = move.color === 'w' ? 'black' : 'white';
                        // Si blancas capturaron (move.color='w'), la pieza es negra (minúscula)
                        // Si negras capturaron (move.color='b'), la pieza es blanca (MAYÚSCULA)
                        const capturedPiece = move.color === 'w' ? move.captured : move.captured.toUpperCase();
                        setCapturedPieces(prev => ({
                            ...prev,
                            [capturedColor]: [...prev[capturedColor], capturedPiece]
                        }));
                    }
                    
                    const moveInfo = {
                        player: move.color === 'w' ? (playerIsWhite ? 'G' : 'V') : (playerIsWhite ? 'V' : 'G'),
                        piece: move.piece,
                        from: move.from,
                        to: move.to,
                        san: move.san,
                        timestamp: new Date()
                    };
                    const nextHistory = [...moveHistory, moveInfo];
                    setMoveHistory(nextHistory);
                    setLastMove({ from: move.from, to: move.to });

                    if (isDragonMode) {
                        const tileType = specialTiles[move.to];
                        const isTimeChamber = tileType === 'time_chamber';
                        
                        triggerTileEffects(game, move, nextHistory);

                        // Para time_chamber, no limpiar forcedExtraMove aquí (se limpió en el turno pasado)
                        // El forcedExtraMove se setea en triggerTileEffects y se limpiará cuando cambie el turno
                        
                        if (!isTimeChamber && forcedExtraMove && move.from === forcedExtraMove.square && move.color === forcedExtraMove.color) {
                            setForcedExtraMove(null);
                        }

                        Object.entries(anchoredPieces).forEach(([anchoredSquare, anchorInfo]) => {
                            const anchoredPiece = game.get(anchoredSquare);
                            if (!anchoredPiece || anchoredPiece.color !== anchorInfo.color) {
                                setAnchoredPieces((prev) => {
                                    const updated = { ...prev };
                                    delete updated[anchoredSquare];
                                    return updated;
                                });
                            }
                        });
                    }

                    setGame(new Chess(game.fen()));
                    
                        // Verificar si el juego terminó después del movimiento (crítico para segundo movimiento de time_chamber)
                        if (game.isCheckmate()) {
                            setGameOver({
                                type: 'checkmate',
                                winner: game.turn() === 'w' ? 'black' : 'white',
                                message: game.turn() === 'w' ? '¡Negras Ganan por Jaque Mate!' : '¡Blancas Ganan por Jaque Mate!'
                            });
                            setSelectedSquare(null);
                            setPossibleMoves([]);
                            return;
                        } else if (game.isDraw() || game.isStalemate()) {
                            setGameOver({
                                type: game.isStalemate() ? 'stalemate' : 'draw',
                                message: game.isStalemate() ? '¡Empate por Ahogado!' : '¡Empate!'
                            });
                            setSelectedSquare(null);
                            setPossibleMoves([]);
                            return;
                        }
                    
                    setSelectedSquare(null);
                    setPossibleMoves([]);

                    // Si es modo PVC, hacer movimiento de CPU después de un delay
                    if (isCpuMode && !game.isGameOver()) {
                        const nextCpuColor = playerIsWhite ? 'b' : 'w';
                        if (game.turn() === nextCpuColor) {
                            setTimeout(() => makeComputerMove(), 1200);
                        }
                    }
                }
            } catch (e) {
                console.error('Movimiento inválido:', e);
            }
        } else {
            // Seleccionar nueva pieza
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                if (squareIsAnchored(square, piece.color)) {
                    setSpecialMessage('Pieza anclada: no puede moverse en este turno.');
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                    return;
                }

                setSelectedSquare(square);
                const moves = getPossibleMovesForSquare(square);
                if (moves.length === 0 && forcedExtraMove && square !== forcedExtraMove.square) {
                    setSpecialMessage('Debes usar el segundo movimiento con la misma pieza de la Cámara del Tiempo.');
                }
                setPossibleMoves(moves.map(m => m.to));
            } else {
                setSelectedSquare(null);
                setPossibleMoves([]);
            }
        }
    };

    const makeComputerMove = useCallback(async () => {
        if (game.isGameOver()) return;
        const cpuColor = playerIsWhite ? 'b' : 'w';
        if (game.turn() !== cpuColor) return;

        setCpuThinking(true);

        // Si Stockfish está listo, usarlo; si no, fallback a movimiento aleatorio
        if (stockfishReady) {
            try {
                let bestMoveUci = null;
                if (isDragonMode && isCpuMode) {
                    bestMoveUci = await selectBestDragonComputerMove();
                } else {
                    bestMoveUci = await getBestMove(game.fen());
                }

                if (bestMoveUci && bestMoveUci !== '(none)') {
                    const from = bestMoveUci.substring(0, 2);
                    const to = bestMoveUci.substring(2, 4);
                    const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;

                    if (forcedExtraMove && from !== forcedExtraMove.square) {
                        const forcedMoves = getPossibleMovesForSquare(forcedExtraMove.square);
                        if (forcedMoves.length > 0) {
                            const fallbackForced = forcedMoves[0];
                            const forcedPromotion = fallbackForced.promotion;
                            const forcedMoveObj = { from: fallbackForced.from, to: fallbackForced.to };
                            if (forcedPromotion) forcedMoveObj.promotion = forcedPromotion;
                            const forcedMove = game.move(forcedMoveObj);
                            if (forcedMove) {
                                if (forcedMove.captured) {
                                    const capturedColor = forcedMove.color === 'w' ? 'black' : 'white';
                                    const capturedPiece = forcedMove.color === 'w' ? forcedMove.captured : forcedMove.captured.toUpperCase();
                                    setCapturedPieces(prev => ({
                                        ...prev,
                                        [capturedColor]: [...prev[capturedColor], capturedPiece]
                                    }));
                                }
                                const moveInfoForced = {
                                    player: forcedMove.color === 'w' ? (playerIsWhite ? 'G' : 'V') : (playerIsWhite ? 'V' : 'G'),
                                    piece: forcedMove.piece,
                                    from: forcedMove.from,
                                    to: forcedMove.to,
                                    san: forcedMove.san,
                                    timestamp: new Date()
                                };
                                const nextHistory = [...moveHistory, moveInfoForced];
                                setMoveHistory(nextHistory);
                                setLastMove({ from: forcedMove.from, to: forcedMove.to });
                                
                                let activatedTimeChamber = false;
                                if (isDragonMode) {
                                    const tileType = specialTiles[forcedMove.to];
                                    if (tileType === 'time_chamber') {
                                        activatedTimeChamber = true;
                                    }
                                }
                                
                                triggerTileEffects(game, forcedMove, nextHistory);
                                setForcedExtraMove(null);
                                setGame(new Chess(game.fen()));
                                setCpuThinking(false);
                                
                                    // Verificar fin de juego después del movimiento forzado
                                    if (game.isCheckmate()) {
                                        setGameOver({
                                            type: 'checkmate',
                                            winner: game.turn() === 'w' ? 'black' : 'white',
                                            message: game.turn() === 'w' ? '¡Negras Ganan por Jaque Mate!' : '¡Blancas Ganan por Jaque Mate!'
                                        });
                                        return;
                                    }
                                
                                // Si la CPU activó time_chamber en el movimiento forzado, programar su próximo movimiento
                                if (activatedTimeChamber && isCpuMode && !game.isGameOver()) {
                                    setTimeout(() => makeComputerMove(), 1200);
                                }
                                return;
                            }
                        }
                    }

                    const moveObj = { from, to };
                    if (promotion) moveObj.promotion = promotion;

                    const move = game.move(moveObj);
                    if (move) {
                        if (move.captured) {
                            const capturedColor = move.color === 'w' ? 'black' : 'white';
                            const capturedPiece = move.color === 'w' ? move.captured : move.captured.toUpperCase();
                            setCapturedPieces(prev => ({
                                ...prev,
                                [capturedColor]: [...prev[capturedColor], capturedPiece]
                            }));
                        }
                        const moveInfo = {
                            player: move.color === 'w' ? (playerIsWhite ? 'G' : 'V') : (playerIsWhite ? 'V' : 'G'),
                            piece: move.piece,
                            from: move.from,
                            to: move.to,
                            san: move.san,
                            timestamp: new Date()
                        };
                        const nextHistory = [...moveHistory, moveInfo];
                        setMoveHistory(nextHistory);
                        setLastMove({ from: move.from, to: move.to });
                        
                        let activatedTimeChamber = false;
                        if (isDragonMode) {
                            const tileType = specialTiles[move.to];
                            if (tileType === 'time_chamber') {
                                activatedTimeChamber = true;
                            }
                            
                            triggerTileEffects(game, move, nextHistory);

                            if (forcedExtraMove && move.from === forcedExtraMove.square && move.color === forcedExtraMove.color) {
                                setForcedExtraMove(null);
                            }
                        }
                        
                        setGame(new Chess(game.fen()));
                        setCpuThinking(false);
                        
                            // Verificar fin de juego después del movimiento de CPU
                            if (game.isCheckmate()) {
                                setGameOver({
                                    type: 'checkmate',
                                    winner: game.turn() === 'w' ? 'black' : 'white',
                                    message: game.turn() === 'w' ? '¡Negras Ganan por Jaque Mate!' : '¡Blancas Ganan por Jaque Mate!'
                                });
                                return;
                            }
                        
                        // Si la CPU activó time_chamber, programar su próximo movimiento inmediatamente
                        if (activatedTimeChamber && isCpuMode && !game.isGameOver()) {
                            setTimeout(() => makeComputerMove(), 1200);
                        }
                        return;
                    }
                }
            } catch (err) {
                console.warn('Stockfish error, usando fallback:', err);
            }
        }

        // Fallback: movimiento aleatorio
        let moves = game.moves({ verbose: true });
        if (forcedExtraMove) {
            moves = moves.filter((m) => m.from === forcedExtraMove.square);
        }
        if (isDragonMode) {
            const moverColor = game.turn();
            moves = moves.filter((m) => !squareIsAnchored(m.from, moverColor));
        }
        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            const move = game.move(randomMove);
            let activatedTimeChamber = false;
            if (move) {
                if (move.captured) {
                    const capturedColor = move.color === 'w' ? 'black' : 'white';
                    const capturedPiece = move.color === 'w' ? move.captured : move.captured.toUpperCase();
                    setCapturedPieces(prev => ({
                        ...prev,
                        [capturedColor]: [...prev[capturedColor], capturedPiece]
                    }));
                }
                const moveInfo = {
                    player: move.color === 'w' ? (playerIsWhite ? 'G' : 'V') : (playerIsWhite ? 'V' : 'G'),
                    piece: move.piece,
                    from: move.from,
                    to: move.to,
                    san: move.san,
                    timestamp: new Date()
                };
                const nextHistory = [...moveHistory, moveInfo];
                setMoveHistory(nextHistory);
                
                if (isDragonMode) {
                    const tileType = specialTiles[move.to];
                    if (tileType === 'time_chamber') {
                        activatedTimeChamber = true;
                    }
                    
                    triggerTileEffects(game, move, nextHistory);
                    if (forcedExtraMove && move.from === forcedExtraMove.square && move.color === forcedExtraMove.color) {
                        setForcedExtraMove(null);
                    }
                }
            }
            setLastMove({ from: randomMove.from, to: randomMove.to });
            setGame(new Chess(game.fen()));
            
                // Verificar fin de juego después del movimiento aleatorio
                if (game.isCheckmate()) {
                    setGameOver({
                        type: 'checkmate',
                        winner: game.turn() === 'w' ? 'black' : 'white',
                        message: game.turn() === 'w' ? '¡Negras Ganan por Jaque Mate!' : '¡Blancas Ganan por Jaque Mate!'
                    });
                    setCpuThinking(false);
                    return;
                }
            
            // Si la CPU activó time_chamber, programar su próximo movimiento inmediatamente
            if (activatedTimeChamber && isCpuMode && !game.isGameOver()) {
                setTimeout(() => makeComputerMove(), 1200);
            }
        }
        setCpuThinking(false);
    }, [game, stockfishReady, getBestMove, playerIsWhite, selectBestDragonComputerMove, forcedExtraMove, getPossibleMovesForSquare, moveHistory, isDragonMode, triggerTileEffects, specialTiles, isCpuMode, squareIsAnchored]);
    
    const handlePromotion = (pieceType) => {
        if (!promotionPending) return;
        
        try {
            const move = game.move({
                from: promotionPending.from,
                to: promotionPending.to,
                promotion: pieceType
            });

            if (move) {
                // Si se capturó una pieza, agregarla a la lista
                if (move.captured) {
                    const capturedColor = move.color === 'w' ? 'black' : 'white';
                    // Si blancas capturaron (move.color='w'), la pieza es negra (minúscula)
                    // Si negras capturaron (move.color='b'), la pieza es blanca (MAYÚSCULA)
                    const capturedPiece = move.color === 'w' ? move.captured : move.captured.toUpperCase();
                    setCapturedPieces(prev => ({
                        ...prev,
                        [capturedColor]: [...prev[capturedColor], capturedPiece]
                    }));
                }
                
                const moveInfo = {
                    player: move.color === 'w' ? (playerIsWhite ? 'G' : 'V') : (playerIsWhite ? 'V' : 'G'),
                    piece: move.piece,
                    from: move.from,
                    to: move.to,
                    san: move.san,
                    timestamp: new Date()
                };
                const nextHistory = [...moveHistory, moveInfo];
                setMoveHistory(nextHistory);
                setLastMove({ from: move.from, to: move.to });
                if (isDragonMode) {
                    triggerTileEffects(game, move, nextHistory);
                }
                setGame(new Chess(game.fen()));
                
                    // Verificar si el juego terminó después de la promoción
                    if (game.isCheckmate()) {
                        setGameOver({
                            type: 'checkmate',
                            winner: game.turn() === 'w' ? 'black' : 'white',
                            message: game.turn() === 'w' ? '¡Negras Ganan por Jaque Mate!' : '¡Blancas Ganan por Jaque Mate!'
                        });
                        setSelectedSquare(null);
                        setPossibleMoves([]);
                        setPromotionPending(null);
                        return;
                    } else if (game.isDraw() || game.isStalemate()) {
                        setGameOver({
                            type: game.isStalemate() ? 'stalemate' : 'draw',
                            message: game.isStalemate() ? '¡Empate por Ahogado!' : '¡Empate!'
                        });
                        setSelectedSquare(null);
                        setPossibleMoves([]);
                        setPromotionPending(null);
                        return;
                    }
                
                setSelectedSquare(null);
                setPossibleMoves([]);
                setPromotionPending(null);

                // Si es modo PVC, hacer movimiento de CPU después de un delay
                if (isCpuMode && !game.isGameOver()) {
                    const nextCpuColor = playerIsWhite ? 'b' : 'w';
                    if (game.turn() === nextCpuColor) {
                        setTimeout(() => makeComputerMove(), 1200);
                    }
                }
            }
        } catch (e) {
            console.error('Movimiento inválido:', e);
        }
    };

    const getSquareName = (row, col) => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[col] + ranks[row];
    };

    const getPieceAt = (square) => {
        const piece = game.get(square);
        return piece ? pieceSymbols[piece.type === piece.type.toUpperCase() ? piece.type.toUpperCase() : piece.type] : null;
    };

    const renderSquare = (row, col) => {
        const isDark = (row + col) % 2 === 1;
        const square = getSquareName(row, col);
        const piece = game.get(square);
        const tileType = specialTiles[square];
        const isSelected = selectedSquare === square;
        const isPossibleMove = possibleMoves.includes(square);
        const isInCheck = game.isCheck() && piece && piece.type === 'k' && piece.color === game.turn();
        const isLastMoveFrom = lastMove && lastMove.from === square;
        const isLastMoveTo = lastMove && lastMove.to === square;
        const isAnchored = piece ? squareIsAnchored(square, piece.color) : false;
        const isForcedPiece = forcedExtraMove && forcedExtraMove.square === square;

        return (
            <div 
                key={`${row}-${col}`}
                onClick={() => handleSquareClick(square)}
                className={`relative w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-200
                    ${isDark ? 'bg-black' : 'bg-white'}
                    ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                    ${isInCheck ? 'bg-red-500/50' : ''}
                    ${isLastMoveFrom ? 'bg-yellow-500/20' : ''}
                    ${isLastMoveTo ? 'bg-yellow-500/30' : ''}
                    ${tileType === 'time_chamber' ? 'after:absolute after:inset-0 after:bg-cyan-400/15 after:pointer-events-none' : ''}
                    ${tileType === 'heavy_gravity' ? 'after:absolute after:inset-0 after:bg-red-500/15 after:pointer-events-none' : ''}
                    ${tileType === 'sacred_water' ? 'after:absolute after:inset-0 after:bg-emerald-400/15 after:pointer-events-none' : ''}
                    ${tileType === 'time_chamber' ? 'shadow-[inset_0_0_12px_rgba(34,211,238,0.35)]' : ''}
                    ${tileType === 'heavy_gravity' ? 'shadow-[inset_0_0_12px_rgba(248,113,113,0.35)]' : ''}
                    ${tileType === 'sacred_water' ? 'shadow-[inset_0_0_12px_rgba(52,211,153,0.35)]' : ''}
                    hover:brightness-110
                `}
            >
                {tileType && (() => {
                    const TileIcon = TILE_TYPE_META[tileType]?.icon;
                    if (!TileIcon) return null;
                    return (
                        <div className="absolute top-1 left-1 z-20 pointer-events-none">
                            <TileIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/90 drop-shadow-lg" />
                        </div>
                    );
                })()}
                {piece && (
                    <span className={`text-4xl md:text-5xl select-none transition-all duration-700 ease-in-out ${isLastMoveTo ? 'animate-piece-land' : ''} ${
                        (piece.color === 'w' && playerIsWhite) || (piece.color === 'b' && !playerIsWhite)
                            ? (faction === 'Z_WARRIORS' ? 'text-primary' : 'text-purple-500')
                            : (faction === 'Z_WARRIORS' ? 'text-purple-500' : 'text-primary')
                    } ${
                        isSelected 
                            ? ((piece.color === 'w' && playerIsWhite) || (piece.color === 'b' && !playerIsWhite)
                                ? (faction === 'Z_WARRIORS' ? 'drop-shadow-[0_0_25px_rgba(249,122,31,1)] scale-110' : 'drop-shadow-[0_0_25px_rgba(168,85,247,1)] scale-110')
                                : (faction === 'Z_WARRIORS' ? 'drop-shadow-[0_0_25px_rgba(168,85,247,1)] scale-110' : 'drop-shadow-[0_0_25px_rgba(249,122,31,1)] scale-110'))
                            : 'drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                    } ${isAnchored ? 'opacity-60 grayscale' : ''} ${isForcedPiece ? 'ring-2 ring-cyan-300 rounded-md' : ''}`}>
                        {getPieceImage(piece) ? (
                            <img 
                                src={getPieceImage(piece)} 
                                alt={`${piece.type}`}
                                className="w-full h-full object-contain p-1"
                            />
                        ) : (
                            pieceSymbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]
                        )}
                    </span>
                )}
                {isPossibleMove && (
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                        <div className={`${piece ? 'w-full h-full border-4 border-yellow-400/60' : 'w-4 h-4 bg-yellow-400/60 rounded-full'}`}></div>
                    </div>
                )}
            </div>
        );
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const resetGame = () => {
        stopStockfish();
        setGame(new Chess());
        setSelectedSquare(null);
        setPossibleMoves([]);
        setGameOver(null);
        setMoveHistory([]);
        setWhiteTime(600);
        setBlackTime(600);
        setCapturedPieces({ white: [], black: [] });
        setPromotionPending(null);
        setShowCheckAnimation(false);
        setCpuThinking(false);
        setLastMove(null);
        setShowPiecesIntro(true);
        setGameRewards(null);
        setGameOverMinimized(false);
        setAnchoredPieces({});
        setForcedExtraMove(null);
        setSpecialMessage('');
        setKiBurst({ white: false, black: false });
        if (isDragonMode) {
            setSpecialTiles({});
            setSpecialTileQueue(generateSpecialTileQueue());
        } else {
            setSpecialTiles({});
            setSpecialTileQueue([]);
        }
        rewardsSavedRef.current = false;
    };
    
    const getTurnText = () => {
        const isWhiteTurn = game.turn() === 'w';
        if (playerIsWhite) {
            return isWhiteTurn ? 'Guerrero Z' : 'Villano';
        } else {
            return isWhiteTurn ? 'Guerrero Z' : 'Villano';
        }
    };
    
    const pieceNames = {
        'p': 'Peón',
        'n': 'Caballo',
        'b': 'Alfil',
        'r': 'Torre',
        'q': 'Reina',
        'k': 'Rey'
    };

    return (
        <>
            <Head title="Dragon Chess - Battle Arena" />
            <div className="flex flex-col h-screen relative overflow-hidden bg-[#0d0e12]">
                {/* Top Header */}
                <header className="px-4 md:px-10 py-3 md:py-4 flex items-center justify-between border-b border-white/10 bg-black/65 backdrop-blur-xl">
                    <div className="flex items-center gap-2 md:gap-3">
                        <button onClick={() => setShowPauseMenu(true)} className="flex items-center gap-1 md:gap-2 group text-white/60 hover:text-yellow-500 transition-colors">
                            <PauseIcon className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Pausa</span>
                        </button>
                        <button onClick={() => setShowPiecesReference(true)} className="flex items-center gap-1 md:gap-2 group text-white/60 hover:text-blue-500 transition-colors">
                            <PhotoIcon className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Piezas</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                            game.turn() === 'w'
                                ? 'bg-primary'
                                : 'bg-purple-500'
                        }`}></div>
                        <span className={`text-[9px] md:text-xs font-black tracking-[0.15em] md:tracking-[0.4em] uppercase ${
                            game.turn() === 'w'
                                ? 'text-primary'
                                : 'text-purple-500'
                        }`}>
                            Turno: {getTurnText()}
                            {game.isCheck() && ' - ¡JAQUE!'}
                        </span>
                    </div>
                </header>

                {isDragonMode && (
                    <div className="px-4 md:px-10 py-2 border-b border-white/10 bg-black/45">
                        <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest">
                            <span className="text-cyan-300">Modo Dragon Chess</span>
                            {kiBurst.white && <span className="text-orange-400">Explosión Ki Blancas</span>}
                            {kiBurst.black && <span className="text-purple-300">Explosión Ki Negras</span>}
                        </div>
                    </div>
                )}

                {/* Main Game Area */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Left: Player Zone */}
                    <aside className={`order-3 md:order-1 w-full md:w-80 border-t md:border-t-0 md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-4 transition-all duration-300 overflow-y-auto ${
                        ((game.turn() === 'w' && playerIsWhite) || (game.turn() === 'b' && !playerIsWhite))
                            ? (game.isCheck() 
                                ? 'bg-red-500/20 border-red-500/50 animate-pulse' 
                                : 'bg-primary/10 border-primary/30')
                            : 'bg-black/40'
                    }`}
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(249, 122, 31, 0.3) rgba(255, 255, 255, 0.05)'
                    }}
                    >
                    <div className="flex flex-row md:flex-col items-center gap-3 md:gap-4 flex-shrink-0">
                        <ElectricBorder 
                            color={faction === 'Z_WARRIORS' ? '#F97A1F' : '#A855F7'}
                            speed={2}
                            chaos={0.2}
                            active={((game.turn() === 'w' && playerIsWhite) || (game.turn() === 'b' && !playerIsWhite))}
                        >
                            <div className="relative transform -rotate-2">
                                <div className={`w-20 h-20 md:w-36 md:h-36 rounded-2xl md:rounded-3xl border-2 md:border-4 overflow-hidden bg-black p-1 ${
                                    faction === 'Z_WARRIORS' 
                                        ? 'border-primary shadow-neon-orange' 
                                        : 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                }`}>
                                    <img src={player.avatar} alt="You" className="w-full h-full object-cover rounded-xl md:rounded-2xl" />
                                </div>
                                <div className={`absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 text-[8px] md:text-xs font-black px-2 md:px-4 py-0.5 md:py-1 rounded shadow-lg uppercase ${
                                    faction === 'Z_WARRIORS' ? 'bg-primary' : 'bg-purple-500'
                                }`}>
                                    {faction === 'Z_WARRIORS' ? 'Guerrero Z' : 'Villano'}
                                </div>
                            </div>
                        </ElectricBorder>
                        <div className="text-left md:text-center">
                            <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 md:mb-2 text-white">{player.name}</h3>
                            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black text-primary/80">TÚ</span>
                        </div>
                    </div>
                        
                    <div className="flex flex-col items-center justify-center flex-shrink-0">
                        <div className="flex flex-col items-center">
                            <span className={`text-3xl md:text-6xl font-mono font-black leading-none ${
                                faction === 'Z_WARRIORS' 
                                    ? 'text-primary drop-shadow-[0_0_20px_rgba(249,122,31,0.5)]' 
                                    : 'text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                            }`}>
                                {formatTime(playerIsWhite ? whiteTime : blackTime)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Piezas capturadas por el Guerrero (del Villano) */}
                    <div className="hidden md:block flex-shrink-0">
                        <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-2">Piezas Capturadas</h4>
                        <div 
                            ref={playerCapturedRef}
                            className="flex flex-wrap gap-1 min-h-[40px] max-h-[80px] overflow-y-auto p-2 bg-white/5 rounded-lg"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(249, 122, 31, 0.3) rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            {(playerIsWhite ? capturedPieces.black : capturedPieces.white).map((piece, i) => {
                                const isWhitePiece = piece === piece.toUpperCase();
                                const capturedImage = getCapturedPieceImage(piece, isWhitePiece);
                                return (
                                    <div key={i} className="w-8 h-8 opacity-50">
                                        {capturedImage ? (
                                            <img 
                                                src={capturedImage} 
                                                alt={piece}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-2xl">{pieceSymbols[piece]}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col space-y-4 min-h-0 flex-shrink-0" style={{ maxHeight: '200px' }}>
                        <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2 flex-shrink-0">Registro de Combate</h4>
                        <div 
                            ref={moveHistoryRef}
                            className="flex-1 overflow-y-auto space-y-1.5 text-[11px] font-mono min-h-0"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(249, 122, 31, 0.3) rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            {moveHistory.length === 0 ? (
                                <p className="opacity-50 text-white/60 italic">Esperando primer movimiento...</p>
                            ) : (
                                moveHistory.map((move, i) => (
                                    <div key={i} className={`flex items-start gap-2 p-2 rounded ${
                                        move.player === 'G' ? 'bg-primary/10' : 'bg-purple-500/10'
                                    }`}>
                                        <span className={`font-black ${
                                            move.player === 'G' ? 'text-primary' : 'text-purple-500'
                                        }`}>{move.player}</span>
                                        <span className="text-white/60">
                                            {pieceNames[move.piece]} {move.from}→{move.to}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Middle: Tactical Map (Chess Board) */}
                <main className="order-2 flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]"></div>
                    
                    {/* Mobile Action Buttons - Arriba del tablero */}
                    <div className="md:hidden flex gap-2 mb-4 w-full max-w-[350px]">
                        <button
                            onClick={() => setShowCapturedPiecesModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black/25 hover:bg-black/40 border border-white/15 rounded-xl transition-all"
                        >
                            <TrophyIcon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-white">Capturas</span>
                        </button>
                        <button
                            onClick={() => setShowMoveHistoryModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black/25 hover:bg-black/40 border border-white/15 rounded-xl transition-all"
                        >
                            <ClipboardDocumentListIcon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-white">Movimientos</span>
                        </button>
                    </div>
                    
                    {/* Check Warning - Arriba del tablero */}
                    {showCheckAnimation && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                            <div className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-red-500 animate-pulse drop-shadow-[0_0_40px_rgba(239,68,68,1)]">
                                ¡JAQUE!
                            </div>
                        </div>
                    )}
                    
                    {/* Special Tile Message - Arriba del tablero */}
                    {specialMessage && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full max-w-lg px-4">
                                <div className="text-center bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-yellow-300/50 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                                    <div className="text-xs md:text-sm font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {specialMessage}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="relative">
                        <div className="flex gap-2">
                            {/* Coordenadas izquierdas (8-1) */}
                            <div className="flex flex-col justify-around py-[4px] md:py-[8px]">
                                {['8', '7', '6', '5', '4', '3', '2', '1'].map(rank => (
                                    <span key={rank} className="text-white/40 text-xs md:text-sm font-bold h-[calc(100%/8)] flex items-center">{rank}</span>
                                ))}
                            </div>
                            
                            <div className="flex flex-col">
                            <div className="relative w-full max-w-[350px] md:max-w-[500px] aspect-square bg-[#1a1b1e] border-4 md:border-[8px] border-[#2d2e32] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] grid grid-cols-8 grid-rows-8 group">
                        {/* Holographic Overlays */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        
                        {Array.from({ length: 64 }).map((_, i) => renderSquare(Math.floor(i / 8), i % 8))}

                        {/* Scouter Lines */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 pointer-events-none"></div>
                            </div>
                            
                            {/* Coordenadas inferiores (a-h) */}
                            <div className="flex justify-around mt-2 px-[4px] md:px-[8px]">
                                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
                                    <span key={file} className="text-white/40 text-xs md:text-sm font-bold w-[calc(100%/8)] text-center">{file}</span>
                                ))}
                            </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right: Opponent Zone */}
                <aside className={`order-1 md:order-3 w-full md:w-80 border-b md:border-b-0 md:border-t-0 md:border-l border-white/5 p-4 md:p-6 flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-4 transition-all duration-300 overflow-y-auto ${
                        ((game.turn() === 'b' && playerIsWhite) || (game.turn() === 'w' && !playerIsWhite))
                            ? (game.isCheck() 
                                ? 'bg-red-500/20 border-red-500/50 animate-pulse' 
                                : 'bg-purple-500/10 border-purple-500/30')
                            : 'bg-black/40'
                    }`}
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(168, 85, 247, 0.3) rgba(255, 255, 255, 0.05)'
                    }}
                    >
                    <div className="flex flex-row md:flex-col items-center gap-3 md:gap-4 flex-shrink-0">
                        <ElectricBorder 
                            color={faction === 'Z_WARRIORS' ? '#A855F7' : '#F97A1F'}
                            speed={2}
                            chaos={0.2}
                            active={((game.turn() === 'b' && playerIsWhite) || (game.turn() === 'w' && !playerIsWhite))}
                        >
                            <div className="relative transform rotate-3">
                                <div className={`w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-2 md:border-4 overflow-hidden bg-black p-1 ${
                                    faction === 'Z_WARRIORS' 
                                        ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                                        : 'border-primary shadow-neon-orange'
                                }`}>
                                    <img src={opponent.avatar} alt="Opponent" className="w-full h-full object-cover rounded-xl md:rounded-2xl" />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 text-[8px] md:text-xs font-black px-2 md:px-4 py-0.5 md:py-1 rounded shadow-lg uppercase ${
                                    faction === 'Z_WARRIORS' ? 'bg-purple-500' : 'bg-primary'
                                }`}>
                                    {faction === 'Z_WARRIORS' ? 'Villano' : 'Guerrero Z'}
                                </div>
                            </div>
                        </ElectricBorder>
                        <div className="text-left md:text-center">
                            <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 md:mb-2 text-white">{opponent.name}</h3>
                            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black text-purple-300/80">{isCpuMode ? 'CPU' : 'RIVAL'}</span>
                            {isCpuMode && (
                                <div className="flex flex-col items-start md:items-center gap-1">
                                    <span className={`text-[9px] md:text-xs font-bold uppercase tracking-widest ${
                                        difficulty === 1 ? 'text-green-400' : difficulty === 2 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {difficulty === 1 ? 'Fácil' : difficulty === 2 ? 'Normal' : 'Difícil'}
                                    </span>
                                    {cpuThinking && (
                                        <span className="text-[10px] md:text-xs text-purple-400 animate-pulse font-bold">
                                            {isDragonMode ? 'Analizando casillas especiales...' : 'Pensando...'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                        
                    <div className="flex flex-col items-center justify-center flex-shrink-0">
                        <div className="flex flex-col items-center">
                            <span className={`text-3xl md:text-5xl font-mono font-black leading-none ${
                                faction === 'Z_WARRIORS' ? 'text-purple-500' : 'text-primary'
                            }`}>
                                {formatTime(playerIsWhite ? blackTime : whiteTime)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Piezas capturadas por el Villano (del Guerrero) */}
                    <div className="hidden md:block flex-shrink-0">
                        <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-2">Piezas Capturadas</h4>
                        <div 
                            ref={opponentCapturedRef}
                            className="flex flex-wrap gap-1 min-h-[40px] max-h-[80px] overflow-y-auto p-2 bg-white/5 rounded-lg"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(168, 85, 247, 0.3) rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            {(playerIsWhite ? capturedPieces.white : capturedPieces.black).map((piece, i) => {
                                const isWhitePiece = piece === piece.toUpperCase();
                                const capturedImage = getCapturedPieceImage(piece, isWhitePiece);
                                return (
                                    <div key={i} className="w-8 h-8 opacity-50">
                                        {capturedImage ? (
                                            <img 
                                                src={capturedImage} 
                                                alt={piece}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-2xl">{pieceSymbols[piece.toUpperCase()]}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
                </div>



                {/* Promotion Selection Modal */}
                {promotionPending && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-primary/30 rounded-3xl p-8 max-w-md mx-4 shadow-[0_0_50px_rgba(249,122,31,0.2)]">
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <TrophyIcon className="w-16 h-16 text-yellow-500" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Promoción de Peón</h3>
                                <p className="text-white/60 text-sm">Selecciona la pieza a la que quieres promover:</p>
                                <div className="grid grid-cols-4 gap-4 pt-4">
                                    {['q', 'r', 'b', 'n'].map(piece => {
                                        const isPieceForWhite = game.turn() === 'w';
                                        const pieceColor = isPieceForWhite 
                                            ? (playerIsWhite ? 'text-primary' : 'text-purple-500')
                                            : (playerIsWhite ? 'text-purple-500' : 'text-primary');
                                        const promotionImage = getPromotionPieceImage(piece);
                                        
                                        return (
                                            <button
                                                key={piece}
                                                onClick={() => handlePromotion(piece)}
                                                className={`p-4 bg-white/5 rounded-xl border-2 border-white/10 hover:border-primary hover:bg-white/10 transition-all group`}
                                            >
                                                <div className="w-12 h-12 mx-auto group-hover:scale-110 transition-transform">
                                                    {promotionImage ? (
                                                        <img 
                                                            src={promotionImage} 
                                                            alt={pieceNames[piece]}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <span className={`text-5xl ${pieceColor} inline-block`}>
                                                            {pieceSymbols[isPieceForWhite ? piece.toUpperCase() : piece]}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/60 mt-2 font-bold">
                                                    {pieceNames[piece]}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pause Menu */}
                {showPauseMenu && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-yellow-500/30 rounded-3xl p-8 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                            <div className="space-y-4">
                                <div className="text-center space-y-2 mb-6">
                                    <PauseIcon className="w-16 h-16 text-yellow-500 mx-auto" />
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Juego Pausado</h3>
                                </div>
                                
                                <button 
                                    onClick={() => setShowPauseMenu(false)}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3"
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    Reanudar
                                </button>
                                
                                <button 
                                    onClick={() => { setShowPauseMenu(false); setShowConfirmAbort(true); }}
                                    className="w-full py-4 bg-white/5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                    Abortar Misión
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pieces Reference Modal */}
                {showPiecesReference && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-blue-500/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(59,130,246,0.3)]">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Referencia de Piezas</h3>
                                    <button 
                                        onClick={() => setShowPiecesReference(false)}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                
                                {/* Player 1 Pieces */}
                                <div>
                                    <h4 className={`text-lg font-black uppercase tracking-wider mb-4 ${faction === 'Z_WARRIORS' ? 'text-primary' : 'text-purple-500'}`}>Mis Piezas ({faction === 'Z_WARRIORS' ? 'Guerreros Z' : 'Villanos'})</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(pieceTypeMap).map(([key, name]) => {
                                            const factionKey = faction === 'Z_WARRIORS' ? 'guerreros' : 'villanos';
                                            const image = resolveCharacterImageUrl(player1Preferences?.[factionKey]?.[name]);
                                            const pieceNames = { rey: 'Rey', reina: 'Reina', torre: 'Torre', caballo: 'Caballo', alfil: 'Alfil', peon: 'Peón' };
                                            return (
                                                <div key={key} className={`bg-white/5 rounded-xl p-4 border border-white/10 transition-colors ${faction === 'Z_WARRIORS' ? 'hover:border-primary/50' : 'hover:border-purple-500/50'}`}>
                                                    <div className="aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                                        {image ? (
                                                            <img src={image} alt={name} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span className="text-4xl">{pieceSymbols[key.toUpperCase()]}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-center text-white font-bold text-sm">{pieceNames[name]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* Opponent Pieces */}
                                <div>
                                    <h4 className={`text-lg font-black uppercase tracking-wider mb-4 ${faction === 'Z_WARRIORS' ? 'text-purple-500' : 'text-primary'}`}>Piezas Rivales ({faction === 'Z_WARRIORS' ? 'Villanos' : 'Guerreros Z'})</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(pieceTypeMap).map(([key, name]) => {
                                            const factionKey = faction === 'Z_WARRIORS' ? 'villanos' : 'guerreros';
                                            const preferences = (player2 === null || !player2) ? player1Preferences : player2Preferences;
                                            const image = resolveCharacterImageUrl(preferences?.[factionKey]?.[name]);
                                            const pieceNames = { rey: 'Rey', reina: 'Reina', torre: 'Torre', caballo: 'Caballo', alfil: 'Alfil', peon: 'Peón' };
                                            return (
                                                <div key={key} className={`bg-white/5 rounded-xl p-4 border border-white/10 transition-colors ${faction === 'Z_WARRIORS' ? 'hover:border-purple-500/50' : 'hover:border-primary/50'}`}>
                                                    <div className="aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                                        {image ? (
                                                            <img src={image} alt={name} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span className="text-4xl">{pieceSymbols[key.toLowerCase()]}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-center text-white font-bold text-sm">{pieceNames[name]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Abort Modal */}
                {showConfirmAbort && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-red-500/30 rounded-3xl p-8 max-w-md mx-4 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <ExclamationTriangleIcon className="w-16 h-16 text-red-400" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Confirmar Aborto</h3>
                                <p className="text-white/60 text-sm">¿Estás seguro de que quieres abandonar la batalla? Perderás todo el progreso actual.</p>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => setShowConfirmAbort(false)}
                                        className="flex-1 py-3 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-black uppercase text-sm tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleAbortMission}
                                        className="flex-1 py-3 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-all font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                    >
                                        Abortar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Game Over Modal */}
                {gameOver && (
                    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-500">
                        {/* ── MINIMIZADO: chip flotante ── */}
                        {gameOverMinimized ? (
                            <button
                                onClick={() => setGameOverMinimized(false)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-black uppercase text-sm tracking-widest shadow-[0_0_30px_rgba(0,0,0,0.7)] transition-all hover:brightness-110 ${
                                    gameOver.type === 'checkmate'
                                        ? gameOver.winner === 'white'
                                            ? 'bg-[#1a1b1e] border-primary text-primary shadow-neon-orange'
                                            : 'bg-[#1a1b1e] border-purple-500 text-purple-400'
                                        : 'bg-[#1a1b1e] border-yellow-500 text-yellow-400'
                                }`}
                            >
                                {gameOver.type === 'checkmate'
                                    ? <TrophyIcon className="w-4 h-4" />
                                    : <HandRaisedIcon className="w-4 h-4" />}
                                {gameOver.type === 'checkmate' ? '¡Jaque Mate!' : '¡Empate!'}
                                <ChevronUpIcon className="w-4 h-4 opacity-60" />
                            </button>
                        ) : (
                        /* ── EXPANDIDO: modal completo ── */
                        <ElectricBorder
                            color={
                                gameOver.type === 'checkmate'
                                    ? (gameOver.winner === 'white' ? '#F97A1F' : '#A855F7')
                                    : '#3B82F6'
                            }
                            speed={1.5}
                            chaos={0.15}
                        >
                            <div className={`bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 rounded-2xl p-6 w-80 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative ${
                                gameOver.type === 'checkmate'
                                    ? gameOver.winner === 'white' ? 'border-primary shadow-neon-orange' : 'border-purple-500'
                                    : 'border-yellow-500'
                            }`}>
                                {/* Barra de acciones: minimizar */}
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <button
                                        onClick={() => setGameOverMinimized(true)}
                                        title="Minimizar para ver el tablero"
                                        className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        <ChevronDownIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">
                                            {gameOver.type === 'checkmate' ? (
                                                <TrophyIcon className="w-12 h-12 text-yellow-500" />
                                            ) : (
                                                <HandRaisedIcon className="w-12 h-12 text-yellow-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-black uppercase tracking-tighter leading-tight ${
                                                gameOver.type === 'checkmate'
                                                    ? gameOver.winner === 'white' ? 'text-primary' : 'text-purple-500'
                                                    : 'text-yellow-500'
                                            }`}>
                                                {gameOver.type === 'checkmate' ? '¡Jaque Mate!' : '¡Empate!'}
                                            </h3>
                                            <p className="text-white/60 text-xs">
                                                {gameOver.message}
                                            </p>
                                        </div>
                                    </div>

                                    {moveHistory.length > 0 && (
                                        <div className="bg-white/5 rounded-lg p-3 max-h-48 overflow-y-auto" style={{
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: 'rgba(249, 122, 31, 0.3) rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">Historial</p>
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-white/60 text-xs font-mono">
                                                {moveHistory.map((move, i) => (
                                                    <div key={i} className="truncate">{i + 1}. {move.san}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleReturnToMenu}
                                            className="flex-1 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-black uppercase text-xs tracking-widest"
                                        >
                                            Regresar
                                        </button>
                                        <button
                                            onClick={resetGame}
                                            className={`flex-1 py-2.5 rounded-lg text-white transition-all font-black uppercase text-xs tracking-widest ${
                                                gameOver.type === 'checkmate'
                                                    ? gameOver.winner === 'white'
                                                        ? 'bg-primary hover:brightness-110 shadow-neon-orange'
                                                        : 'bg-purple-500 hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                                    : 'bg-yellow-500 hover:brightness-110'
                                            }`}
                                        >
                                            Revancha
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ElectricBorder>
                        )}
                    </div>
                )}

                {/* Modal de Piezas Capturadas (Solo Móvil) */}
                {showCapturedPiecesModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 md:hidden p-4">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-primary/30 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                                    <TrophyIcon className="w-6 h-6 text-primary" />
                                    Piezas Capturadas
                                </h3>
                                <button
                                    onClick={() => setShowCapturedPiecesModal(false)}
                                    className="p-2 text-white/60 hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Piezas del Jugador */}
                            <div className="mb-6">
                                <h4 className="text-sm font-black uppercase text-primary tracking-widest mb-3">
                                    Tus Capturas
                                </h4>
                                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-white/5 rounded-lg border border-white/10">
                                    {(playerIsWhite ? capturedPieces.black : capturedPieces.white).length === 0 ? (
                                        <p className="text-white/40 text-xs italic w-full text-center py-4">
                                            Aún no has capturado piezas
                                        </p>
                                    ) : (
                                        (playerIsWhite ? capturedPieces.black : capturedPieces.white).map((piece, i) => {
                                            const isWhitePiece = piece === piece.toUpperCase();
                                            const capturedImage = getCapturedPieceImage(piece, isWhitePiece);
                                            return (
                                                <div key={i} className="w-10 h-10 opacity-70">
                                                    {capturedImage ? (
                                                        <img 
                                                            src={capturedImage} 
                                                            alt={piece}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl">{pieceSymbols[piece]}</span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Piezas del Oponente */}
                            <div>
                                <h4 className="text-sm font-black uppercase text-purple-500 tracking-widest mb-3">
                                    Capturas del Oponente
                                </h4>
                                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-white/5 rounded-lg border border-white/10">
                                    {(playerIsWhite ? capturedPieces.white : capturedPieces.black).length === 0 ? (
                                        <p className="text-white/40 text-xs italic w-full text-center py-4">
                                            El oponente no ha capturado piezas
                                        </p>
                                    ) : (
                                        (playerIsWhite ? capturedPieces.white : capturedPieces.black).map((piece, i) => {
                                            const isWhitePiece = piece === piece.toUpperCase();
                                            const capturedImage = getCapturedPieceImage(piece, isWhitePiece);
                                            return (
                                                <div key={i} className="w-10 h-10 opacity-70">
                                                    {capturedImage ? (
                                                        <img 
                                                            src={capturedImage} 
                                                            alt={piece}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl">{pieceSymbols[piece.toUpperCase()]}</span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Historial de Movimientos (Solo Móvil) */}
                {showMoveHistoryModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 md:hidden p-4">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-primary/30 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
                                    Registro de Combate
                                </h3>
                                <button
                                    onClick={() => setShowMoveHistoryModal(false)}
                                    className="p-2 text-white/60 hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Historial */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(249, 122, 31, 0.3) rgba(255, 255, 255, 0.05)'
                            }}>
                                {moveHistory.length === 0 ? (
                                    <p className="text-white/40 text-sm italic text-center py-8">
                                        Esperando primer movimiento...
                                    </p>
                                ) : (
                                    moveHistory.map((move, i) => (
                                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                                            move.player === 'G' ? 'bg-primary/10 border border-primary/20' : 'bg-purple-500/10 border border-purple-500/20'
                                        }`}>
                                            <span className="text-xs text-white/40 font-bold min-w-[24px]">
                                                {i + 1}.
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-black text-sm ${
                                                        move.player === 'G' ? 'text-primary' : 'text-purple-500'
                                                    }`}>
                                                        {move.player === 'G' ? 'Guerrero Z' : 'Villano'}
                                                    </span>
                                                </div>
                                                <p className="text-white/60 text-xs font-mono">
                                                    {pieceNames[move.piece]} • {move.from} → {move.to}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Intro de Piezas al inicio de partida */}
                {showPiecesIntro && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-primary/30 rounded-3xl p-5 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_90px_rgba(249,122,31,0.2)]">
                            <div className="space-y-5 md:space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
                                        Tus <span className="text-primary">Piezas</span>
                                    </h2>
                                    <p className="text-white/50 text-xs md:text-sm">Conoce a tus guerreros antes de la batalla</p>
                                </div>

                                {/* Piezas del Jugador */}
                                <div>
                                    <h3 className={`text-sm md:text-base font-black uppercase tracking-widest mb-3 ${faction === 'Z_WARRIORS' ? 'text-primary' : 'text-purple-500'}`}>
                                        {faction === 'Z_WARRIORS' ? 'Guerreros Z' : 'Villanos'} — Tus Piezas
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
                                        {Object.entries(pieceTypeMap).map(([key, name]) => {
                                            const factionKey = faction === 'Z_WARRIORS' ? 'guerreros' : 'villanos';
                                            const image = resolveCharacterImageUrl(player1Preferences?.[factionKey]?.[name]);
                                            return (
                                                <div key={key} className={`bg-white/5 rounded-xl p-2 md:p-3 border border-white/10 ${faction === 'Z_WARRIORS' ? 'hover:border-primary/50' : 'hover:border-purple-500/50'} transition-colors`}>
                                                    <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center overflow-hidden mb-1">
                                                        {image ? (
                                                            <img src={image} alt={name} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span className="text-3xl md:text-4xl">{pieceSymbols[key.toUpperCase()]}</span>
                                                        )}
                                                    </div>
                                                    <p className={`text-center font-black text-[10px] md:text-xs uppercase ${faction === 'Z_WARRIORS' ? 'text-primary' : 'text-purple-400'}`}>{pieceNames[key]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Piezas del Oponente */}
                                <div>
                                    <h3 className={`text-sm md:text-base font-black uppercase tracking-widest mb-3 ${faction === 'Z_WARRIORS' ? 'text-purple-500' : 'text-primary'}`}>
                                        {faction === 'Z_WARRIORS' ? 'Villanos' : 'Guerreros Z'} — Piezas Rivales
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
                                        {Object.entries(pieceTypeMap).map(([key, name]) => {
                                            const factionKey = faction === 'Z_WARRIORS' ? 'villanos' : 'guerreros';
                                            const prefs = (player2 === null || !player2) ? player1Preferences : player2Preferences;
                                            const image = resolveCharacterImageUrl(prefs?.[factionKey]?.[name]);
                                            return (
                                                <div key={key} className={`bg-white/5 rounded-xl p-2 md:p-3 border border-white/10 ${faction === 'Z_WARRIORS' ? 'hover:border-purple-500/50' : 'hover:border-primary/50'} transition-colors`}>
                                                    <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center overflow-hidden mb-1">
                                                        {image ? (
                                                            <img src={image} alt={name} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span className="text-3xl md:text-4xl">{pieceSymbols[key]}</span>
                                                        )}
                                                    </div>
                                                    <p className={`text-center font-black text-[10px] md:text-xs uppercase ${faction === 'Z_WARRIORS' ? 'text-purple-400' : 'text-primary'}`}>{pieceNames[key]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPiecesIntro(false)}
                                    className="w-full py-3 md:py-4 bg-primary hover:bg-orange-500 rounded-2xl text-black font-black italic uppercase text-lg md:text-xl tracking-tighter transition-all active:scale-95 shadow-neon-orange"
                                >
                                    ¡A Combatir!
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

                {/* Modal de Recompensas post-partida */}
                {gameRewards && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                        <div className={`relative animate-in fade-in zoom-in duration-300 w-full ${gameRewards.player2 ? 'max-w-xl' : 'max-w-sm'}`}>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                                    Recompensas
                                </h3>
                                <button
                                    onClick={() => setGameRewards(null)}
                                    className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {gameRewards.player2 ? (
                                /* PVP dos cuentas: dos tarjetas */
                                <div className="grid grid-cols-2 gap-3">
                                    <RewardCard
                                        name={auth.user?.name}
                                        avatar={resolveCharacterImageUrl(auth.user?.avatar || 'guerreros/torre/Goku')}
                                        rewards={gameRewards.rewards}
                                        levelUp={gameRewards.level_up}
                                        accentClass="text-primary"
                                    />
                                    <RewardCard
                                        name={gameRewards.player2.name}
                                        avatar={gameRewards.player2.avatar}
                                        rewards={gameRewards.player2.rewards}
                                        levelUp={gameRewards.player2.level_up}
                                        accentClass="text-purple-400"
                                    />
                                </div>
                            ) : (
                                /* PVC o PVP invitado: tarjeta única */
                                <RewardCard
                                    name={auth.user?.name}
                                    avatar={resolveCharacterImageUrl(auth.user?.avatar || 'guerreros/torre/Goku')}
                                    rewards={gameRewards.rewards}
                                    levelUp={gameRewards.level_up}
                                    accentClass="text-primary"
                                />
                            )}

                            <button
                                onClick={() => setGameRewards(null)}
                                className="w-full mt-4 py-3 bg-primary hover:bg-orange-500 rounded-xl text-black font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}
        </>
    );
}
