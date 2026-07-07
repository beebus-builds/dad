package usecase

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func intPtr(i int) *int {
	if i == 0 {
		return nil
	}
	return &i
}

func defaultStr(s, def string) string {
	if s == "" {
		return def
	}
	return s
}
