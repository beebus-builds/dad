package usecase

import (
	"testing"
)

func TestStrPtr(t *testing.T) {
	t.Run("empty string returns nil", func(t *testing.T) {
		if got := strPtr(""); got != nil {
			t.Errorf("strPtr('') = %v, want nil", got)
		}
	})
	t.Run("non-empty string returns pointer", func(t *testing.T) {
		got := strPtr("hello")
		if got == nil {
			t.Fatal("strPtr('hello') = nil, want pointer")
		}
		if *got != "hello" {
			t.Errorf("*strPtr('hello') = %q, want 'hello'", *got)
		}
	})
}

func TestIntPtr(t *testing.T) {
	t.Run("zero returns nil", func(t *testing.T) {
		if got := intPtr(0); got != nil {
			t.Errorf("intPtr(0) = %v, want nil", got)
		}
	})
	t.Run("non-zero returns pointer", func(t *testing.T) {
		got := intPtr(42)
		if got == nil {
			t.Fatal("intPtr(42) = nil, want pointer")
		}
		if *got != 42 {
			t.Errorf("*intPtr(42) = %d, want 42", *got)
		}
	})
	t.Run("negative numbers work", func(t *testing.T) {
		got := intPtr(-5)
		if got == nil {
			t.Fatal("intPtr(-5) = nil, want pointer")
		}
		if *got != -5 {
			t.Errorf("*intPtr(-5) = %d, want -5", *got)
		}
	})
}

func TestDefaultStr(t *testing.T) {
	t.Run("empty string returns default", func(t *testing.T) {
		if got := defaultStr("", "fallback"); got != "fallback" {
			t.Errorf("defaultStr('', 'fallback') = %q, want 'fallback'", got)
		}
	})
	t.Run("non-empty string returns itself", func(t *testing.T) {
		if got := defaultStr("hello", "fallback"); got != "hello" {
			t.Errorf("defaultStr('hello', 'fallback') = %q, want 'hello'", got)
		}
	})
	t.Run("whitespace is not empty", func(t *testing.T) {
		if got := defaultStr(" ", "fallback"); got != " " {
			t.Errorf("defaultStr(' ', 'fallback') = %q, want ' '", got)
		}
	})
}
