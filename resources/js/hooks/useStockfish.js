import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook para comunicarse con Stockfish vía Web Worker.
 *
 * Niveles de dificultad:
 *   1 (Fácil)    – Skill Level 1,  depth 4,  movetime 200ms
 *   2 (Normal)   – Skill Level 10, depth 10, movetime 500ms
 *   3 (Difícil)  – Skill Level 20, depth 18, movetime 1500ms
 */

const DIFFICULTY_SETTINGS = {
    1: { skillLevel: 1,  depth: 4,  movetime: 200  },
    2: { skillLevel: 10, depth: 10, movetime: 500  },
    3: { skillLevel: 20, depth: 18, movetime: 1500 },
};

export default function useStockfish(difficulty = 2) {
    const workerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const resolveMove = useRef(null);
    const resolveAnalysis = useRef(null);
    const analysisResultsRef = useRef(new Map());

    // Inicializar el Web Worker
    useEffect(() => {
        const worker = new Worker('/stockfish/stockfish.js');

        worker.onmessage = (e) => {
            const line = typeof e.data === 'string' ? e.data : e.data?.data;
            if (!line) return;

            // Motor listo
            if (line === 'uciok') {
                // Configurar nivel de habilidad
                const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS[2];
                worker.postMessage(`setoption name Skill Level value ${settings.skillLevel}`);
                worker.postMessage('isready');
            }

            if (line === 'readyok') {
                setIsReady(true);
            }

            // Capturar el mejor movimiento
            if (line.startsWith('bestmove')) {
                const parts = line.split(' ');
                const bestMove = parts[1]; // e.g. "e2e4"
                setIsThinking(false);

                if (resolveAnalysis.current) {
                    const evaluations = Array.from(analysisResultsRef.current.values())
                        .sort((a, b) => a.rank - b.rank)
                        .slice(0, 12);

                    resolveAnalysis.current({ bestMove, evaluations });
                    resolveAnalysis.current = null;
                    analysisResultsRef.current.clear();
                }

                if (resolveMove.current) {
                    resolveMove.current(bestMove);
                    resolveMove.current = null;
                }
            }

            if (resolveAnalysis.current && line.startsWith('info')) {
                const multipvMatch = line.match(/\bmultipv\s+(\d+)/);
                const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
                const pvMatch = line.match(/\bpv\s+([a-h][1-8][a-h][1-8][qrbn]?)/);

                if (!multipvMatch || !scoreMatch || !pvMatch) {
                    return;
                }

                const rank = Number.parseInt(multipvMatch[1], 10);
                const scoreType = scoreMatch[1];
                const rawScore = Number.parseInt(scoreMatch[2], 10);
                const move = pvMatch[1];

                const normalizedScore = scoreType === 'mate'
                    ? (rawScore > 0 ? 100000 - rank : -100000 + rank)
                    : rawScore;

                analysisResultsRef.current.set(move, {
                    move,
                    rank,
                    scoreCP: normalizedScore,
                    scoreType,
                    rawScore,
                });
            }
        };

        worker.postMessage('uci');
        workerRef.current = worker;

        return () => {
            worker.postMessage('quit');
            worker.terminate();
        };
    }, [difficulty]);

    // Pedir el mejor movimiento dada una posición FEN
    const getBestMove = useCallback((fen) => {
        return new Promise((resolve) => {
            if (!workerRef.current || !isReady) {
                resolve(null);
                return;
            }

            setIsThinking(true);
            resolveMove.current = resolve;

            const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS[2];

            workerRef.current.postMessage(`position fen ${fen}`);
            workerRef.current.postMessage(
                `go depth ${settings.depth} movetime ${settings.movetime}`
            );
        });
    }, [isReady, difficulty]);

    const getBestMoveWithEvaluations = useCallback((fen, options = {}) => {
        return new Promise((resolve) => {
            if (!workerRef.current || !isReady) {
                resolve({ bestMove: null, evaluations: [] });
                return;
            }

            setIsThinking(true);
            analysisResultsRef.current.clear();
            resolveAnalysis.current = resolve;

            const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS[2];
            const multiPv = Math.min(Math.max(options.multiPv ?? 5, 1), 12);

            workerRef.current.postMessage(`setoption name MultiPV value ${multiPv}`);
            workerRef.current.postMessage(`position fen ${fen}`);
            workerRef.current.postMessage(`go depth ${settings.depth} movetime ${settings.movetime}`);
        });
    }, [isReady, difficulty]);

    // Detener búsqueda en curso
    const stop = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage('stop');
        }
    }, []);

    return { isReady, isThinking, getBestMove, getBestMoveWithEvaluations, stop };
}
