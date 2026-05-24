package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func (a *app) generateImage(w http.ResponseWriter, r *http.Request) {
	var payload generateImageRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	payload.Prompt = strings.TrimSpace(payload.Prompt)
	payload.Style = strings.TrimSpace(payload.Style)
	payload.Size = strings.TrimSpace(payload.Size)
	if payload.Prompt == "" {
		writeError(w, http.StatusBadRequest, errors.New("prompt is required"))
		return
	}
	if payload.Size == "" {
		payload.Size = "1024x1024"
	}

	finalPrompt := payload.Prompt
	if payload.Style != "" {
		finalPrompt = fmt.Sprintf("%s. Style: %s", payload.Prompt, payload.Style)
	}

	provider := strings.ToLower(strings.TrimSpace(env("AI_IMAGE_PROVIDER", "openai")))
	imageBytes, err := requestGeneratedImage(r.Context(), provider, finalPrompt, payload.Size)
	if err != nil {
		writeError(w, http.StatusBadGateway, err)
		return
	}

	dir := filepath.Join(uploadDir(), "ai")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	fileName := fmt.Sprintf("ai-%d.png", time.Now().UnixNano())
	filePath := filepath.Join(dir, fileName)
	if err := os.WriteFile(filePath, imageBytes, 0o644); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	writeJSON(w, generateImageResponse{
		FileName: fileName,
		Provider: provider,
		URL:      "/api/uploads/ai/" + fileName,
		Prompt:   finalPrompt,
	})
}

func requestGeneratedImage(ctx context.Context, provider string, prompt string, size string) ([]byte, error) {
	switch provider {
	case "nvidia", "nim":
		apiKey := strings.TrimSpace(os.Getenv("NVIDIA_API_KEY"))
		if apiKey == "" {
			return nil, errors.New("NVIDIA_API_KEY is not configured")
		}
		return requestNVIDIAImage(ctx, apiKey, prompt)
	case "google", "gemini", "imagen":
		apiKey := strings.TrimSpace(os.Getenv("GOOGLE_API_KEY"))
		if apiKey == "" {
			return nil, errors.New("GOOGLE_API_KEY is not configured")
		}
		return requestGoogleImage(ctx, apiKey, prompt, size)
	case "openai", "":
		apiKey := strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))
		if apiKey == "" {
			return nil, errors.New("OPENAI_API_KEY is not configured")
		}
		return requestOpenAIImage(ctx, apiKey, prompt, size)
	default:
		return nil, fmt.Errorf("unsupported AI_IMAGE_PROVIDER: %s", provider)
	}
}

