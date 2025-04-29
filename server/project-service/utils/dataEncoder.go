package utils

import (
	"encoding/json"
	"net/http"
)

func EncodeData(w http.ResponseWriter, r *http.Request, data any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		return err
	}

	return nil
}
