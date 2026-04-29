<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'auth' => [
        'base_url' => env('AUTH_SERVICE_URL'),
        'fallback_url' => env('AUTH_SERVICE_FALLBACK_URL'),
        'auth_path' => env('AUTH_SERVICE_AUTH_PATH', '/internal/auth'),
        'timeout' => (int) env('AUTH_SERVICE_TIMEOUT', 8),
        'internal_secret' => env('AUTH_SERVICE_INTERNAL_SECRET'),
    ],

    'media' => [
        'base_url' => env('MEDIA_SERVICE_URL'),
        'catalog_path' => env('MEDIA_CATALOG_PATH', '/api/media/catalog'),
    ],

    'email' => [
        'base_url' => env('EMAIL_SERVICE_URL', 'http://dragon-chess-email-service.railway.internal:8080'),
        'internal_secret' => env('INTERNAL_SHARED_SECRET'),
        'timeout' => 5,
    ],

    'player_progression' => [
        'base_url' => env('PLAYER_PROGRESSION_SERVICE_URL'),
        'fallback_url' => env('PLAYER_PROGRESSION_SERVICE_FALLBACK_URL'),
        'player_path' => env('PLAYER_PROGRESSION_SERVICE_PLAYER_PATH', '/api/players'),
        'timeout' => (int) env('PLAYER_PROGRESSION_SERVICE_TIMEOUT', 8),
    ],

    'chess_engine' => [
        'grpc_addr' => env('CHESS_ENGINE_GRPC_ADDR', 'dragon-chess-ia-service.railway.internal:50051'),
        'grpcurl_bin' => env('CHESS_ENGINE_GRPCURL_BIN', 'grpcurl'),
        'http_fallback_url' => env('CHESS_ENGINE_HTTP_FALLBACK_URL', 'http://dragon-chess-ia-service.railway.internal:8080'),
        'http_best_move_path' => env('CHESS_ENGINE_HTTP_BEST_MOVE_PATH', '/v1/best-move'),
        'http_analyze_path' => env('CHESS_ENGINE_HTTP_ANALYZE_PATH', '/v1/analyze'),
        'timeout' => (int) env('CHESS_ENGINE_TIMEOUT_MS', 3000),
    ],

];