func requestOpenAIImage(ctx context.Context, apiKey string, prompt string, size string) ([]byte, error) {
	body := map[string]string{
		"model":  env("OPENAI_IMAGE_MODEL", "gpt-image-1"),
		"prompt": prompt,
		"size":   size,
	}
	rawBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.openai.com/v1/images/generations", bytes.NewReader(rawBody))
	if err != nil {
		return nil, err
	}
	request.Header.Set("Authorization", "Bearer "+apiKey)
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 90 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	rawResponse, err := io.ReadAll(io.LimitReader(response.Body, 12<<20))
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("image generation failed: %s", strings.TrimSpace(string(rawResponse)))
	}

	var result struct {
		Data []struct {
			B64JSON string `json:"b64_json"`
			URL     string `json:"url"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rawResponse, &result); err != nil {
		return nil, err
	}
	if len(result.Data) == 0 {
		return nil, errors.New("image generation returned no data")
	}
	if result.Data[0].B64JSON != "" {
		return base64.StdEncoding.DecodeString(result.Data[0].B64JSON)
	}
	if result.Data[0].URL != "" {
		return downloadGeneratedImage(ctx, result.Data[0].URL)
	}

	return nil, errors.New("image generation returned unsupported data")
}

func requestGoogleImage(ctx context.Context, apiKey string, prompt string, size string) ([]byte, error) {
	body := map[string]any{
		"instances": []map[string]string{
			{"prompt": prompt},
		},
		"parameters": map[string]any{
			"sampleCount": 1,
			"aspectRatio": googleAspectRatio(size),
		},
	}
	rawBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	model := env("GOOGLE_IMAGE_MODEL", "imagen-4.0-generate-001")
	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:predict?key=%s", model, apiKey)
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(rawBody))
	if err != nil {
		return nil, err
	}
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 90 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	rawResponse, err := io.ReadAll(io.LimitReader(response.Body, 12<<20))
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("google image generation failed: %s", strings.TrimSpace(string(rawResponse)))
	}

	var result struct {
		Predictions []struct {
			BytesBase64Encoded string `json:"bytesBase64Encoded"`
			MimeType           string `json:"mimeType"`
		} `json:"predictions"`
	}
	if err := json.Unmarshal(rawResponse, &result); err != nil {
		return nil, err
	}
	if len(result.Predictions) == 0 || result.Predictions[0].BytesBase64Encoded == "" {
		return nil, errors.New("google image generation returned no image data")
	}
	return base64.StdEncoding.DecodeString(result.Predictions[0].BytesBase64Encoded)
}

func requestNVIDIAImage(ctx context.Context, apiKey string, prompt string) ([]byte, error) {
	body := map[string]any{
		"height": 1024,
		"width":  1024,
		"text_prompts": []map[string]any{
			{
				"text":   prompt,
				"weight": 1,
			},
		},
		"cfg_scale":            5,
		"clip_guidance_preset": "NONE",
		"samples":              1,
		"steps":                25,
		"style_preset":         "none",
	}
	rawBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	endpoint := env("NVIDIA_IMAGE_ENDPOINT", "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl")
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(rawBody))
	if err != nil {
		return nil, err
	}
	request.Header.Set("Authorization", "Bearer "+apiKey)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 90 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	rawResponse, err := io.ReadAll(io.LimitReader(response.Body, 12<<20))
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("nvidia image generation failed: %s", strings.TrimSpace(string(rawResponse)))
	}

	imageBase64, err := nvidiaImageBase64(rawResponse)
	if err != nil {
		return nil, err
	}
	return base64.StdEncoding.DecodeString(stripDataURI(imageBase64))
}

func nvidiaImageBase64(rawResponse []byte) (string, error) {
	var result struct {
		B64JSON   string `json:"b64_json"`
		Base64    string `json:"base64"`
		Artifacts []struct {
			Base64  string `json:"base64"`
			B64JSON string `json:"b64_json"`
		} `json:"artifacts"`
		Data []struct {
			Base64  string `json:"base64"`
			B64JSON string `json:"b64_json"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rawResponse, &result); err != nil {
		return "", err
	}
	if result.B64JSON != "" {
		return result.B64JSON, nil
	}
	if result.Base64 != "" {
		return result.Base64, nil
	}
	for _, item := range result.Artifacts {
		if item.Base64 != "" {
			return item.Base64, nil
		}
		if item.B64JSON != "" {
			return item.B64JSON, nil
		}
	}
	for _, item := range result.Data {
		if item.B64JSON != "" {
			return item.B64JSON, nil
		}
		if item.Base64 != "" {
			return item.Base64, nil
		}
	}
	return "", errors.New("nvidia image generation returned no image data")
}

func stripDataURI(value string) string {
	if index := strings.Index(value, ","); strings.HasPrefix(value, "data:") && index >= 0 {
		return value[index+1:]
	}
	return value
}

func googleAspectRatio(size string) string {
	switch size {
	case "1024x1536":
		return "3:4"
	case "1536x1024":
		return "4:3"
	default:
		return "1:1"
	}
}

func downloadGeneratedImage(ctx context.Context, imageURL string) ([]byte, error) {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, imageURL, nil)
	if err != nil {
		return nil, err
	}
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("download generated image failed with status %d", response.StatusCode)
	}
	return io.ReadAll(io.LimitReader(response.Body, 12<<20))
}
