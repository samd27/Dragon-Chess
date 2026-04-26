<?php

namespace App\Http\Middleware;

use App\Services\PlayerProgressionServiceClient;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $stats = null;
        $unlockAll = false;

        if ($request->user()) {
            $unlockAll = (bool) ($request->user()->unlock_all ?? false);

            try {
                $stats = app(PlayerProgressionServiceClient::class)->getProgression($request->user());
            } catch (\Throwable $e) {
                $stats = null;
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'stats' => $stats,
            'unlock_all' => $unlockAll,
        ];
    }
}
