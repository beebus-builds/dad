package repository

// Package repository defines the storage contracts (ports) for every
// aggregate in the system. Each aggregate group lives in its own file to
// keep interfaces colocated with the entities they serve.
//
//   - user.go            — identity, sessions, resets, verification
//   - content.go         — pages, menus, news, events, documents, trainings
//   - engagement.go      — members, branches, complaints, donations
//   - legal.go           — legal cases, incidents
//   - notification.go    — notifications, audit logs
//   - public.go          — public registrations, member applications, contacts
