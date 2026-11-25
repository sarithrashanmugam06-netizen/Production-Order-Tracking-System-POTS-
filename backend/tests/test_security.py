"""Password hashing, tokens, throttling and secret-key loading (stdlib only)."""
import base64
import hashlib
import json
import os
import tempfile
from pathlib import Path

import pytest

import security

SECRET = "unit-test-secret"


# ------------------------------------------------------------------ passwords
def test_hash_and_verify_round_trip():
    stored = security.hash_password("correct horse battery")
    assert stored.startswith(("scrypt$", "pbkdf2$"))
    assert "correct horse" not in stored
    assert security.verify_password("correct horse battery", stored)
    assert not security.verify_password("wrong password", stored)


def test_same_password_gets_different_salts():
    assert security.hash_password("same-password") != security.hash_password("same-password")


def test_verify_rejects_garbage_instead_of_crashing():
    for bad in (None, "", "plain-text", "scrypt$x$y$z", "md5$1$a$b", "scrypt$1:2$!!$!!"):
        assert security.verify_password("anything", bad) is False


def test_verify_rejects_oversized_password():
    stored = security.hash_password("short-password")
    assert security.verify_password("x" * (security.MAX_PASSWORD_LENGTH + 1), stored) is False


def test_pbkdf2_hashes_are_understood():
    salt = b"0123456789abcdef"
    digest = hashlib.pbkdf2_hmac("sha256", b"fallback-pw", salt, 1000, dklen=32)
    stored = f"pbkdf2$1000${security._b64e(salt)}${security._b64e(digest)}"
    assert security.verify_password("fallback-pw", stored)
    assert not security.verify_password("other", stored)


# --------------------------------------------------------------------- tokens
def test_token_round_trip():
    token = security.create_token({"sub": "7", "role": "Admin"}, SECRET, 60)
    claims = security.decode_token(token, SECRET)
    assert claims["sub"] == "7" and claims["role"] == "Admin"
    assert claims["exp"] - claims["iat"] == 60


def test_token_expires():
    token = security.create_token({"sub": "1"}, SECRET, 60, now=1_000_000)
    security.decode_token(token, SECRET, now=1_000_059)  # still valid
    with pytest.raises(security.TokenError):
        security.decode_token(token, SECRET, now=1_000_060)


def test_token_with_wrong_secret_is_rejected():
    token = security.create_token({"sub": "1"}, SECRET, 60)
    with pytest.raises(security.TokenError):
        security.decode_token(token, "another-secret")


def test_tampered_payload_is_rejected():
    token = security.create_token({"sub": "5", "role": "Planner"}, SECRET, 60)
    header, body, signature = token.split(".")
    claims = json.loads(security._b64d(body))
    claims["role"] = "Admin"  # privilege escalation attempt
    forged_body = security._b64e(json.dumps(claims, separators=(",", ":")).encode())
    with pytest.raises(security.TokenError):
        security.decode_token(f"{header}.{forged_body}.{signature}", SECRET)


def test_alg_none_token_is_rejected():
    header = security._b64e(json.dumps({"alg": "none", "typ": "JWT"}).encode())
    body = security._b64e(json.dumps({"sub": "1", "exp": 9_999_999_999}).encode())
    with pytest.raises(security.TokenError):
        security.decode_token(f"{header}.{body}.", SECRET)


def test_malformed_tokens_are_rejected():
    for bad in ("", "abc", "a.b", "a.b.c.d", None):
        with pytest.raises(security.TokenError):
            security.decode_token(bad, SECRET)


# ----------------------------------------------------------------- throttling
def test_throttle_blocks_after_max_failures_then_recovers():
    throttle = security.LoginThrottle(max_failures=3, window=60)
    for i in range(3):
        throttle.check("a", now=100 + i)
        throttle.record_failure("a", now=100 + i)

    with pytest.raises(security.TooManyAttempts) as exc:
        throttle.check("a", now=110)
    assert 0 < exc.value.retry_after <= 61

    throttle.check("someone-else", now=110)  # other keys unaffected
    throttle.check("a", now=100 + 61)        # window passed


def test_throttle_reset_after_success():
    throttle = security.LoginThrottle(max_failures=2, window=60)
    throttle.record_failure("a", now=1)
    throttle.record_failure("a", now=2)
    throttle.reset("a")
    throttle.check("a", now=3)


# ------------------------------------------------------------------ secret key
def test_secret_key_from_env_wins():
    old = os.environ.get("SECRET_KEY")
    os.environ["SECRET_KEY"] = "from-env"
    try:
        assert security.load_secret_key(Path(tempfile.mkdtemp()) / "k") == "from-env"
    finally:
        os.environ.pop("SECRET_KEY", None)
        if old is not None:
            os.environ["SECRET_KEY"] = old


def test_secret_key_file_is_created_once_and_reused():
    old = os.environ.pop("SECRET_KEY", None)
    try:
        key_file = Path(tempfile.mkdtemp()) / ".secret_key"
        first = security.load_secret_key(key_file)
        assert len(first) >= 40 and key_file.exists()
        assert security.load_secret_key(key_file) == first
    finally:
        if old is not None:
            os.environ["SECRET_KEY"] = old
