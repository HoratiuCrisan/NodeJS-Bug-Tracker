package utils

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func ValidateBody(r *http.Request, data any) error {
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		return err
	}

	return validate.Struct(data)
}

func ValidateParams(data any) error {
	return validate.Struct(data)
}
