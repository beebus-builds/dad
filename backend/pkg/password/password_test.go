package password

import "testing"

func TestHashAndVerify(t *testing.T) {
	plain := "Admin@123"
	hash, err := Hash(plain)
	if err != nil {
		t.Fatalf("Hash failed: %v", err)
	}
	if hash == "" {
		t.Fatal("expected non-empty hash")
	}
	if hash == plain {
		t.Fatal("hash should not equal plaintext")
	}
	if !Verify(hash, plain) {
		t.Error("Verify should return true for correct password")
	}
}

func TestVerifyFailsForWrongPassword(t *testing.T) {
	hash, _ := Hash("Correct1Password")
	if Verify(hash, "Wrong1Password") {
		t.Error("Verify should return false for incorrect password")
	}
}

func TestHashProducesUniqueValues(t *testing.T) {
	h1, _ := Hash("Same1Password")
	h2, _ := Hash("Same1Password")
	if h1 == h2 {
		t.Error("bcrypt hashes should differ for the same input due to salt")
	}
}
