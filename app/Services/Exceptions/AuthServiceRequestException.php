<?php

namespace App\Services\Exceptions;

use RuntimeException;

class AuthServiceRequestException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly int $status = 500,
        private readonly array $payload = []
    ) {
        parent::__construct($message, $status);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function payload(): array
    {
        return $this->payload;
    }
}
