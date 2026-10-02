package ai

import "context"

type Message struct {
	Role    string // "user" or "model"
	Content string
}

type AIRequest struct {
	SystemInstruction string
	Messages          []Message
}

type AIResponse struct {
	Text string
}

// AIProvider is the standard interface for any AI model we plug in
type AIProvider interface {
	Generate(ctx context.Context, request AIRequest) (AIResponse, error)
}
