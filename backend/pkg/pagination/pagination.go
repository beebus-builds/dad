package pagination

import "strconv"

type Params struct {
	Page     int
	PageSize int
}

func Parse(pageStr, sizeStr string) Params {
	p, _ := strconv.Atoi(pageStr)
	if p < 1 {
		p = 1
	}
	s, _ := strconv.Atoi(sizeStr)
	if s < 1 || s > 100 {
		s = 20
	}
	return Params{Page: p, PageSize: s}
}

func Offset(p Params) int { return (p.Page - 1) * p.PageSize }
