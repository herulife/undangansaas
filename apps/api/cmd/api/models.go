package main

import "time"

type template struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Category  string    `json:"category"`
	CreatedAt time.Time `json:"createdAt"`
}

type invitation struct {
	ID           string    `json:"id"`
	Slug         string    `json:"slug"`
	Couple       string    `json:"couple"`
	Template     string    `json:"template"`
	TemplateSlug string    `json:"templateSlug"`
	EventDate    string    `json:"eventDate"`
	Status       string    `json:"status"`
	RSVPCount    int       `json:"rsvpCount"`
	CreatedAt    time.Time `json:"createdAt"`
}

type createInvitationRequest struct {
	Slug         string `json:"slug"`
	Couple       string `json:"couple"`
	TemplateSlug string `json:"templateSlug"`
	EventDate    string `json:"eventDate"`
}

type updateInvitationRequest struct {
	Couple    string `json:"couple"`
	EventDate string `json:"eventDate"`
	Status    string `json:"status"`
}

type rsvpRequest struct {
	Name    string `json:"name"`
	Message string `json:"message"`
	Status  string `json:"status"`
	Guests  int    `json:"guests"`
}

type rsvp struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	Guests    int       `json:"guests"`
	CreatedAt time.Time `json:"createdAt"`
}

type generateImageRequest struct {
	Prompt string `json:"prompt"`
	Style  string `json:"style"`
	Size   string `json:"size"`
}

type generateImageResponse struct {
	FileName string `json:"fileName"`
	Provider string `json:"provider"`
	URL      string `json:"url"`
	Prompt   string `json:"prompt"`
}
