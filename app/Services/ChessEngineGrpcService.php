<?php

namespace App\Services;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class ChessEngineGrpcService
{
    public function getBestMove(string $fen, int $difficulty = 2): array
    {
        $payload = $this->callGrpc('GetBestMove', [
            'fen' => $fen,
            'difficulty' => $difficulty,
        ]);

        return [
            'best_move' => $payload['bestMove'] ?? $payload['best_move'] ?? null,
            'score_cp' => (int) ($payload['scoreCp'] ?? $payload['score_cp'] ?? 0),
            'score_type' => (string) ($payload['scoreType'] ?? $payload['score_type'] ?? 'cp'),
            'raw_score' => (int) ($payload['rawScore'] ?? $payload['raw_score'] ?? 0),
        ];
    }

    public function analyzePosition(string $fen, int $difficulty = 2, int $multiPv = 5): array
    {
        $payload = $this->callGrpc('AnalyzePosition', [
            'fen' => $fen,
            'difficulty' => $difficulty,
            'multipv' => $multiPv,
        ]);

        $evaluations = array_map(function (array $item): array {
            return [
                'move' => $item['move'] ?? null,
                'rank' => (int) ($item['rank'] ?? 0),
                'score_cp' => (int) ($item['scoreCp'] ?? $item['score_cp'] ?? 0),
                'score_type' => (string) ($item['scoreType'] ?? $item['score_type'] ?? 'cp'),
                'raw_score' => (int) ($item['rawScore'] ?? $item['raw_score'] ?? 0),
            ];
        }, $payload['evaluations'] ?? []);

        return [
            'best_move' => $payload['bestMove'] ?? $payload['best_move'] ?? null,
            'evaluations' => $evaluations,
        ];
    }

    private function callGrpc(string $method, array $payload): array
    {
        $host = trim((string) config('services.chess_engine.grpc_addr', ''));
        if ($host === '') {
            throw new \RuntimeException('CHESS_ENGINE_GRPC_ADDR is not configured');
        }

        $binary = $this->resolveGrpcurlBinary();
        $protoPath = base_path('proto');
        $protoFile = 'chess/v1/chess_engine.proto';
        $timeoutMs = max(1, (int) config('services.chess_engine.timeout', 3000));

        $process = new Process([
            $binary,
            '-plaintext',
            '-import-path', $protoPath,
            '-proto', $protoFile,
            '-format', 'json',
            '-d', json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            $host,
            'chess.v1.ChessEngineService/' . $method,
        ]);

        $process->setTimeout($timeoutMs / 1000);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $decoded = json_decode($process->getOutput(), true);
        if (! is_array($decoded)) {
            throw new \RuntimeException('Invalid JSON returned by grpcurl');
        }

        return $decoded;
    }

    private function resolveGrpcurlBinary(): string
    {
        $configured = trim((string) config('services.chess_engine.grpcurl_bin', 'grpcurl'));
        $candidates = array_values(array_unique([
            $configured,
            '/usr/local/bin/grpcurl',
            '/usr/bin/grpcurl',
            '/app/bin/grpcurl',
            'grpcurl',
        ]));

        foreach ($candidates as $candidate) {
            if ($candidate === '') {
                continue;
            }

            if ($candidate[0] === '/' && is_file($candidate) && is_executable($candidate)) {
                return $candidate;
            }

            if ($candidate[0] !== '/') {
                // Para comandos en PATH (ej. "grpcurl"), dejamos que Process los resuelva.
                return $candidate;
            }
        }

        throw new \RuntimeException('grpcurl binary not found in runtime');
    }
}
