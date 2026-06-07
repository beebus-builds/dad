package validator

import "testing"

func TestIsEmail(t *testing.T) {
	cases := []struct {
		in  string
		exp bool
	}{
		{"user@example.com", true},
		{"ram.k.c@shramjagaran.np", true},
		{"plainaddress", false},
		{"@no-local.com", false},
		{"", false},
		{"no-at-sign", false},
		{"two@@signs.com", false},
	}
	for _, tc := range cases {
		if got := IsEmail(tc.in); got != tc.exp {
			t.Errorf("IsEmail(%q) = %v, want %v", tc.in, got, tc.exp)
		}
	}
}

func TestIsPhone(t *testing.T) {
	cases := []struct {
		in  string
		exp bool
	}{
		{"+9779841234567", true},
		{"9841234567", true},
		{"+1 415 555 2671", true},
		{"984-123-4567", true},
		{"abc123", false},
		{"", false},
		{"12", false},
		{"+", false},
	}
	for _, tc := range cases {
		if got := IsPhone(tc.in); got != tc.exp {
			t.Errorf("IsPhone(%q) = %v, want %v", tc.in, got, tc.exp)
		}
	}
}

func TestIsStrongPassword(t *testing.T) {
	cases := []struct {
		in  string
		exp bool
	}{
		{"Short1", false},
		{"alllowercase1", false},
		{"ALLUPPERCASE1", true},
		{"NoDigitsHere", false},
		{"GoodPass1", true},
		{"nepali-strong", false},
		{"P4ssword", true},
		{"lower9case", false},
	}
	for _, tc := range cases {
		if got := IsStrongPassword(tc.in); got != tc.exp {
			t.Errorf("IsStrongPassword(%q) = %v, want %v", tc.in, got, tc.exp)
		}
	}
}
