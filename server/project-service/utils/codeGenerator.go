package utils

import (
	"math/rand"
	"time"
)

// initialize the random variable
func init() {
	rand.NewSource(time.Now().UnixNano())
}

// GenerateCode retrieves data from the service layer and generates a unique code
//
// Parameters:
//   - length: The length of the code
//
// Returns:
//   - string: The generated code
func GenerateCode(length int) string {
	// Set the available characters to the upper and lowercase letters and all the positive digits
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	// create a rune with the selected length
	code := make([]rune, length)
	for i := range code {
		// For each position generate a random character
		code[i] = letters[rand.Intn(len(letters))]
	}

	// Return the generated code
	return string(code)
}
