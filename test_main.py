import unittest
from unittest.mock import patch
import io
import sys

from main import get_welcome_message


class TestGetWelcomeMessage(unittest.TestCase):
    """Tests for get_welcome_message() in main.py"""

    # ------------------------------------------------------------------
    # Return value: normal user path
    # ------------------------------------------------------------------

    def test_returns_normal_login_for_single_regular_user(self):
        result = get_welcome_message(["alice"])
        self.assertEqual(result, "일반 유저 로그인 성공")

    def test_returns_normal_login_for_multiple_regular_users(self):
        result = get_welcome_message(["alice", "bob", "charlie"])
        self.assertEqual(result, "일반 유저 로그인 성공")

    # ------------------------------------------------------------------
    # Return value: admin path
    # ------------------------------------------------------------------

    def test_returns_admin_login_for_single_admin(self):
        result = get_welcome_message(["admin"])
        self.assertEqual(result, "관리자 로그인 성공")

    def test_returns_admin_login_when_admin_in_middle(self):
        result = get_welcome_message(["alice", "admin", "bob"])
        self.assertEqual(result, "관리자 로그인 성공")

    def test_returns_admin_login_when_admin_is_first(self):
        result = get_welcome_message(["admin", "alice"])
        self.assertEqual(result, "관리자 로그인 성공")

    def test_returns_admin_login_when_admin_is_last(self):
        result = get_welcome_message(["alice", "bob", "admin"])
        self.assertEqual(result, "관리자 로그인 성공")

    def test_returns_admin_login_for_multiple_admins(self):
        result = get_welcome_message(["admin", "admin", "admin"])
        self.assertEqual(result, "관리자 로그인 성공")

    def test_returns_admin_login_with_mixed_users_including_multiple_admins(self):
        result = get_welcome_message(["alice", "admin", "bob", "admin"])
        self.assertEqual(result, "관리자 로그인 성공")

    # ------------------------------------------------------------------
    # Case sensitivity: "admin" must be exact match
    # ------------------------------------------------------------------

    def test_admin_check_is_case_sensitive_uppercase(self):
        """'Admin' (capital A) should NOT be treated as an admin."""
        result = get_welcome_message(["Admin"])
        self.assertEqual(result, "일반 유저 로그인 성공")

    def test_admin_check_is_case_sensitive_allcaps(self):
        """'ADMIN' should NOT be treated as an admin."""
        result = get_welcome_message(["ADMIN"])
        self.assertEqual(result, "일반 유저 로그인 성공")

    # ------------------------------------------------------------------
    # Print side effect
    # ------------------------------------------------------------------

    def test_prints_welcome_message_with_first_user(self):
        with patch("sys.stdout", new_callable=io.StringIO) as mock_stdout:
            get_welcome_message(["alice", "bob"])
            output = mock_stdout.getvalue()
        self.assertIn("alice", output)

    def test_prints_welcome_message_contains_greeting_text(self):
        with patch("sys.stdout", new_callable=io.StringIO) as mock_stdout:
            get_welcome_message(["charlie"])
            output = mock_stdout.getvalue()
        self.assertIn("환영합니다", output)

    def test_prints_first_user_not_second(self):
        """Only the first user should appear in the printed message."""
        with patch("sys.stdout", new_callable=io.StringIO) as mock_stdout:
            get_welcome_message(["alice", "bob"])
            output = mock_stdout.getvalue()
        self.assertIn("alice", output)
        self.assertNotIn("bob", output)

    # ------------------------------------------------------------------
    # Edge / boundary cases
    # ------------------------------------------------------------------

    def test_empty_list_raises_index_error(self):
        """Accessing user_list[0] on an empty list raises IndexError (known bug)."""
        with self.assertRaises(IndexError):
            get_welcome_message([])

    def test_single_element_list_admin(self):
        result = get_welcome_message(["admin"])
        self.assertEqual(result, "관리자 로그인 성공")

    def test_single_element_list_regular_user(self):
        result = get_welcome_message(["user"])
        self.assertEqual(result, "일반 유저 로그인 성공")

    def test_large_list_all_regular_users(self):
        users = [f"user{i}" for i in range(100)]
        result = get_welcome_message(users)
        self.assertEqual(result, "일반 유저 로그인 성공")

    def test_large_list_with_one_admin(self):
        users = [f"user{i}" for i in range(99)] + ["admin"]
        result = get_welcome_message(users)
        self.assertEqual(result, "관리자 로그인 성공")

    # ------------------------------------------------------------------
    # Regression: admin substring should not match
    # ------------------------------------------------------------------

    def test_partial_match_does_not_count_as_admin(self):
        """'administrator' is not equal to 'admin', so should not count."""
        result = get_welcome_message(["administrator"])
        self.assertEqual(result, "일반 유저 로그인 성공")

    def test_partial_match_superadmin_does_not_count(self):
        """'superadmin' contains 'admin' but is not equal — should not count."""
        result = get_welcome_message(["superadmin"])
        self.assertEqual(result, "일반 유저 로그인 성공")


if __name__ == "__main__":
    unittest.main()