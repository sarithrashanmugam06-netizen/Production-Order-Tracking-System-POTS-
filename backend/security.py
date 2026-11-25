"""Password hashing, signed tokens and login throttling.

Standard library only (no extra packages). Tokens are standard HS256 JWTs, so
you can later swap this module for PyJWT without changing the token format.
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional

# ----------------------------------------------------------------- passwords
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
PBKDF2_ITERATIONS = 600_000

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128  # also stops huge inputs being used to burn CPU


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64d(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def hash_password(password: str) -> str:
    """Return a self-describing hash: scheme$params$salt$digest."""
    salt = secrets.token_bytes(16)
    data = password.encode("utf-8")

    if hasattr(hashlib, "scrypt"):
        digest = hashlib.scrypt(
            data, salt=salt, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P,
            maxmem=64 * 1024 * 1024, dklen=32,
        )
        return f"scrypt${SCRYPT_N}:{SCRYPT_R}:{SCRYPT_P}${_b64e(salt)}${_b64e(digest)}"

    digest = hashlib.pbkdf2_hmac("sha256", data, salt, PBKDF2_ITERATIONS, dklen=32)
    return f"pbkdf2${PBKDF2_ITERATIONS}${_b64e(salt)}${_b64e(digest)}"


def verify_password(password: str, stored: Optional[str]) -> bool:
    if not stored or len(password) > MAX_PASSWORD_LENGTH:
        return False

    try:
        scheme, params, salt_b64, digest_b64 = stored.split("$")
        salt, expected = _b64d(salt_b64), _b64d(digest_b64)
        data = password.encode("utf-8")

        if scheme == "scrypt":
            n, r, p = (int(x) for x in params.split(":"))
            actual = hashlib.scrypt(
                data, salt=salt, n=n, r=r, p=p,
                maxmem=64 * 1024 * 1024, dklen=len(expected),
            )
        elif scheme == "pbkdf2":
            actual = hashlib.pbkdf2_hmac(
                "sha256", data, salt, int(params), dklen=len(expected)
            )
        else:
            return False
    except (ValueError, TypeError, AttributeError):
        return False

    return hmac.compare_digest(actual, expected)


_DUMMY_HASH: Optional[str] = None


def burn_time_like_a_real_check(password: str) -> None:
    """Run a hash check against a throw-away hash. Used when the email is
    unknown so the response time does not reveal which emails exist."""
    global _DUMMY_HASH
    if _DUMMY_HASH is None:
        _DUMMY_HASH = hash_password("not-a-real-password")
    verify_password(password, _DUMMY_HASH)


# -------------------------------------------------------------------- tokens
class TokenError(Exception):
    """The token is missing, malformed, tampered with or expired."""


_HEADER = _b64e(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())


def _sign(signing_input: str, secret: str) -> str:
    return _b64e(hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest())


def create_token(claims: dict, secret: str, expires_in: int, now: Optional[float] = None) -> str:
    issued = int(now if now is not None else time.time())
    payload = {**claims, "iat": issued, "exp": issued + int(expires_in)}
    body = _b64e(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{_HEADER}.{body}"
    return f"{signing_input}.{_sign(signing_input, secret)}"


def decode_token(token: str, secret: str, now: Optional[float] = None) -> dict:
    try:
        header_b64, body_b64, signature = token.split(".")
    except (ValueError, AttributeError):
        raise TokenError("Malformed token")

    # Only accept the one algorithm we issue (blocks "alg: none" tricks).
    if header_b64 != _HEADER:
        raise TokenError("Unsupported token header")

    expected = _sign(f"{header_b64}.{body_b64}", secret)
    if not hmac.compare_digest(signature, expected):
        raise TokenError("Bad signature")

    try:
        payload = json.loads(_b64d(body_b64))
        expires = int(payload["exp"])
    except (ValueError, KeyError, TypeError):
        raise TokenError("Malformed payload")

    if expires <= (now if now is not None else time.time()):
        raise TokenError("Token expired")

    return payload


# ---------------------------------------------------------------- secret key
def load_secret_key(key_file: Path) -> str:
    """SECRET_KEY from the environment, otherwise a random key kept in a local
    file (created on first run) so tokens survive a restart in development.
    For production, set SECRET_KEY explicitly."""
    env_value = os.getenv("SECRET_KEY")
    if env_value:
        return env_value

    if key_file.exists():
        stored = key_file.read_text().strip()
        if stored:
            return stored

    new_key = secrets.token_urlsafe(48)
    key_file.write_text(new_key)
    try:
        os.chmod(key_file, 0o600)
    except OSError:
        pass  # not supported on every platform (e.g. some Windows setups)
    return new_key


# ----------------------------------------------------------------- throttling
class TooManyAttempts(Exception):
    def __init__(self, retry_after: int):
        super().__init__(f"Too many failed attempts. Try again in {retry_after} seconds.")
        self.retry_after = retry_after


class LoginThrottle:
    """Allows `max_failures` failed logins per key within `window` seconds.
    In-memory: fine for one server process; use Redis or similar if you run several."""

    def __init__(self, max_failures: int = 5, window: int = 15 * 60):
        self.max_failures = max_failures
        self.window = window
        self._failures: Dict[str, List[float]] = {}
        self._lock = threading.Lock()

    def _recent(self, key: str, now: float) -> List[float]:
        recent = [t for t in self._failures.get(key, []) if now - t < self.window]
        if recent:
            self._failures[key] = recent
        else:
            self._failures.pop(key, None)
        return recent

    def check(self, key: str, now: Optional[float] = None) -> None:
        now = now if now is not None else time.time()
        with self._lock:
            recent = self._recent(key, now)
            if len(recent) >= self.max_failures:
                raise TooManyAttempts(int(self.window - (now - recent[0])) + 1)

    def record_failure(self, key: str, now: Optional[float] = None) -> None:
        now = now if now is not None else time.time()
        with self._lock:
            self._recent(key, now)
            self._failures.setdefault(key, []).append(now)

    def reset(self, key: str) -> None:
        with self._lock:
            self._failures.pop(key, None)
