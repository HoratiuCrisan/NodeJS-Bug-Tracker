package utils

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
)

// Create a new go structure validator
var validate = validator.New()

// ValidateBody retrieves a request and some data an validates the reqeust body and the data
//
// Parameters:
//   - r: The http request
//   - data: The data to be validated
func ValidateBody(r *http.Request, data any) error {
	// Decode the data from the body of the request
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		return err
	}

	// Validate the data as a structure
	if err := validate.Struct(data); err != nil {
		return err
	}

	return nil
}

// ValidateParams retrieves some data and validates the data as a strucutre
//
// Paramters:
//   - data: The data to be validated
//
// Returns:
//   - error: An error that occured during the process
func ValidateParams(data any) error {
	if err := validate.Struct(data); err != nil {
		return err
	}

	return nil
}
