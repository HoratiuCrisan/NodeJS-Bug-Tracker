package utils

import (
	"encoding/json"
	"net/http"

	"github.com/horatiucrisan/project-service/model"
)

// EncodeData retrieves the data from the controller layer and encodes it
//
// Parameters:
//   - w: The response writter of the method
//   - r: The method request
//   - data: The data to be encoded
//
// Returns:
//   - error: An error that occured during the encoding process
func EncodeData(w http.ResponseWriter, r *http.Request, data any) error {
	// Set the header of the response to a json format
	w.Header().Set("Content-Type", "application/json")

	// Set the http status for the response
	w.WriteHeader(http.StatusCreated)

	encodedResponse := model.EncodedResponse{
		Success: true,
		Message: "Data encoded successfully",
		Data:    data,
	}

	// Encode the data into the JSON format
	if err := json.NewEncoder(w).Encode(encodedResponse); err != nil {
		return err
	}

	return nil
}
