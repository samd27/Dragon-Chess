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

    'media' => [
        'base_url' => env('MEDIA_SERVICE_URL'),
        'catalog_path' => env('MEDIA_CATALOG_PATH', '/api/media/catalog'),
    ],

    'chess_engine' => [
        'grpc_addr' => env('CHESS_ENGINE_GRPC_ADDR', 'dragon-chess-ia-service.railway.internal:50051'),
        'grpcurl_bin' => env('CHESS_ENGINE_GRPCURL_BIN', '/usr/local/bin/grpcurl'),
        'timeout' => (int) env('CHESS_ENGINE_TIMEOUT_MS', 3000),
    ],

];
