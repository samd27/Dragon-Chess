import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

export default function GameArena({ auth, faction, mode = 'PVP', player2 = null }) {
    const [game, setGame] = useState(new Chess());
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [possibleMoves, setPossibleMoves] = useState([]);
    const [showConfirmAbort, setShowConfirmAbort] = useState(false);
    const [gameOver, setGameOver] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [whiteTime, setWhiteTime] = useState(600);
    const [blackTime, setBlackTime] = useState(600);
    const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
    const [promotionPending, setPromotionPending] = useState(null);
    const [showCheckAnimation, setShowCheckAnimation] = useState(false);
    
    // Refs para auto-scroll
    const moveHistoryRef = useRef(null);
    const playerCapturedRef = useRef(null);
    const opponentCapturedRef = useRef(null);
    
    // Determinar qué jugador es blanco y cuál es negro
    // Guerrero Z controla blancas (naranjas) y mueve primero
    // Villano controla negras (moradas) y mueve segundo
    const playerIsWhite = faction === 'Z_WARRIORS';
    
    const player = {
        name: auth.user?.name || 'Kakarot_99',
        avatar: auth.user?.avatar || '/images/characters/Guerreros/Torre/Goku.png',
    };

    const handleAbortMission = () => {
        setShowConfirmAbort(false);
        // Limpiar sesión de jugador 2 si existe
        if (mode === 'PVP' && player2) {
            fetch(route('clear.player2.session'), { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } });
        }
        router.visit(route('game.mode'));
    };
    
    const handleReturnToMenu = () => {
        // Limpiar sesión de jugador 2 si existe
        if (mode === 'PVP' && player2) {
            fetch(route('clear.player2.session'), { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } })
                .then(() => router.visit(route('game.mode')));
        } else {
            router.visit(route('game.mode'));
        }
    };

    const opponent = {
        name: mode === 'PVC' 
            ? 'CPU' 
            : (player2 ? player2.name : 'Invitado'),
        avatar: mode === 'PVC'
            ? (faction === 'Z_WARRIORS' ? '/images/characters/Villanos/Rey/Freezer.png' : '/images/characters/Guerreros/Torre/Goku.png')
            : (player2 ? player2.avatar : (faction === 'Z_WARRIORS' ? '/images/characters/Villanos/Rey/Freezer.png' : '/images/characters/Guerreros/Torre/Goku.png')),
    };

    // Piezas Unicode para renderizar
    const pieceSymbols = {
        'p': '\u265F', 'n': '\u265E', 'b': '\u265D', 'r': '\u265C', 'q': '\u265B', 'k': '\u265A',
        'P': '\u2659', 'N': '\u2658', 'B': '\u2657', 'R': '\u2656', 'Q': '\u2655', 'K': '\u2654'
    };

    // Cronómetro activo
    useEffect(() => {
        if (gameOver) return;
        
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
    }, [game, gameOver]);

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

    const handleSquareClick = (square) => {
        if (gameOver) return;

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
                        setCapturedPieces(prev => ({
                            ...prev,
                            [capturedColor]: [...prev[capturedColor], move.captured]
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
                    setMoveHistory([...moveHistory, moveInfo]);
                    setGame(new Chess(game.fen()));
                    setSelectedSquare(null);
                    setPossibleMoves([]);

                    // Si es modo PVC, hacer movimiento de CPU después de un delay
                    if (mode === 'PVC' && !game.isGameOver()) {
                        setTimeout(() => makeComputerMove(), 500);
                    }
                }
            } catch (e) {
                console.error('Movimiento inválido:', e);
            }
        } else {
            // Seleccionar nueva pieza
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                setSelectedSquare(square);
                const moves = game.moves({ square, verbose: true });
                setPossibleMoves(moves.map(m => m.to));
            } else {
                setSelectedSquare(null);
                setPossibleMoves([]);
            }
        }
    };

    const makeComputerMove = () => {
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            const move = game.move(randomMove);
            if (move) {
                // Si se capturó una pieza, agregarla a la lista
                if (move.captured) {
                    const capturedColor = move.color === 'w' ? 'black' : 'white';
                    setCapturedPieces(prev => ({
                        ...prev,
                        [capturedColor]: [...prev[capturedColor], move.captured]
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
                setMoveHistory([...moveHistory, moveInfo]);
            }
            setGame(new Chess(game.fen()));
        }
    };
    
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
                    setCapturedPieces(prev => ({
                        ...prev,
                        [capturedColor]: [...prev[capturedColor], move.captured]
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
                setMoveHistory([...moveHistory, moveInfo]);
                setGame(new Chess(game.fen()));
                setSelectedSquare(null);
                setPossibleMoves([]);
                setPromotionPending(null);

                // Si es modo PVC, hacer movimiento de CPU después de un delay
                if (mode === 'PVC' && !game.isGameOver()) {
                    setTimeout(() => makeComputerMove(), 500);
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
        const isSelected = selectedSquare === square;
        const isPossibleMove = possibleMoves.includes(square);
        const isInCheck = game.isCheck() && piece && piece.type === 'k' && piece.color === game.turn();

        return (
            <div 
                key={`${row}-${col}`}
                onClick={() => handleSquareClick(square)}
                className={`relative w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-200
                    ${isDark ? 'bg-black' : 'bg-white'}
                    ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                    ${isInCheck ? 'bg-red-500/50' : ''}
                    hover:brightness-110
                `}
            >
                {piece && (
                    <span className={`text-4xl md:text-5xl select-none transition-all ${
                        // Si es una pieza del jugador actual
                        (piece.color === 'w' && playerIsWhite) || (piece.color === 'b' && !playerIsWhite)
                            ? (faction === 'Z_WARRIORS' ? 'text-primary' : 'text-purple-500')
                            : (faction === 'Z_WARRIORS' ? 'text-purple-500' : 'text-primary')
                    } ${
                        isSelected 
                            ? ((piece.color === 'w' && playerIsWhite) || (piece.color === 'b' && !playerIsWhite)
                                ? (faction === 'Z_WARRIORS' ? 'drop-shadow-[0_0_25px_rgba(249,122,31,1)] scale-110' : 'drop-shadow-[0_0_25px_rgba(168,85,247,1)] scale-110')
                                : (faction === 'Z_WARRIORS' ? 'drop-shadow-[0_0_25px_rgba(168,85,247,1)] scale-110' : 'drop-shadow-[0_0_25px_rgba(249,122,31,1)] scale-110'))
                            : 'drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                    }`}>
                        {pieceSymbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
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
                <header className="px-4 md:px-10 py-3 md:py-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-lg">
                    <button onClick={() => setShowConfirmAbort(true)} className="flex items-center gap-2 group text-white/60 hover:text-red-500 transition-colors">
                        <span className="text-lg md:text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Abortar Misión</span>
                    </button>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                            game.turn() === 'w'
                                ? 'bg-primary'
                                : 'bg-purple-500'
                        }`}></div>
                        <span className={`text-xs font-black tracking-[0.2em] md:tracking-[0.4em] uppercase ${
                            game.turn() === 'w'
                                ? 'text-primary'
                                : 'text-purple-500'
                        }`}>
                            Turno: {getTurnText()}
                            {game.isCheck() && ' - ¡JAQUE!'}
                        </span>
                    </div>
                </header>

                {/* Main Game Area */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Left: Player Zone */}
                    <aside className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-4 transition-all duration-300 overflow-y-auto ${
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
                        <div className="relative">
                            <div className={`w-20 h-20 md:w-36 md:h-36 rounded-2xl md:rounded-3xl border-2 md:border-4 overflow-hidden bg-black p-1 transition-all duration-500 md:scale-110 -rotate-2 ${
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
                        <div className="text-left md:text-center">
                            <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 md:mb-2 text-white">{player.name}</h3>
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
                            {(playerIsWhite ? capturedPieces.black : capturedPieces.white).map((piece, i) => (
                                <span key={i} className="text-2xl opacity-50">
                                    {pieceSymbols[piece]}
                                </span>
                            ))}
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
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]"></div>
                    
                    {/* Check Warning - Arriba del tablero */}
                    {showCheckAnimation && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                            <div className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-red-500 animate-pulse drop-shadow-[0_0_40px_rgba(239,68,68,1)]">
                                ¡JAQUE!
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
                <aside className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 p-4 md:p-6 flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-4 transition-all duration-300 overflow-y-auto ${
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
                        <div className="relative">
                            <div className={`w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-2 md:border-4 overflow-hidden bg-black p-1 rotate-3 ${
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
                        <div className="text-left md:text-center">
                            <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 md:mb-2 text-white">{opponent.name}</h3>
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
                            {(playerIsWhite ? capturedPieces.white : capturedPieces.black).map((piece, i) => (
                                <span key={i} className="text-2xl opacity-50">
                                    {pieceSymbols[piece.toUpperCase()]}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
                </div>



                {/* Promotion Selection Modal */}
                {promotionPending && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-primary/30 rounded-3xl p-8 max-w-md mx-4">
                            <div className="text-center space-y-6">
                                <div className="text-6xl">👑</div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Promoción de Peón</h3>
                                <p className="text-white/60 text-sm">Selecciona la pieza a la que quieres promover:</p>
                                <div className="grid grid-cols-4 gap-4 pt-4">
                                    {['q', 'r', 'b', 'n'].map(piece => {
                                        const isPieceForWhite = game.turn() === 'w';
                                        const pieceColor = isPieceForWhite 
                                            ? (playerIsWhite ? 'text-primary' : 'text-purple-500')
                                            : (playerIsWhite ? 'text-purple-500' : 'text-primary');
                                        
                                        return (
                                            <button
                                                key={piece}
                                                onClick={() => handlePromotion(piece)}
                                                className={`p-4 bg-white/5 rounded-xl border-2 border-white/10 hover:border-primary hover:bg-white/10 transition-all group`}
                                            >
                                                <span className={`text-5xl ${pieceColor} group-hover:scale-110 transition-transform inline-block`}>
                                                    {pieceSymbols[isPieceForWhite ? piece.toUpperCase() : piece]}
                                                </span>
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

                {/* Confirmation Modal */}
                {showConfirmAbort && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 border-red-500/30 rounded-3xl p-8 max-w-md mx-4 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                            <div className="text-center space-y-6">
                                <div className="text-6xl">⚠️</div>
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
                        <div className={`bg-gradient-to-br from-[#1a1b1e] to-[#0d0e12] border-2 rounded-2xl p-6 w-80 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative ${
                            gameOver.type === 'checkmate' 
                                ? gameOver.winner === 'white' ? 'border-primary shadow-neon-orange' : 'border-purple-500'
                                : 'border-yellow-500'
                        }`}>
                            {/* Botón Cerrar */}
                            <button 
                                onClick={() => setGameOver(null)}
                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                ✕
                            </button>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">
                                        {gameOver.type === 'checkmate' ? '👑' : '🤝'}
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
                    </div>
                )}
            </div>
        </>
    );
}
