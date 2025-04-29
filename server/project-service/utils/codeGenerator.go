package utils

import (
	"math/rand"
	"time"
)

func init() {
	rand.NewSource(time.Now().UnixNano())
}

func GenerateCode(length int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	code := make([]rune, length)
	for i := range code {
		code[i] = letters[rand.Intn(len(letters))]
	}

	return string(code)
}
