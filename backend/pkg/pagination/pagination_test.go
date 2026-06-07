package pagination

import "testing"

func TestParse(t *testing.T) {
	cases := []struct {
		page, size string
		wantP, wantS int
	}{
		{"1", "10", 1, 10},
		{"", "", 1, 20},
		{"0", "0", 1, 20},
		{"-5", "-1", 1, 20},
		{"3", "500", 3, 20},
		{"abc", "xyz", 1, 20},
		{"2", "25", 2, 25},
		{"10", "100", 10, 100},
	}
	for _, tc := range cases {
		got := Parse(tc.page, tc.size)
		if got.Page != tc.wantP || got.PageSize != tc.wantS {
			t.Errorf("Parse(%q,%q) = {%d,%d}, want {%d,%d}", tc.page, tc.size, got.Page, got.PageSize, tc.wantP, tc.wantS)
		}
	}
}

func TestOffset(t *testing.T) {
	cases := []struct {
		p    Params
		want int
	}{
		{Params{Page: 1, PageSize: 20}, 0},
		{Params{Page: 2, PageSize: 20}, 20},
		{Params{Page: 5, PageSize: 50}, 200},
		{Params{Page: 0, PageSize: 20}, -20},
	}
	for _, tc := range cases {
		if got := Offset(tc.p); got != tc.want {
			t.Errorf("Offset(%v) = %d, want %d", tc.p, got, tc.want)
		}
	}
}
