package main

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const maxUploadSize = 12 << 20

type uploadResponse struct {
	FileName string `json:"fileName"`
	URL      string `json:"url"`
	Type     string `json:"type"`
}

func (a *app) uploadMedia(w http.ResponseWriter, r *http.Request) {
	user, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}

	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid multipart upload"))
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("file is required"))
		return
	}
	defer file.Close()

	head := make([]byte, 512)
	n, _ := io.ReadFull(file, head)
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("uploaded file is not seekable"))
		return
	}

	contentType := http.DetectContentType(head[:n])
	mediaType, ext, ok := uploadKind(contentType, header.Filename)
	if !ok {
		writeError(w, http.StatusBadRequest, errors.New("only image or audio uploads are supported"))
		return
	}

	dir := filepath.Join(uploadDir(), mediaType, user.ID)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	path := filepath.Join(dir, fileName)
	out, err := os.Create(path)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, io.LimitReader(file, maxUploadSize)); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	writeJSON(w, uploadResponse{
		FileName: fileName,
		URL:      fmt.Sprintf("/api/uploads/%s/%s/%s", mediaType, user.ID, fileName),
		Type:     mediaType,
	})
}

func uploadKind(contentType string, fileName string) (string, string, bool) {
	ext := strings.ToLower(filepath.Ext(fileName))
	switch {
	case strings.HasPrefix(contentType, "image/"):
		if ext == "" || ext == ".jfif" {
			ext = ".jpg"
		}
		return "images", ext, true
	case strings.HasPrefix(contentType, "audio/"):
		if ext == "" {
			ext = ".mp3"
		}
		return "audio", ext, true
	default:
		return "", "", false
	}
}
