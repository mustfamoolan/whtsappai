package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	
	"app/app/models"
	"app/bootstrap"
)

type GeminiProvider struct {
	APIKey string
	Model  string
}

func NewGeminiProvider(apiKey string) *GeminiProvider {
	model := "gemini-1.5-flash"
	if bootstrap.DB != nil {
		var settings models.SystemSettings
		if err := bootstrap.DB.First(&settings).Error; err == nil {
			if apiKey == "" && settings.GeminiAPIKey != "" {
				apiKey = settings.GeminiAPIKey
			}
			if settings.GeminiModel != "" {
				model = settings.GeminiModel
			}
		}
	}
	if apiKey == "" {
		apiKey = os.Getenv("GEMINI_API_KEY")
	}
	return &GeminiProvider{APIKey: apiKey, Model: model}
}

func (g *GeminiProvider) Generate(ctx context.Context, request AIRequest) (AIResponse, error) {
	if g.APIKey == "" {
		return AIResponse{}, errors.New("gemini api key is not set")
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", g.Model, g.APIKey)

	// Build the payload
	type Part struct {
		Text string `json:"text"`
	}
	type Content struct {
		Role  string `json:"role"`
		Parts []Part `json:"parts"`
	}

	type Payload struct {
		SystemInstruction *Content  `json:"systemInstruction,omitempty"`
		Contents          []Content `json:"contents"`
	}

	payload := Payload{
		Contents: make([]Content, 0, len(request.Messages)),
	}

	if request.SystemInstruction != "" {
		payload.SystemInstruction = &Content{
			Role: "user", // The API requires this wrapper for systemInstruction
			Parts: []Part{
				{Text: request.SystemInstruction},
			},
		}
	}

	var lastRole string
	for _, msg := range request.Messages {
		role := msg.Role
		if role != "user" && role != "model" {
			role = "user"
		}
		
		if role == lastRole && len(payload.Contents) > 0 {
			// Append to the last Content's Parts
			lastIdx := len(payload.Contents) - 1
			payload.Contents[lastIdx].Parts = append(payload.Contents[lastIdx].Parts, Part{Text: "\n" + msg.Content})
		} else {
			// Create new Content
			payload.Contents = append(payload.Contents, Content{
				Role: role,
				Parts: []Part{
					{Text: msg.Content},
				},
			})
			lastRole = role
		}
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return AIResponse{}, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jsonBytes))
	if err != nil {
		return AIResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return AIResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return AIResponse{}, fmt.Errorf("gemini api error, status code: %d", resp.StatusCode)
	}

	var result struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return AIResponse{}, err
	}

	if len(result.Candidates) > 0 && len(result.Candidates[0].Content.Parts) > 0 {
		return AIResponse{
			Text: result.Candidates[0].Content.Parts[0].Text,
		}, nil
	}

	return AIResponse{}, errors.New("empty response from gemini")
}
