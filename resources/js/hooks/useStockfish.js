import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook para comunicarse con el microservicio de IA vía backend Laravel.
 *
 * Niveles de dificultad:
 *   1 (Fácil)    – Skill Level 1,  depth 4,  movetime 200ms
 *   2 (Normal)   – Skill Level 10, depth 10, movetime 500ms
 *   3 (Difícil)  – Skill Level 20, depth 18, movetime 1500ms
 */

export default function useStockfish(difficulty = 2) {
    const [isReady] = useState(true);
    const [isThinking, setIsThinking] = useState(false);

    const normalizeEvaluation = useCallback((item) => ({
        move: item?.move ?? item?.Move ?? null,
        rank: item?.rank ?? item?.Rank ?? 0,
        scoreCP: item?.score_cp ?? item?.scoreCp ?? item?.scoreCP ?? 0,
        scoreType: item?.score_type ?? item?.scoreType ?? 'cp',
        rawScore: item?.raw_score ?? item?.rawScore ?? 0,
    }), []);

    // Pedir el mejor movimiento dada una posición FEN
    const getBestMove = useCallback(async (fen) => {
        if (!fen || !isReady) return null;

        setIsThinking(true);
        try {
            const response = await axios.post('/ai/best-move', {
                fen,
                difficulty,
            });
            const data = response?.data ?? {};
            return data.best_move ?? data.bestMove ?? null;
        } catch (error) {
            console.warn('Chess engine best-move request failed:', error);
            return null;
        } finally {
            setIsThinking(false);
        }
    }, [isReady, difficulty]);

    const getBestMoveWithEvaluations = useCallback(async (fen, options = {}) => {
        if (!fen || !isReady) {
            return { bestMove: null, evaluations: [] };
        }

        const multiPv = Math.min(Math.max(options.multiPv ?? 5, 1), 12);
        setIsThinking(true);

        try {
            const response = await axios.post('/ai/analyze', {
                fen,
                difficulty,
                multiPv,
            });

            const data = response?.data ?? {};
            const bestMove = data.best_move ?? data.bestMove ?? null;
            const evaluations = Array.isArray(data.evaluations)
                ? data.evaluations.map(normalizeEvaluation)
                : [];

            return { bestMove, evaluations };
        } catch (error) {
            console.warn('Chess engine analyze request failed:', error);
            return { bestMove: null, evaluations: [] };
        } finally {
            setIsThinking(false);
        }
    }, [isReady, difficulty, normalizeEvaluation]);

    // Detener búsqueda en curso
    const stop = useCallback(() => {
        setIsThinking(false);
    }, []);

    return { isReady, isThinking, getBestMove, getBestMoveWithEvaluations, stop };
}
